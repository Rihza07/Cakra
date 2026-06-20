import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {

    const { email, password } =
      await req.json();

    const [rows]: any =
      await db.query(
        "SELECT * FROM users WHERE email=?",
        [email]
      );

    const user = rows[0];

console.log("EMAIL:", email);
console.log("PASSWORD:", password);
console.log("USER:", user);
    
    if (!user) {
      return NextResponse.json(
        {
          error: "Email tidak ditemukan"
        },
        {
          status: 401
        }
      );
    }

    const valid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!valid) {
      return NextResponse.json(
        {
          error: "Password salah"
        },
        {
          status: 401
        }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    return NextResponse.json(
      {
        error: "Server Error"
      },
      {
        status: 500
      }
    );

  }
  
}