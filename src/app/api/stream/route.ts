import type { NextRequest } from "next/server";
import { fetchFxQuote, fetchStockQuotes } from "@/lib/naver";

export const dynamic = "force-dynamic";
// Vercel 서버리스 함수 최대 실행 시간. 이 시간이 지나면 스트림을 닫고
// 브라우저 EventSource가 자동으로 재접속한다.
export const maxDuration = 60;

const POLL_MS = 2_000; // 서버 → 네이버 폴링 주기
const STREAM_LIFETIME_MS = 55_000; // maxDuration보다 약간 짧게

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let last = "";
      const deadline = Date.now() + STREAM_LIFETIME_MS;

      const enqueue = (chunk: string): boolean => {
        try {
          controller.enqueue(encoder.encode(chunk));
          return true;
        } catch {
          return false; // 클라이언트가 이미 끊은 경우
        }
      };

      while (Date.now() < deadline && !req.signal.aborted) {
        try {
          const [quotes, fx] = await Promise.all([
            fetchStockQuotes(),
            fetchFxQuote(),
          ]);
          // tradedAt은 값이 안 변해도 매번 갱신되므로 중복 판정에서 제외
          const key = JSON.stringify([
            quotes.map((q) => [q.code, q.price, q.change, q.volume, q.marketStatus]),
            fx.price,
            fx.change,
            fx.round,
          ]);
          if (key !== last) {
            // 값이 실제로 변했을 때만 push
            last = key;
            const payload = JSON.stringify({
              quotes,
              fx,
              updatedAt: new Date().toISOString(),
            });
            if (!enqueue(`data: ${payload}\n\n`)) break;
          } else {
            // 변화 없음 - 연결 유지용 주석 프레임
            if (!enqueue(`: keep-alive\n\n`)) break;
          }
        } catch {
          // 네이버 API 일시 오류 - 다음 주기에 재시도
          if (!enqueue(`: retry\n\n`)) break;
        }
        await sleep(POLL_MS);
      }

      try {
        controller.close();
      } catch {
        // 이미 닫힘
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
