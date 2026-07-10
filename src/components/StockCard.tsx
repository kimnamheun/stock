"use client";

import type { StockQuote } from "@/lib/types";
import { flashClass, usePriceFlash } from "@/lib/usePriceFlash";

const nf = new Intl.NumberFormat("ko-KR");

export function changeColor(change: number): string {
  if (change > 0) return "text-red-400";
  if (change < 0) return "text-blue-400";
  return "text-gray-400";
}

export function changeArrow(change: number): string {
  if (change > 0) return "▲";
  if (change < 0) return "▼";
  return "―";
}

export default function StockCard({ quote }: { quote: StockQuote }) {
  const color = changeColor(quote.change);
  const isOpen = quote.marketStatus === "OPEN";
  const flash = usePriceFlash(quote.price);
  return (
    <div
      className={`min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 shadow-lg transition-all duration-500 sm:p-3.5 ${flashClass(flash)}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <h2 className="truncate text-xs font-bold text-slate-100 sm:text-sm">
            {quote.name}
          </h2>
          <span className="hidden text-[10px] text-slate-500 sm:inline">
            {quote.code}
          </span>
        </div>
        <span
          className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:flex ${
            isOpen
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-slate-700/40 text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOpen ? "animate-pulse bg-emerald-400" : "bg-slate-500"
            }`}
          />
          {isOpen ? "장중" : "장마감"}
        </span>
      </div>

      <div className="mt-1.5 sm:mt-2.5">
        <div className={`text-sm font-bold tabular-nums sm:text-xl ${color}`}>
          {nf.format(quote.price)}
          <span className="ml-0.5 text-[10px] font-normal text-slate-500 sm:ml-1 sm:text-xs">
            원
          </span>
        </div>
        <div
          className={`mt-0.5 text-[10px] font-medium tabular-nums sm:text-xs ${color}`}
        >
          {changeArrow(quote.change)} {nf.format(Math.abs(quote.change))} (
          {quote.changeRate > 0 ? "+" : ""}
          {quote.changeRate.toFixed(2)}%)
        </div>
      </div>

      <dl className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-0.5 border-t border-slate-800 pt-1.5 text-[10px] sm:mt-2.5 sm:grid-cols-2 sm:gap-y-1 sm:pt-2 sm:text-[11px]">
        <div className="flex justify-between">
          <dt className="text-slate-500">시가</dt>
          <dd className="tabular-nums text-slate-300">{nf.format(quote.open)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">고가</dt>
          <dd className="tabular-nums text-red-300/80">{nf.format(quote.high)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">거래량</dt>
          <dd className="tabular-nums text-slate-300">{nf.format(quote.volume)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">저가</dt>
          <dd className="tabular-nums text-blue-300/80">{nf.format(quote.low)}</dd>
        </div>
      </dl>
    </div>
  );
}
