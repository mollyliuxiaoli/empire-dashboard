export type QuoteType =
  | 'realtime'         // ETF/股票实时行情
  | 'estimated_nav'    // 基金盘中估值
  | 'confirmed_nav'    // 基金确认净值
  | 'gold_spot'        // 黄金现货
  | 'gold_paper';      // 纸黄金/积存金

export type StalenessLevel = 'fresh' | 'stale' | 'very_stale' | 'unknown';

export interface Quote {
  price: number;
  prevClose: number;
  change: number;           // 涨跌幅%
  changeAmount: number;     // 涨跌额
  high?: number;
  low?: number;
  open?: number;
  volume?: number;
  turnover?: number;

  quoteType: QuoteType;
  asOf: string;             // ISO timestamp
  source: string;
  delayHours: number;
  staleness: StalenessLevel;
  isMock: boolean;

  // QDII专用
  fxRate?: number;
  fxAsOf?: string;
  underlyingMarketDate?: string;

  // T0专用
  bid?: number;
  ask?: number;
  spread?: number;
  amplitude?: number;
}
