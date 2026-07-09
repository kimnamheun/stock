# 코스피 실시간 현황판

삼성전자 · SK하이닉스 · 현대차우 실시간 주가와 USD/KRW 환율, 미국 국채 10년/5년물 수익률 그래프를 한 화면에 보여주는 대시보드입니다.

## 실행 방법

```bat
run-dev.bat
```

브라우저에서 http://localhost:3000 접속.

> 시스템 기본 Node가 18이라 최신 Next.js(20.9+ 필요)를 못 돌립니다.
> `run-dev.bat`이 nvm에 설치된 Node v23.8.0을 해당 창에서만 PATH에 추가해 실행합니다.
> (전역 Node 버전은 건드리지 않습니다)

## 기술 스택

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Recharts (국채 수익률 차트)

## 데이터 소스

| 데이터 | 소스 | 갱신 주기 |
|---|---|---|
| 주가 (005930, 000660, 005385) | 네이버 금융 폴링 API (비공식) | 7초 |
| USD/KRW 환율 | 네이버 금융 하나은행 고시환율 (비공식) | 7초 |
| 미국 국채 10년(^TNX)/5년(^FVX) | 야후 파이낸스 차트 API (비공식) | 5분 |

외부 API는 모두 Next.js Route Handler(`src/app/api/*`)가 서버 측에서 프록시합니다 (CORS 회피 + 소스 교체 용이).

⚠️ 비공식 API이므로 스펙이 예고 없이 바뀔 수 있습니다. 개인 참고용으로만 사용하세요.

## 구조

```
src/
├── app/
│   ├── api/
│   │   ├── stocks/route.ts    # 네이버 주가 프록시
│   │   ├── fx/route.ts        # 네이버 환율 프록시
│   │   └── treasury/route.ts  # 야후 국채 수익률 프록시
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx          # 폴링 + 전체 레이아웃 (client)
│   ├── StockCard.tsx          # 종목 카드
│   ├── FxCard.tsx             # 환율 카드
│   └── YieldChart.tsx         # 국채 수익률 라인 차트
└── lib/types.ts
```
