import { NextResponse } from "next/server";
import type { FxQuote } from "@/lib/types";

export const dynamic = "force-dynamic";

// 네이버 금융 - 하나은행 고시 환율 (USD/KRW)
const NAVER_FX_URL =
  "https://m.stock.naver.com/front-api/marketIndex/productDetail?category=exchange&reutersCode=FX_USDKRW";

const num = (s: string | null | undefined): number =>
  s == null || s === "" ? 0 : Number(String(s).replace(/,/g, ""));

export async function GET() {
  try {
    const res = await fetch(NAVER_FX_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `네이버 환율 API 오류 (HTTP ${res.status})` },
        { status: 502 },
      );
    }
    const body = await res.json();
    const r = body?.result;
    if (!r) {
      return NextResponse.json(
        { error: "환율 응답 형식이 예상과 다릅니다" },
        { status: 502 },
      );
    }
    const quote: FxQuote = {
      name: r.name ?? "미국 USD",
      price: num(r.closePrice),
      change: num(r.fluctuations),
      changeRate: num(r.fluctuationsRatio),
      round: r.degreeCount ?? 0,
      tradedAt: r.localTradedAt ?? "",
    };
    return NextResponse.json({ quote, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "환율 조회 실패" },
      { status: 502 },
    );
  }
}
