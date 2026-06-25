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

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level ?? 1,
        exp: user.exp ?? 0,
        maxExp: user.max_exp ?? 500,
        streak: user.streak ?? 0,
        placementLevel: user.placement_level ?? "pemula",
        joinDate:
          user.join_date instanceof Date
            ? user.join_date.toISOString().slice(0, 10)
            : String(user.join_date ?? new Date().toISOString().slice(0, 10)),
        bio: String(user.bio ?? ""),
        loginDates: parseJsonField(user.login_dates, []),
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