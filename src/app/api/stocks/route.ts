import { NextResponse } from "next/server";
import { fetchStockQuotes } from "@/lib/naver";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await fetchStockQuotes();
    return NextResponse.json({ quotes, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "시세 조회 실패" },
      { status: 502 },
    );
  }
}
