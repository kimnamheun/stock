import { NextResponse } from "next/server";
import type { StockQuote } from "@/lib/types";

export const dynamic = "force-dynamic";

// 삼성전자, SK하이닉스, 현대차우
const STOCK_CODES = ["005930", "000660", "005385"];

const NAVER_POLLING_URL = `https://polling.finance.naver.com/api/realtime/domestic/stock/${STOCK_CODES.join(",")}`;

const num = (s: string | null | undefined): number =>
  s == null || s === "" ? 0 : Number(String(s).replace(/,/g, ""));

interface NaverStockData {
  itemCode: string;
  stockName: string;
  closePriceRaw: string;
  compareToPreviousClosePriceRaw: string;
  fluctuationsRatioRaw: string;
  openPriceRaw: string;
  highPriceRaw: string;
  lowPriceRaw: string;
  accumulatedTradingVolumeRaw: string;
  marketStatus: string;
  localTradedAt: string;
}

export async function GET() {
  try {
    const res = await fetch(NAVER_POLLING_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `네이버 시세 API 오류 (HTTP ${res.status})` },
        { status: 502 },
      );
    }
    const body = await res.json();
    const quotes: StockQuote[] = ((body.datas ?? []) as NaverStockData[]).map(
      (d) => ({
        code: d.itemCode,
        name: d.stockName,
        price: num(d.closePriceRaw),
        change: num(d.compareToPreviousClosePriceRaw),
        changeRate: num(d.fluctuationsRatioRaw),
        open: num(d.openPriceRaw),
        high: num(d.highPriceRaw),
        low: num(d.lowPriceRaw),
        volume: num(d.accumulatedTradingVolumeRaw),
        marketStatus: d.marketStatus,
        tradedAt: d.localTradedAt,
      }),
    );
    return NextResponse.json({ quotes, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "시세 조회 실패" },
      { status: 502 },
    );
  }
}
