import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const yahooFinance = new YahooFinance();

export async function GET() {

  try {

    const symbols = [
      "BBCA.JK",
      "TLKM.JK",
        "ASII.JK",
        "GOTO.JK"
    ];

    const data = await Promise.all(
      symbols.map(symbol =>
        yahooFinance.quote(symbol)
      )
    );

    for (const stock of data) {

    const [result] = await db.query(
        `
        INSERT INTO stock_history
        (symbol, price)
        VALUES (?, ?)
        `,
        [
        stock.symbol,
        stock.regularMarketPrice
        ]
    );

    console.log(
        "BERHASIL INSERT:",
        stock.symbol,
        stock.regularMarketPrice
    );
    }

    return NextResponse.json(data);

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 500
      }
    );

  }

}