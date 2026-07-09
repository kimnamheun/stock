export interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketStatus: string;
  tradedAt: string;
}

export interface FxQuote {
  name: string;
  price: number;
  change: number;
  changeRate: number;
  round: number;
  tradedAt: string;
}

export interface YieldPoint {
  time: number;
  value: number;
}

export interface TreasurySeries {
  symbol: string;
  label: string;
  current: number;
  previousClose: number;
  points: YieldPoint[];
}
