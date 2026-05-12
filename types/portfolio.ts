/**
 * Unified Portfolio Types - v4.0
 * Redesigned with transaction-based calculations and atomic holdings
 */

import { Quote } from './quote';

// ===== 核心持仓类型 =====

// Legacy holding structure for backward compatibility during v4 migration
export interface HoldingLegacy {
  code: string;
  name: string;
  type: string;              // e.g., "QDII科技", "ETF"
  assetCategory: 'fund' | 'etf' | 'gold' | 'hk_stock' | 'us_stock';

  // Position data
  holdingUnits: number;
  costPrice: number;
  lastPrice: number;
  costAmount: number;
  marketValue: number;

  // P&L data
  unrealizedPnlAmount: number;
  unrealizedPnlPercent: number;
  prevClosePrice: number;
  dailyChange: number;
  dailyChangeAmount: number;

  // Strategy
  rating: 'A' | 'B' | 'C' | 'D';
  riskLevel: 'green' | 'yellow' | 'red';
  strategy: string;
  autoInvest: number;
  triggerPrice?: number;
  isT0: boolean;

  // Metadata
  priceAsOf: string;
  priceSource: string;
  priceDelayHours: number;
  isMock: boolean;
}

// Type alias for backward compatibility
export type HoldingLegacyOrNew = HoldingLegacy | Holding;


export type InstrumentType = 'fund' | 'etf' | 'stock' | 'gold' | 'bond';
export type ProductType =
  | 'open_end_fund'      // 开放式基金
  | 'qdii_fund'          // QDII基金
  | 'index_etf'          // 指数ETF
  | 'cross_border_etf'   // 跨境ETF
  | 'a_share'            // A股
  | 'hk_stock'           // 港股
  | 'us_stock'           // 美股
  | 'physical_gold'      // 实物金
  | 'paper_gold'         // 纸黄金/积存金
  | 'gold_etf'           // 黄金ETF
  | 'convertible_bond'   // 可转债
  | 'bond';              // 债券

export interface Holding {
  code: string;
  name: string;
  instrumentType: InstrumentType;
  productType: ProductType;

  // 原子持仓数据（从Transaction派生）
  units: number;              // 持有份额/股数
  avgCostPrice: number;       // 平均成本价
  bookCostAmount: number;     // 账面成本 = units * avgCostPrice

  // 行情快照
  quote: Quote;

  // 策略
  rating: 'A' | 'B' | 'C' | 'D';
  riskLevel: 'green' | 'yellow' | 'red';
  strategy: string;
  autoInvest: number;         // 每日定投，0=暂停
  triggerPrice?: number;      // 触发价
  targetPosition?: number;    // 目标仓位金额

  // 元数据
  tags: string[];             // 如 ['QDII', '科技', '美股']
  isT0: boolean;
}

// ===== 派生计算结果（不存储） =====
export interface HoldingWithMetrics extends Holding {
  marketValue: number;
  unrealizedPnlAmount: number;
  unrealizedPnlPercent: number;
  dailyPnlAmount: number;
  dailyPnlPercent: number;
  portfolioWeight: number;    // 组合权重%
}

// ===== 黄金持仓 =====
export interface GoldHolding {
  productType: 'physical_gold' | 'paper_gold' | 'gold_etf';
  brand?: string;             // 品牌（实物金）
  units: number;              // 克数/股数
  avgCostPrice: number;       // 成本单价（元/克）
  bookCostAmount: number;     // 总成本
  quote: Quote;
  premium?: number;           // 实物金溢价
  spread?: number;            // 买卖价差
}

// ===== Portfolio Summary =====
export interface PortfolioSummary {
  totalAssets: number;
  totalBookCost?: number;
  totalMarketValue: number;
  cashBalance: number;

  // New v4 field names
  todayPnlAmount: number;
  todayPnlPercent: number;
  totalPnlAmount: number;
  totalPnlPercent: number;

  // Legacy v3 field names (aliases)
  todayChange: number;
  todayChangePercent: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;

  holdingsCount: number;
  profitableCount: number;
  losingCount: number;

  asOf: string;
}

// ===== T0 Target =====
export interface T0Target {
  code: string;
  name: string;
  price: number;               // 现价
  dailyChange: number;         // 涨跌幅%
  amplitude: number;           // 振幅%
  t0Score: number;
  status: string;
  signal: string;
  signalReason?: string;       // 信号理由
  isT0: boolean;
  isMock: boolean;
  priceAsOf: string;
  priceSource: string;
}

// ===== 待保留的其他类型 =====
export interface Macro {
  usStocks: {
    dowJones: { value: number; change: number };
    nasdaq: { value: number; change: number };
    sp500: { value: number; change: number };
    note: string;
  };
  commodities: {
    gold: { price: number; change: number; signal: string };
    silver: { price: number; change: number; signal: string };
    copper: { price: number; change: number; signal: string };
    oil: { price: number; change: number; signal: string };
  };
  isMock: boolean;
  asOf: string;
  source: string;
}

export interface PendingAction {
  action: string;
  code: string;
  trigger: string;
  priority: 'high' | 'medium' | 'low';
}

// ===== Gold Holdings (Legacy) =====
export interface Gold {
  internationalPrice: number;   // 国际金价 USD/oz
  exchangeRate: number;          // 汇率
  yuanPerGram: number;           // 国内价格 元/克
  holding: number;               // 持有克数
  value: number;                 // 总价值
  profit: number;                // 盈亏金额
  profitPercent: number;         // 盈亏百分比
  isMock: boolean;
  priceAsOf: string;
  priceSource: string;
}

// ===== History (Legacy) =====
export interface History {
  date: string;
  action: string;
  detail: string;
  status: 'done' | 'pending';
}

export interface MarketDataResult<T> {
  data: T;
  asOf: string;
  source: string;
  isMock: boolean;
  stale: boolean;
  cacheTtl: number;
  error?: string;
}
