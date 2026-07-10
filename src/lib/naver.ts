import type { FxQuote, StockQuote } from "./types";

// 삼성전자, SK하이닉스, 현대차우, TIGER 미국나스닥100, TIGER 미국S&P500
const STOCK_CODES = ["005930", "000660", "005385", "133690", "360750"];

const NAVER_POLLING_URL = `https://polling.finance.naver.com/api/realtime/domestic/stock/${STOCK_CODES.join(",")}`;

// 네이버 금융 - 하나은행 고시 환율 (USD/KRW)
const NAVER_FX_URL =
  "https://m.stock.naver.com/front-api/marketIndex/productDetail?category=exchange&reutersCode=FX_USDKRW";

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

export async function fetchStockQuotes(): Promise<StockQuote[]> {
  const res = await fetch(NAVER_POLLING_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`네이버 시세 API 오류 (HTTP ${res.status})`);
  const body = await res.json();
  return ((body.datas ?? []) as NaverStockData[]).map((d) => ({
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
  }));
}

export async function fetchFxQuote(): Promise<FxQuote> {
  const res = await fetch(NAVER_FX_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`네이버 환율 API 오류 (HTTP ${res.status})`);
  const body = await res.json();
  const r = body?.result;
  if (!r) throw new Error("환율 응답 형식이 예상과 다릅니다");
  return {
    name: r.name ?? "미국 USD",
    price: num(r.closePrice),
    change: num(r.fluctuations),
    changeRate: num(r.fluctuationsRatio),
    round: r.degreeCount ?? 0,
    tradedAt: r.localTradedAt ?? "",
  };
}
