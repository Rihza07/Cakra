import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    await db.query(
      `
      INSERT INTO challenge_15day
      (user_id, start_date)
      VALUES (?, NOW())
      `,
      [userId]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}