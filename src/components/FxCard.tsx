"use client";

import type { FxQuote } from "@/lib/types";
import { flashClass, usePriceFlash } from "@/lib/usePriceFlash";
import { changeArrow, changeColor } from "./StockCard";

const nf = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function FxCard({ quote }: { quote: FxQuote }) {
  const color = changeColor(quote.change);
  const flash = usePriceFlash(quote.price);
  return (
    <div
      className={`min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 shadow-lg transition-all duration-500 sm:p-3.5 ${flashClass(flash)}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="truncate text-xs font-bold text-slate-100 sm:text-sm">
          USD/KRW 환율
        </h2>
        <span className="hidden text-[10px] text-slate-500 sm:inline">
          하나은행 고시 {quote.round}회차
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

      {quote.tradedAt && (
        <p className="mt-1.5 border-t border-slate-800 pt-1.5 text-[10px] text-slate-500 sm:mt-2.5 sm:pt-2 sm:text-[11px]">
          고시 시각:{" "}
          {new Date(quote.tradedAt).toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
