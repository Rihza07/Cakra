import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      cash,
      holdings,
      log,
      currentDay,
      completed,
      expClaimed,
    } = body;

    await db.query(
      `
      INSERT INTO challenge_progress
      (
        user_id,
        cash,
        holdings,
        logs,
        current_day,
        completed,
        exp_claimed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        cash = VALUES(cash),
        holdings = VALUES(holdings),
        logs = VALUES(logs),
        current_day = VALUES(current_day),
        completed = VALUES(completed),
        exp_claimed = VALUES(exp_claimed)
      `,
      [
        userId,
        cash,
        JSON.stringify(holdings),
        JSON.stringify(log),
        currentDay,
        completed,
        expClaimed,
      ]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}