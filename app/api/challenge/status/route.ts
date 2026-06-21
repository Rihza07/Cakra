import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");

  const [rows]: any = await db.query(
    `
    SELECT *
    FROM challenge_15day
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length) {
    return NextResponse.json(null);
  }

  const challenge = rows[0];

  const startDate = new Date(challenge.start_date);

  const today = new Date();

  const diffTime =
    today.getTime() - startDate.getTime();

  const day =
    Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return NextResponse.json({
    currentDay: Math.min(day, 15),
    completed: day >= 15,
  });
}