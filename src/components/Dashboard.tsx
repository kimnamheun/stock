"use client";

import { useCallback, useEffect, useState } from "react";
import type { FxQuote, StockQuote, TreasurySeries } from "@/lib/types";
import StockCard from "./StockCard";
import FxCard from "./FxCard";
import YieldChart from "./YieldChart";

const SLOW_INTERVAL_MS = 300_000; // 미국 국채 수익률 (5분)

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [fx, setFx] = useState<FxQuote | null>(null);
  const [treasury, setTreasury] = useState<TreasurySeries[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [connected, setConnected] = useState(false);

  const loadTreasury = useCallback(async () => {
    try {
      const res = await fetch("/api/treasury").then((r) => r.json());
      if (res.series) setTreasury(res.series);
    } catch {
      // 국채 데이터 실패는 조용히 무시하고 다음 주기에 재시도
    }
  }, []);

  // 주가·환율: SSE 스트림 수신 (서버가 2초 간격으로 감지, 변경 시에만 push)
  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.quotes) setStocks(data.quotes);
        if (data.fx) setFx(data.fx);
        setUpdatedAt(new Date());
        setConnected(true);
      } catch {
        // 잘못된 프레임 무시
      }
    };
    // 서버가 주기적으로 스트림을 닫으면 EventSource가 자동 재접속한다
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, []);

  // 미국 국채: 5분 주기 폴링
  useEffect(() => {
    // 첫 요청도 타이머로 예약해 렌더링 effect와 상태 갱신을 분리한다.
    const initialTimer = setTimeout(loadTreasury, 0);
    const slowTimer = setInterval(loadTreasury, SLOW_INTERVAL_MS);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(slowTimer);
    };
  }, [loadTreasury]);

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
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? "animate-pulse bg-emerald-400" : "bg-amber-400"
            }`}
          />
          {connected ? "실시간 수신 중" : "재접속 중..."}
          {updatedAt &&
            ` · 마지막 변동 ${updatedAt.toLocaleTimeString("ko-KR", { hour12: false })}`}
        </p>
      </header>

      {/* 주가 3종목 + 환율 + 미국 국채 2종 (한 줄 4열) */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-4">
        {stocks.length > 0
          ? stocks.map((q) => <StockCard key={q.code} quote={q} />)
          : [0, 1, 2, 3, 4].map((i) => (
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
