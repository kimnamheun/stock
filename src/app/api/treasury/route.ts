import { NextResponse } from "next/server";
import type { TreasurySeries, YieldPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

// 야후 파이낸스 - CBOE 미국 국채 수익률 지수 (값이 % 단위 그대로 옴)
const SYMBOLS = [
  { symbol: "^TNX", label: "미국 국채 10년물" },
  { symbol: "^FVX", label: "미국 국채 5년물" },
];

interface YahooChartResult {
  meta: { regularMarketPrice: number; previousClose: number };
  timestamp?: number[];
  indicators: { quote: [{ close: (number | null)[] }] };
}

async function fetchChart(
  symbol: string,
  range: string,
): Promise<YahooChartResult | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?interval=15m&range=${range}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.chart?.result?.[0] ?? null;
}

function extractPoints(result: YahooChartResult | null): YieldPoint[] {
  if (!result?.timestamp) return [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  return result.timestamp
    .map((t, i) => ({ time: t * 1000, value: closes[i] }))
    .filter((p): p is YieldPoint => p.value != null)
    .map((p) => ({ time: p.time, value: Math.round(p.value * 1000) / 1000 }));
}

async function fetchSeries(
  symbol: string,
  label: string,
): Promise<TreasurySeries | null> {
  let result = await fetchChart(symbol, "1d");
  let points = extractPoints(result);
  if (points.length < 2) {
    // 휴장일 등으로 당일 데이터가 없으면 최근 5일에서 마지막 거래일 분량 사용
    result = await fetchChart(symbol, "5d");
    points = extractPoints(result).slice(-27);
  }
  if (!result) return null;
  return {
    symbol,
    label,
    current: result.meta.regularMarketPrice,
    previousClose: result.meta.previousClose,
    points,
  };
}

export async function GET() {
  try {
    const series = (
      await Promise.all(SYMBOLS.map((s) => fetchSeries(s.symbol, s.label)))
    ).filter((s): s is TreasurySeries => s != null);
    if (series.length === 0) {
      return NextResponse.json(
        { error: "야후 파이낸스 국채 데이터 조회 실패" },
        { status: 502 },
      );
    }
    return NextResponse.json({ series, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "국채 조회 실패" },
      { status: 502 },
    );
  }
}
