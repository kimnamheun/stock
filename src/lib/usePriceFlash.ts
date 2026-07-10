"use client";

import { useEffect, useRef, useState } from "react";

export type Flash = "up" | "down" | null;

/**
 * 값이 바뀌는 순간을 감지해 잠깐 "up"/"down"을 반환한다 (700ms 후 자동 해제).
 * 증권사 HTS의 체결 플래시 효과용.
 */
export function usePriceFlash(value: number): Flash {
  const [flash, setFlash] = useState<Flash>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    setFlash(value > prev.current ? "up" : "down");
    prev.current = value;
    const timer = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(timer);
  }, [value]);

  return flash;
}

export function flashClass(flash: Flash): string {
  if (flash === "up") return "bg-red-500/15 ring-1 ring-red-400/50";
  if (flash === "down") return "bg-blue-500/15 ring-1 ring-blue-400/50";
  return "";
}
