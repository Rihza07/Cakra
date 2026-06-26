import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

function parseJsonField(value: unknown, fallback: unknown) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

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

function normalizeLoginDates(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string"))).sort();
}

function isLocalDateYesterday(previous: string, current: string) {
  const prev = new Date(`${previous}T00:00:00`);
  const curr = new Date(`${current}T00:00:00`);
  const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  return diff === 1;
}

function computeCurrentStreak(loginDates: string[]) {
  const dates = normalizeLoginDates(loginDates);
  if (dates.length === 0) return 0;

  let chainLength = 1;
  for (let i = dates.length - 1; i > 0; i -= 1) {
    if (isLocalDateYesterday(dates[i - 1], dates[i])) {
      chainLength += 1;
    } else {
      break;
    }
  }

  return chainLength;
}

function computeLongestStreak(loginDates: string[]) {
  const dates = normalizeLoginDates(loginDates);
  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i += 1) {
    if (isLocalDateYesterday(dates[i - 1], dates[i])) {
      current += 1;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }

  return Math.max(longest, current);
}

export async function POST(req: Request) {
  try {
    const { email, password, timezone } = await req.json();

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email=?",
      [email],
    );

    const user = rows[0] as RowDataPacket | undefined;
    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, String(user.password));
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const userTimeZone = typeof timezone === "string" && timezone
      ? timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = formatDateInTimeZone(new Date(), userTimeZone);
    const existingLoginDates = normalizeLoginDates(parseJsonField(user.login_dates, []));
    const nextLoginDates = Array.from(new Set([...existingLoginDates, today])).sort();
    const streak = computeCurrentStreak(nextLoginDates);
    const longestStreak = computeLongestStreak(nextLoginDates);

    await db.query(
      "UPDATE users SET login_dates = ?, streak = ? WHERE id = ?",
      [JSON.stringify(nextLoginDates), streak, user.id],
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level ?? 1,
        exp: user.exp ?? 0,
        maxExp: user.max_exp ?? 500,
        streak,
        longestStreak,
        placementLevel: user.placement_level ?? "pemula",
        joinDate:
          user.join_date instanceof Date
            ? user.join_date.toISOString().slice(0, 10)
            : String(user.join_date ?? new Date().toISOString().slice(0, 10)),
        bio: String(user.bio ?? ""),
        loginDates: nextLoginDates,
        completedModules: parseJsonField(user.completed_modules, []),
        completedModuleDates: parseJsonField(user.completed_module_dates, {}),
        dailyXpHistory: parseJsonField(user.daily_xp_history, {}),
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Server Error"
      },
      {
        status: 500,
      }
    );
  }
  
}