import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } =
    new URL(req.url);

  const userId =
    searchParams.get("userId");

  const [rows]: any =
    await db.query(
      `
      SELECT *
      FROM challenge_progress
      WHERE user_id = ?
      `,
      [userId]
    );

  return NextResponse.json(
    rows[0] || null
  );
}