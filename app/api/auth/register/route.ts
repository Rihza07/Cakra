import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // cek email sudah ada atau belum
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user
    await db.query(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hashedPassword]
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