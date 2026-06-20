import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {

    const { searchParams } =
      new URL(req.url);

    const symbol =
      searchParams.get("symbol");

    const [rows]: any =
      await db.query(
        `
        SELECT
          price,
          created_at
        FROM stock_history
        WHERE symbol = ?
        ORDER BY created_at ASC
        LIMIT 100
        `,
        [symbol]
      );

    return NextResponse.json(rows);

  } catch (error) {

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );

  }
}