import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // cek email sudah ada atau belum
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user dengan field statistik default
    await db.query(
      "INSERT INTO users (name,email,password,level,exp,max_exp,streak,placement_level,join_date,bio,login_dates,completed_modules,completed_module_dates,daily_xp_history) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        name,
        email,
        hashedPassword,
        1,
        0,
        500,
        0,
        "pemula",
        new Date().toISOString().slice(0, 10),
        "",
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify({}),
        JSON.stringify({}),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Register berhasil",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}