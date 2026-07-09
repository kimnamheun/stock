"use client";

import { useCallback, useEffect, useState } from "react";
import type { FxQuote, StockQuote, TreasurySeries } from "@/lib/types";
import StockCard from "./StockCard";
import FxCard from "./FxCard";
import YieldChart from "./YieldChart";

const FAST_INTERVAL_MS = 7_000; // 주가·환율 (네이버 권장 폴링 주기)
const SLOW_INTERVAL_MS = 300_000; // 미국 국채 수익률 (5분)

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [fx, setFx] = useState<FxQuote | null>(null);
  const [treasury, setTreasury] = useState<TreasurySeries[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFast = useCallback(async () => {
    try {
      const [stockRes, fxRes] = await Promise.all([
        fetch("/api/stocks").then((r) => r.json()),
        fetch("/api/fx").then((r) => r.json()),
      ]);
      if (stockRes.quotes) setStocks(stockRes.quotes);
      if (fxRes.quote) setFx(fxRes.quote);
      setUpdatedAt(new Date());
      setError(stockRes.error ?? fxRes.error ?? null);
    } catch {
      setError("데이터를 불러오지 못했습니다. 네트워크를 확인해주세요.");
    }
  }, []);

  const loadTreasury = useCallback(async () => {
    try {
      const res = await fetch("/api/treasury").then((r) => r.json());
      if (res.series) setTreasury(res.series);
    } catch {
      // 국채 데이터 실패는 조용히 무시하고 다음 주기에 재시도
    }
  }, []);

  useEffect(() => {
    loadFast();
    loadTreasury();
    const fastTimer = setInterval(loadFast, FAST_INTERVAL_MS);
    const slowTimer = setInterval(loadTreasury, SLOW_INTERVAL_MS);
    return () => {
      clearInterval(fastTimer);
      clearInterval(slowTimer);
    };
  }, [loadFast, loadTreasury]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">
            코스피 실시간 현황판
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            네이버 금융 시세 · 하나은행 고시환율 · 야후 파이낸스 국채 수익률
          </p>
        </div>
        {updatedAt && (
          <p className="text-xs text-slate-500">
            마지막 갱신{" "}
            {updatedAt.toLocaleTimeString("ko-KR", { hour12: false })} (7초마다
            자동 갱신)
          </p>
        )}
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
          {error}
        </div>
      )}

      {/* 주가 3종목 + 환율 + 미국 국채 2종 (한 줄 4열) */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-4">
        {stocks.length > 0
          ? stocks.map((q) => <StockCard key={q.code} quote={q} />)
          : [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40"
              />
            ))}
        {fx ? (
          <FxCard quote={fx} />
        ) : (
          <div className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
        )}
        {treasury.length > 0
          ? treasury.map((s) => <YieldChart key={s.symbol} series={s} />)
          : [0, 1].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40"
              />
            ))}
      </section>

      <footer className="mt-8 text-center text-xs text-slate-600">
        주가·환율은 네이버 금융, 국채 수익률은 야후 파이낸스(CBOE 지수) 기준의
        참고용 시세입니다.
      </footer>
    </main>
  );
}
