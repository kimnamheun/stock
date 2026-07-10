import { NextResponse } from "next/server";
import { fetchFxQuote } from "@/lib/naver";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quote = await fetchFxQuote();
    return NextResponse.json({ quote, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "환율 조회 실패" },
      { status: 502 },
    );
  }
}
