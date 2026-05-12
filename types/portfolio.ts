/**
 * Unified Portfolio Types - v3.0
 * Redesigned data model with consistent field naming and calculation logic
 */

export interface Holding {
  code: string;
  name: string;
  type: string;
  assetCategory: 'fund' | 'etf' | 'gold' | 'hk_stock' | 'us_stock';

  // Position data
  holdingUnits: number;       // Shares/units held
  costPrice: number;           // Cost per unit
  lastPrice: number;           // Latest price (NAV/market price)
  costAmount: number;          // Total cost = holdingUnits * costPrice
  marketValue: number;         // Current market value = holdingUnits * lastPrice

  // P&L
  unrealizedPnlAmount: number; // Unrealized P&L amount = marketValue - costAmount
  unrealizedPnlPercent: number;// Unrealized P&L % = (marketValue - costAmount) / costAmount * 100

  // Daily changes
  prevClosePrice: number;      // Previous close price
  dailyChange: number;         // Daily change %
  dailyChangeAmount: number;   // Daily P&L amount = marketValue - (holdingUnits * prevClosePrice)

  // Strategy
  rating: 'A' | 'B' | 'C' | 'D';
  riskLevel: 'green' | 'yellow' | 'red';
  strategy: string;
  autoInvest: number;          // Daily auto-invest amount, 0 = paused
  triggerPrice?: number;       // Trigger price
  isT0: boolean;               // Whether suitable for T0 trading

  // Data metadata
  priceAsOf: string;           // Price timestamp "2026-05-12 10:30"
  priceSource: string;         // "天天基金估值" | "实时行情" | "QDII延迟T+1"
  priceDelayHours: number;     // Delay in hours (QDII may be 24-48h)
  isMock: boolean;             // Whether this is mock data
}

export interface T0Target {
  code: string;
  name: string;
  price: number;
  dailyChange: number;
  amplitude: number;
  t0Score: number;
  status: string;
  signal: string;
  isT0: boolean;
  isMock: boolean;
  priceAsOf: string;
  priceSource: string;
}

export interface Gold {
  internationalPrice: number;
  exchangeRate: number;
  yuanPerGram: number;
  holding: number;
  value: number;
  profit: number;
  profitPercent: number;
  isMock: boolean;
  priceAsOf: string;
  priceSource: string;
}

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

export interface History {
  date: string;
  action: string;
  detail: string;
  status: 'done' | 'pending';
}

export interface PortfolioSummary {
  totalAssets: number;
  cashBalance: number;
  todayChange: number;
  todayChangePercent: number;
  totalCost: number;
  totalMarketValue: number;
  totalProfit: number;
  totalProfitPercent: number;
  asOf: string;
}

export interface MarketData {
  data: any;
  asOf: string;
  source: string;
  isMock: boolean;
}
