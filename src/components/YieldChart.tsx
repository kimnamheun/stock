"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TreasurySeries } from "@/lib/types";
import { changeArrow, changeColor } from "./StockCard";

function formatKst(ms: number): string {
  return new Date(ms).toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function YieldChart({ series }: { series: TreasurySeries }) {
  const change =
    Math.round((series.current - series.previousClose) * 1000) / 1000;
  const color = changeColor(change);
  const lineColor = change > 0 ? "#f87171" : change < 0 ? "#60a5fa" : "#94a3b8";

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 shadow-lg sm:p-3.5">
      <div className="flex items-baseline justify-between">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <h2 className="truncate text-xs font-bold text-slate-100 sm:text-sm">
            {series.label}
          </h2>
          <span className="hidden text-[10px] text-slate-500 sm:inline">
            {series.symbol}
          </span>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold tabular-nums sm:text-lg ${color}`}>
            {series.current.toFixed(3)}
            <span className="ml-0.5 text-[10px] font-normal text-slate-500 sm:text-xs">
              %
            </span>
          </div>
          <div
            className={`text-[10px] font-medium tabular-nums sm:text-[11px] ${color}`}
          >
            {changeArrow(change)} {Math.abs(change).toFixed(3)}%p
          </div>
        </div>
      </div>

      <div className="mt-1.5 h-24 sm:mt-2.5 sm:h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series.points}
            margin={{ top: 5, right: 5, bottom: 0, left: -10 }}
          >
            <XAxis
              dataKey="time"
              tickFormatter={formatKst}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={["dataMin - 0.02", "dataMax + 0.02"]}
              tickFormatter={(v: number) => v.toFixed(2)}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94a3b8" }}
              labelFormatter={(ms) => `${formatKst(ms as number)} (KST)`}
              formatter={(value) => [`${Number(value).toFixed(3)}%`, "수익률"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
