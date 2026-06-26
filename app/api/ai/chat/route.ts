import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const DAILY_LIMIT = 30;
const GUEST_DAILY_LIMIT = 5;
const rateLimitMap = new Map<string, number[]>();

function formatDateInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function sanitizePrompt(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entries = rateLimitMap.get(key) ?? [];
  const active = entries.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (active.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  active.push(now);
  rateLimitMap.set(key, active);
  return true;
}

async function ensureAiUsageTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      questions_today INT NOT NULL DEFAULT 0,
      last_reset_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function getOrCreateUsage(userId: number, today: string) {
  await ensureAiUsageTable();

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, questions_today, last_reset_date FROM ai_usage WHERE user_id = ?",
    [userId],
  );

  const existing = rows[0] as RowDataPacket | undefined;
  if (!existing) {
    await db.query(
      "INSERT INTO ai_usage (user_id, questions_today, last_reset_date) VALUES (?, ?, ?)",
      [userId, 0, today],
    );
    return { questions_today: 0, last_reset_date: today };
  }

  if (String(existing.last_reset_date) !== today) {
    await db.query(
      "UPDATE ai_usage SET questions_today = 0, last_reset_date = ? WHERE user_id = ?",
      [today, userId],
    );
    return { questions_today: 0, last_reset_date: today };
  }

  return {
    questions_today: Number(existing.questions_today ?? 0),
    last_reset_date: String(existing.last_reset_date ?? today),
  };
}

async function incrementUsage(userId: number, today: string) {
  await db.query(
    "UPDATE ai_usage SET questions_today = questions_today + 1, last_reset_date = ? WHERE user_id = ?",
    [today, userId],
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = sanitizePrompt(body?.message);

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Please enter a question." },
        { status: 400 },
      );
    }

    const userEmail = typeof body?.userEmail === "string" ? body.userEmail.trim() : "";
    const guestId = typeof body?.guestId === "string" ? body.guestId.trim() : "";
    const timezone = typeof body?.timezone === "string" && body.timezone
      ? body.timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;

    const clientIp = getClientIp(req);
    const rateLimitKey = userEmail || guestId || clientIp;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const today = formatDateInTimeZone(new Date(), timezone);

    let userId: number | null = null;
    if (userEmail) {
      const [users] = await db.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [userEmail],
      );

      const foundUser = users[0] as RowDataPacket | undefined;
      if (foundUser) {
        userId = Number(foundUser.id);
      }
    }

    if (userId) {
      const usage = await getOrCreateUsage(userId, today);
      if (usage.questions_today >= DAILY_LIMIT) {
        return NextResponse.json(
          { success: false, error: "Daily AI limit reached." },
          { status: 403 },
        );
      }

      await incrementUsage(userId, today);
    } else {
      const cookieStore = await cookies();
      const guestCookieName = "cakra_ai_guest_usage";
      const guestCookie = cookieStore.get(guestCookieName)?.value;

      let guestUsage = { guestId: guestId || `guest-${clientIp}`, questionsToday: 0, lastResetDate: today };
      if (guestCookie) {
        try {
          const parsed = JSON.parse(guestCookie);
          if (parsed && typeof parsed === "object") {
            guestUsage = {
              guestId: typeof parsed.guestId === "string" ? parsed.guestId : guestUsage.guestId,
              questionsToday: Number(parsed.questionsToday ?? 0),
              lastResetDate: String(parsed.lastResetDate ?? today),
            };
          }
        } catch {
          guestUsage = { guestId: guestId || `guest-${clientIp}`, questionsToday: 0, lastResetDate: today };
        }
      }

      if (guestUsage.lastResetDate !== today) {
        guestUsage = { guestId: guestUsage.guestId, questionsToday: 0, lastResetDate: today };
      }

      if (guestUsage.questionsToday >= GUEST_DAILY_LIMIT) {
        return NextResponse.json(
          { success: false, error: "Daily AI limit reached." },
          { status: 403 },
        );
      }

      guestUsage.questionsToday += 1;
      cookieStore.set(guestCookieName, JSON.stringify(guestUsage), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI service is not configured right now. Please set GEMINI_API_KEY or GOOGLE_API_KEY.",
        },
        { status: 503 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are CAKRA AI, a friendly Indonesian financial literacy assistant. Respond helpfully, clearly, and concisely. Do not give personalized investment advice. If the user asks for financial advice, provide educational information and encourage careful research. User question: ${message}`;

    const responsePromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), 15000);
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    const reply = typeof response?.text === "string" ? response.text.trim() : "";

    if (!reply) {
      return NextResponse.json(
        { success: false, error: "AI did not return a response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      reply,
      xpAwarded: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("API_KEY") || message.includes("permission") || message.includes("INVALID_ARGUMENT")) {
      return NextResponse.json(
        { success: false, error: "AI service is currently unavailable. Please try again later." },
        { status: 503 },
      );
    }

    if (message === "timeout") {
      return NextResponse.json(
        { success: false, error: "The AI request timed out. Please try again." },
        { status: 504 },
      );
    }

    if (message.includes("429") || message.includes("rate limit")) {
      return NextResponse.json(
        { success: false, error: "The AI service is temporarily rate limited. Please try again shortly." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { success: false, error: "AI is currently unavailable. Please try again later." },
      { status: 502 },
    );
  }
}
