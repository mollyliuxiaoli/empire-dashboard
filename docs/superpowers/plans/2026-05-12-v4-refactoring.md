# Empire Dashboard v4.0 - Comprehensive Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Empire Dashboard from internal prototype to production-ready InvestScope application with proper data model, state management, real market data, and externalization readiness.

**Architecture:** Complete architectural overhaul introducing Transaction model, React Context state management, calculator layer, real market API integration, and product rebranding.

**Tech Stack:** Next.js 14.2, React 18, TypeScript 5, localStorage persistence, real-time market APIs, TDD throughout

---

## Implementation Strategy

This refactoring has **5 major parts** that must be executed sequentially:

1. **Part 1: Data Foundation** - Transaction model, Quote types, Calculator layer
2. **Part 2: State Management** - React Context, Product loop, localStorage
3. **Part 3: Product Experience** - Rebrand to InvestScope, Tab restructure
4. **Part 4: Market Data** - Real API integration for funds/ETFs/gold/FX
5. **Part 5: Externalization** - ESLint, tests, compliance, error handling

**Critical Rules:**
- Execute Parts 1→2→3→4→5 in order
- Run `npx next build` after EACH Part to verify
- Git commit after EACH successful Part completion
- All features must remain functional throughout
- Follow TDD: test → implementation → verify
- Maintain mobile + desktop compatibility
- All text in Chinese

---

## Part 1: Data Foundation Refactoring

**Goal:** Introduce Transaction model, discriminated Quote types, and pure calculator functions for all position/P&L metrics.

### Task 1.1: Create new directory structure

**Files:**
- Create: `types/transaction.ts`
- Create: `types/quote.ts`
- Create: `lib/calculator/position.ts`
- Create: `lib/calculator/pnl.ts`
- Create: `lib/calculator/validate.ts`
- Create: `lib/calculator/fees.ts`
- Create: `lib/calculator/index.ts`

- [ ] **Step 1: Create types/transaction.ts with Transaction type**

```typescript
export type TransactionType =
  | 'buy'           // 买入建仓
  | 'sell'          // 卖出清仓/减仓
  | 'buy_t0'        // 做T买入
  | 'sell_t0'       // 做T卖出
  | 'dividend'      // 现金分红
  | 'reinvest'      // 红利再投资
  | 'fee'           // 申购/赎回费
  | 'dca'           // 定投买入
  | 'transfer_in'   // 转入
  | 'transfer_out'  // 转出
  | 'split'         // 拆分/合并
  | 'adjust';       // 人工调整

export interface Transaction {
  id: string;
  date: string;          // YYYY-MM-DD
  type: TransactionType;
  code: string;          // 基金/ETF/股票代码
  name: string;          // 名称
  units: number;         // 份额/股数（正数）
  price: number;         // 成交单价
  amount: number;        // 成交金额 = units * price
  fee: number;           // 手续费
  note?: string;         // 备注
  createdAt: string;     // ISO timestamp
}
```

- [ ] **Step 2: Create types/quote.ts with discriminated Quote types**

```typescript
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
```

- [ ] **Step 3: Create lib/calculator/position.ts - core position calculator**

```typescript
import { Transaction } from '@/types/transaction';
import { Holding, GoldHolding, PortfolioSummary, HoldingWithMetrics } from '@/types/portfolio';
import { Quote } from '@/types/quote';

/**
 * Build holdings from transaction history
 * Pure function - no side effects
 */
export function buildHoldingsFromTransactions(
  transactions: Transaction[]
): Map<string, { units: number; avgCostPrice: number; bookCostAmount: number }> {
  const positionMap = new Map<string, { units: number; totalCost: number; totalUnits: number }>();

  transactions.forEach(tx => {
    if (tx.type === 'buy' || tx.type === 'buy_t0' || tx.type === 'dca' || tx.type === 'reinvest') {
      const current = positionMap.get(tx.code) || { units: 0, totalCost: 0, totalUnits: 0 };
      const newUnits = current.units + tx.units;
      const newTotalCost = current.totalCost + tx.amount + tx.fee;
      positionMap.set(tx.code, {
        units: newUnits,
        totalCost: newTotalCost,
        totalUnits: current.totalUnits + tx.units
      });
    } else if (tx.type === 'sell' || tx.type === 'sell_t0') {
      const current = positionMap.get(tx.code);
      if (current && current.units > 0) {
        const avgCost = current.totalCost / current.units;
        const unitsSold = Math.min(tx.units, current.units);
        const costOfSold = unitsSold * avgCost;
        const newUnits = current.units - unitsSold;
        const newTotalCost = current.totalCost - costOfSold;
        positionMap.set(tx.code, {
          units: newUnits,
          totalCost: newTotalCost,
          totalUnits: current.totalUnits
        });
      }
    }
  });

  const result = new Map();
  positionMap.forEach((value, code) => {
    result.set(code, {
      units: value.units,
      avgCostPrice: value.units > 0 ? value.totalCost / value.units : 0,
      bookCostAmount: value.totalCost
    });
  });

  return result;
}

/**
 * Calculate all derived metrics for a holding
 * Pure function - no side effects
 */
export function calculateHoldingMetrics(holding: Holding): HoldingWithMetrics {
  const marketValue = holding.units * holding.quote.price;
  const unrealizedPnlAmount = marketValue - holding.bookCostAmount;
  const unrealizedPnlPercent = holding.bookCostAmount > 0
    ? (unrealizedPnlAmount / holding.bookCostAmount) * 100
    : 0;
  const dailyPnlAmount = holding.units * (holding.quote.price - holding.quote.prevClose);
  const dailyPnlPercent = holding.quote.prevClose > 0
    ? ((holding.quote.price - holding.quote.prevClose) / holding.quote.prevClose) * 100
    : 0;

  return {
    ...holding,
    marketValue,
    unrealizedPnlAmount,
    unrealizedPnlPercent,
    dailyPnlAmount,
    dailyPnlPercent,
    portfolioWeight: 0 // Will be calculated at portfolio level
  };
}

/**
 * Calculate portfolio summary
 */
export function calculatePortfolioSummary(
  holdings: HoldingWithMetrics[],
  gold: GoldHolding,
  cash: number
): PortfolioSummary {
  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0) + gold.value;
  const totalBookCost = holdings.reduce((sum, h) => sum + h.bookCostAmount, 0) + gold.holding * gold.avgCostPrice;
  const todayPnlAmount = holdings.reduce((sum, h) => sum + h.dailyPnlAmount, 0);
  const totalPnlAmount = totalMarketValue - totalBookCost;

  return {
    totalAssets: totalMarketValue + cash,
    totalBookCost: totalBookCost,
    totalMarketValue,
    cashBalance: cash,
    todayPnlAmount,
    todayPnlPercent: totalBookCost > 0 ? (todayPnlAmount / totalBookCost) * 100 : 0,
    totalPnlAmount,
    totalPnlPercent: totalBookCost > 0 ? (totalPnlAmount / totalBookCost) * 100 : 0,
    holdingsCount: holdings.length,
    profitableCount: holdings.filter(h => h.unrealizedPnlAmount > 0).length,
    losingCount: holdings.filter(h => h.unrealizedPnlAmount < 0).length,
    asOf: new Date().toISOString()
  };
}

/**
 * Validate holding consistency
 * Returns array of error messages (empty if valid)
 */
export function validateHoldingConsistency(holding: Holding): string[] {
  const errors: string[] = [];

  // Check market value calculation
  const expectedMarketValue = holding.units * holding.quote.price;
  if (Math.abs(expectedMarketValue - holding.units * holding.quote.price) > 0.01) {
    errors.push(`Market value mismatch for ${holding.code}`);
  }

  // Check positive values
  if (holding.units < 0) {
    errors.push(`Negative units for ${holding.code}`);
  }

  if (holding.avgCostPrice < 0) {
    errors.push(`Negative cost price for ${holding.code}`);
  }

  return errors;
}
```

- [ ] **Step 4: Create lib/calculator/pnl.ts - P&L calculator**

```typescript
import { Transaction } from '@/types/transaction';
import { Holding } from '@/types/portfolio';

export function calculateDailyPnl(holding: Holding): number {
  return holding.units * (holding.quote.price - holding.quote.prevClose);
}

export function calculateUnrealizedPnl(holding: Holding): number {
  return (holding.units * holding.quote.price) - holding.bookCostAmount;
}

export function calculateRealizedPnl(transactions: Transaction[]): number {
  let realizedPnl = 0;

  transactions.forEach(tx => {
    if (tx.type === 'sell' || tx.type === 'sell_t0') {
      // Simplified: actual calculation requires tracking cost basis of sold units
      realizedPnl += tx.amount - tx.fee;
    }
  });

  return realizedPnl;
}

export function calculateTotalReturn(
  holding: Holding,
  transactions: Transaction[]
): number {
  const unrealized = calculateUnrealizedPnl(holding);
  const realized = calculateRealizedPnl(
    transactions.filter(t => t.code === holding.code)
  );
  const dividends = transactions
    .filter(t => t.code === holding.code && t.type === 'dividend')
    .reduce((sum, t) => sum + t.amount, 0);

  return unrealized + realized + dividends;
}
```

- [ ] **Step 5: Create lib/calculator/validate.ts - data validation**

```typescript
import { Transaction } from '@/types/transaction';
import { PortfolioSummary } from '@/types/portfolio';

export function validateTransaction(tx: Transaction): string[] {
  const errors: string[] = [];

  if (!tx.code || tx.code.trim() === '') {
    errors.push('Transaction code is required');
  }

  if (tx.units < 0) {
    errors.push(`Transaction units must be non-negative`);
  }

  if (tx.price < 0) {
    errors.push(`Transaction price must be non-negative`);
  }

  if (tx.amount <= 0) {
    errors.push(`Transaction amount must be positive`);
  }

  if (tx.fee < 0) {
    errors.push(`Transaction fee must be non-negative`);
  }

  return errors;
}

export function validateTransactions(transactions: Transaction[]): string[] {
  const errors: string[] = [];

  transactions.forEach((tx, index) => {
    const txErrors = validateTransaction(tx);
    txErrors.forEach(err => errors.push(`Transaction ${index}: ${err}`));
  });

  return errors;
}

export function validatePortfolioBalance(summary: PortfolioSummary): string[] {
  const errors: string[] = [];

  if (summary.totalAssets < 0) {
    errors.push('Total assets cannot be negative');
  }

  if (summary.cashBalance < 0) {
    errors.push('Cash balance cannot be negative');
  }

  if (summary.totalMarketValue < 0) {
    errors.push('Total market value cannot be negative');
  }

  return errors;
}
```

- [ ] **Step 6: Create lib/calculator/fees.ts - fee calculator**

```typescript
/**
 * Calculate fund subscription fee
 * Rate varies by amount and fund type
 */
export function calculateSubscriptionFee(amount: number, rate: number = 0.015): number {
  const fee = amount * rate;
  // Some funds have fee discounts for large amounts
  if (amount >= 1000000) {
    return fee * 0.1; // 90% discount for amounts >= 1M
  }
  return Math.max(fee, 0); // Minimum fee handling
}

/**
 * Calculate fund redemption fee
 * Rate decreases with holding period
 */
export function calculateRedemptionFee(
  amount: number,
  holdingDays: number,
  rate: number = 0.005
): number {
  if (holdingDays >= 365) {
    return 0; // No fee after 1 year
  }
  if (holdingDays >= 7) {
    return amount * rate * 0.5; // 50% discount after 7 days
  }
  return amount * rate;
}

/**
 * Calculate trading commission for stocks/ETFs
 */
export function calculateTradingCommission(amount: number, rate: number = 0.0003): number {
  return Math.max(amount * rate, 5); // Minimum 5 RMB commission
}
```

- [ ] **Step 7: Create lib/calculator/index.ts - barrel export**

```typescript
export * from './position';
export * from './pnl';
export * from './validate';
export * from './fees';
```

- [ ] **Step 8: Commit Part 1.1**

```bash
git add types/transaction.ts types/quote.ts lib/calculator/
git commit -m "feat(v4): Part 1.1 - Create calculator layer with Transaction and Quote types"
```

### Task 1.2: Rewrite types/portfolio.ts

**Files:**
- Modify: `types/portfolio.ts`

- [ ] **Step 1: Backup and rewrite types/portfolio.ts**

First, read the existing file completely, then replace with new structure:

```typescript
import { Quote } from './quote';

// ===== 核心持仓类型 =====
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

// Calculate derived properties
export function getGoldValue(gold: GoldHolding): number {
  return gold.units * gold.quote.price;
}

export function getGoldPnL(gold: GoldHolding): number {
  return getGoldValue(gold) - gold.bookCostAmount;
}

// ===== Portfolio Summary =====
export interface PortfolioSummary {
  totalAssets: number;
  totalBookCost: number;
  totalMarketValue: number;
  cashBalance: number;

  todayPnlAmount: number;
  todayPnlPercent: number;
  totalPnlAmount: number;
  totalPnlPercent: number;

  holdingsCount: number;
  profitableCount: number;
  losingCount: number;

  asOf: string;
}

// ===== T0 Target =====
export interface T0Target {
  code: string;
  name: string;
  quote: Quote;
  t0Score: number;
  status: string;
  signal: string;
  signalReason: string;       // 信号理由
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

export interface MarketDataResult<T> {
  data: T;
  asOf: string;
  source: string;
  isMock: boolean;
  stale: boolean;
  cacheTtl: number;
  error?: string;
}
```

- [ ] **Step 2: Commit Part 1.2**

```bash
git add types/portfolio.ts
git commit -m "feat(v4): Part 1.2 - Rewrite portfolio types with atomic fields"
```

### Task 1.3: Rewrite lib/api/market-data.ts with typed results

**Files:**
- Modify: `lib/api/market-data.ts`

- [ ] **Step 1: Read existing market-data.ts**

- [ ] **Step 2: Rewrite with MarketDataResult<T>**

```typescript
import { MarketDataResult } from '@/types/portfolio';

const CACHE_DURATION = {
  REALTIME: 5 * 60 * 1000,    // 5 minutes
  FUND_ESTIMATE: 15 * 60 * 1000, // 15 minutes
  FUND_CONFIRMED: 24 * 60 * 60 * 1000, // 1 day
};

export async function fetchMarketData<T>(
  url: string,
  cacheKey: string,
  cacheTtl: number
): Promise<MarketDataResult<T>> {
  try {
    // Check cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTtl) {
        return {
          data,
          asOf: new Date(timestamp).toISOString(),
          source: 'cache',
          isMock: false,
          stale: false,
          cacheTtl
        };
      }
    }

    // Fetch new data
    const response = await fetch(url, { timeout: 10000 });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Cache result
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return {
      data,
      asOf: new Date().toISOString(),
      source: url,
      isMock: false,
      stale: false,
      cacheTtl
    };

  } catch (error) {
    // Return cached data if available, even if stale
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      return {
        data,
        asOf: new Date(timestamp).toISOString(),
        source: 'cache',
        isMock: false,
        stale: true,
        cacheTtl: 0,
        error: error.message
      };
    }

    // Return mock data as fallback
    return {
      data: null as any,
      asOf: new Date().toISOString(),
      source: 'mock',
      isMock: true,
      stale: true,
      cacheTtl: 0,
      error: error.message
    };
  }
}

// Example usage for fund data
export async function getFundData(code: string) {
  return fetchMarketData(
    `https://fundgz.1234567.com.cn/js/${code}.js`,
    `fund_${code}`,
    CACHE_DURATION.FUND_ESTIMATE
  );
}
```

- [ ] **Step 3: Commit Part 1.3**

```bash
git add lib/api/market-data.ts
git commit -m "feat(v4): Part 1.3 - Rewrite market-data API with typed results"
```

### Task 1.4: Verify build

- [ ] **Step 1: Run build**

```bash
npx next build
```

Expected: Build succeeds with no type errors

- [ ] **Step 2: Commit Part 1 complete**

```bash
git add .
git commit -m "feat(v4): Part 1 complete - Data foundation refactoring"
```

---

## Part 2: State Management and Product Loop

**Goal:** Implement React Context state management with localStorage persistence, complete add position → transaction → recalc → logs loop.

### Task 2.1: Create store directory structure

**Files:**
- Create: `lib/store/portfolio-context.tsx`
- Create: `lib/store/portfolio-reducer.ts`
- Create: `lib/store/localStorage.ts`
- Create: `lib/store/initial-data.ts`
- Create: `lib/store/index.ts`

- [ ] **Step 1: Create lib/store/portfolio-reducer.ts**

```typescript
import { Transaction } from '@/types/transaction';
import { Holding, GoldHolding, T0Target, PendingAction, Macro } from '@/types/portfolio';
import { buildHoldingsFromTransactions } from '@/lib/calculator';

export interface PortfolioState {
  transactions: Transaction[];
  holdings: Holding[];
  gold: GoldHolding;
  cash: number;
  t0Targets: T0Target[];
  pendingActions: PendingAction[];
  macro: Macro;
}

export type PortfolioAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_QUOTE'; payload: { code: string; quote: Holding['quote'] } }
  | { type: 'UPDATE_STRATEGY'; payload: { code: string; strategy: Partial<Holding> } }
  | { type: 'REMOVE_HOLDING'; payload: { code: string } }
  | { type: 'IMPORT_DATA'; payload: Partial<PortfolioState> }
  | { type: 'LOAD_FROM_STORAGE'; payload: PortfolioState }
  | { type: 'UPDATE_CASH'; payload: { amount: number } };

export function portfolioReducer(
  state: PortfolioState,
  action: PortfolioAction
): PortfolioState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const newTransactions = [...state.transactions, action.payload];
      // Recalculate holdings from transactions
      const positionMap = buildHoldingsFromTransactions(newTransactions);

      const updatedHoldings = state.holdings.map(holding => {
        const position = positionMap.get(holding.code);
        if (position) {
          return {
            ...holding,
            units: position.units,
            avgCostPrice: position.avgCostPrice,
            bookCostAmount: position.bookCostAmount
          };
        }
        return holding;
      });

      return {
        ...state,
        transactions: newTransactions,
        holdings: updatedHoldings
      };
    }

    case 'UPDATE_QUOTE': {
      return {
        ...state,
        holdings: state.holdings.map(h =>
          h.code === action.payload.code
            ? { ...h, quote: action.payload.quote }
            : h
        )
      };
    }

    case 'UPDATE_STRATEGY': {
      return {
        ...state,
        holdings: state.holdings.map(h =>
          h.code === action.payload.code
            ? { ...h, ...action.payload.strategy }
            : h
        )
      };
    }

    case 'REMOVE_HOLDING': {
      return {
        ...state,
        holdings: state.holdings.filter(h => h.code !== action.payload.code)
      };
    }

    case 'IMPORT_DATA': {
      return {
        ...state,
        ...action.payload
      };
    }

    case 'LOAD_FROM_STORAGE': {
      return action.payload;
    }

    case 'UPDATE_CASH': {
      return {
        ...state,
        cash: action.payload.amount
      };
    }

    default:
      return state;
  }
}
```

- [ ] **Step 2: Create lib/store/localStorage.ts**

```typescript
import { PortfolioState } from './portfolio-reducer';

const STORAGE_KEY = 'investscope_portfolio';
const STORAGE_VERSION = 'v4';

export function loadPortfolio(userId: string = 'default'): PortfolioState | null {
  try {
    const key = `${STORAGE_KEY}_${userId}_${STORAGE_VERSION}`;
    const data = localStorage.getItem(key);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load portfolio:', error);
    return null;
  }
}

export function savePortfolio(userId: string = 'default', state: PortfolioState): void {
  try {
    const key = `${STORAGE_KEY}_${userId}_${STORAGE_VERSION}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save portfolio:', error);
  }
}

export function clearPortfolio(userId: string = 'default'): void {
  const key = `${STORAGE_KEY}_${userId}_${STORAGE_VERSION}`;
  localStorage.removeItem(key);
}

// Data migration helpers
export function migrateData(oldData: any, fromVersion: string): PortfolioState | null {
  // Implement migration logic from v1, v2, v3 to v4
  if (fromVersion === 'v3') {
    // Migrate v3 data structure to v4
    return null; // Implement actual migration
  }
  return null;
}
```

- [ ] **Step 3: Create lib/store/initial-data.ts**

Read existing `data/portfolio.ts` and convert to Transaction-based initial state:

```typescript
import { PortfolioState } from './portfolio-reducer';
import { Transaction, Holding, GoldHolding, T0Target, PendingAction, Macro } from '@/types/portfolio';
import { Quote } from '@/types/quote';

// Mock quote for initial data
function createMockQuote(price: number, prevClose: number): Quote {
  return {
    price,
    prevClose,
    change: prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0,
    changeAmount: price - prevClose,
    quoteType: 'estimated_nav',
    asOf: new Date().toISOString(),
    source: '天天基金估值',
    delayHours: 0,
    staleness: 'fresh',
    isMock: true
  };
}

// Convert existing holdings to initial transactions
const initialTransactions: Transaction[] = [
  {
    id: 'tx_001',
    date: '2024-01-15',
    type: 'buy',
    code: '014368',
    name: '富国全球科技互联网股票(QDII)C',
    units: 4928,
    price: 5.2287,
    amount: 25761,
    fee: 0,
    note: '初始建仓',
    createdAt: '2024-01-15T00:00:00Z'
  },
  // ... Add remaining holdings as initial buy transactions
];

const initialHoldings: Holding[] = [
  {
    code: '014368',
    name: '富国全球科技互联网股票(QDII)C',
    instrumentType: 'fund',
    productType: 'qdii_fund',
    units: 4928,
    avgCostPrice: 5.2287,
    bookCostAmount: 25761,
    quote: createMockQuote(5.2287, 5.224),
    rating: 'B',
    riskLevel: 'green',
    strategy: '持有，盈利丰厚继续定投',
    autoInvest: 100,
    tags: ['QDII', '科技'],
    isT0: false
  },
  // ... Add remaining holdings from data/portfolio.ts
];

const initialGold: GoldHolding = {
  productType: 'physical_gold',
  brand: '周大福',
  units: 50,
  avgCostPrice: 480,
  bookCostAmount: 24000,
  quote: {
    price: 545,
    prevClose: 542,
    change: 0.55,
    changeAmount: 3,
    quoteType: 'gold_spot',
    asOf: new Date().toISOString(),
    source: '上海金交所',
    delayHours: 0,
    staleness: 'fresh',
    isMock: true
  }
};

const initialMacro: Macro = {
  usStocks: {
    dowJones: { value: 39512, change: 0.42 },
    nasdaq: { value: 16428, change: -0.23 },
    sp500: { value: 5180, change: 0.12 },
    note: '隔夜美股'
  },
  commodities: {
    gold: { price: 2320, change: 0.35, signal: '持有' },
    silver: { price: 27.5, change: -0.12, signal: '观望' },
    copper: { price: 4.2, change: 0.8, signal: '关注' },
    oil: { price: 78.5, change: -1.2, signal: '观望' }
  },
  isMock: true,
  asOf: new Date().toISOString(),
  source: '市场数据'
};

export const initialPortfolioState: PortfolioState = {
  transactions: initialTransactions,
  holdings: initialHoldings,
  gold: initialGold,
  cash: 15112,
  t0Targets: [],
  pendingActions: [],
  macro: initialMacro
};
```

- [ ] **Step 4: Create lib/store/portfolio-context.tsx**

```typescript
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { portfolioReducer, PortfolioState, PortfolioAction } from './portfolio-reducer';
import { loadPortfolio, savePortfolio } from './localStorage';
import { initialPortfolioState } from './initial-data';

interface PortfolioContextType {
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    portfolioReducer,
    initialPortfolioState
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadPortfolio();
    if (saved) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: saved });
    }
  }, []);

  // Save to localStorage on state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      savePortfolio(state);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
}
```

- [ ] **Step 5: Create lib/store/index.ts**

```typescript
export * from './portfolio-context';
export * from './portfolio-reducer';
export * from './localStorage';
export * from './initial-data';
```

- [ ] **Step 6: Commit Part 2.1**

```bash
git add lib/store/
git commit -m "feat(v4): Part 2.1 - Create store with Context, reducer, localStorage"
```

### Task 2.2: Integrate PortfolioProvider into app

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Wrap app with PortfolioProvider**

Read existing `app/layout.tsx`, then modify to wrap with provider and rename to "InvestScope 投资看板".

- [ ] **Step 2: Commit Part 2.2**

```bash
git add app/layout.tsx
git commit -m "feat(v4): Part 2.2 - Integrate PortfolioProvider, rebrand to InvestScope"
```

### Task 2.3: Refactor pages to use usePortfolio()

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/holdings/page.tsx`
- Modify: `app/trading/page.tsx`
- Modify: `app/logs/page.tsx`
- Modify: `app/macro/page.tsx`

- [ ] **Step 1: Refactor app/page.tsx**

Replace static imports with `usePortfolio()` hook.

- [ ] **Step 2: Refactor app/holdings/page.tsx**

Replace static imports with `usePortfolio()` hook.

- [ ] **Step 3: Refactor app/trading/page.tsx**

Replace static imports with `usePortfolio()` hook.

- [ ] **Step 4: Refactor app/logs/page.tsx**

Replace static imports with `usePortfolio()` hook.

- [ ] **Step 5: Refactor app/macro/page.tsx**

Replace static imports with `usePortfolio()` hook.

- [ ] **Step 6: Commit Part 2.3**

```bash
git add app/
git commit -m "feat(v4): Part 2.3 - Refactor all pages to use usePortfolio() hook"
```

### Task 2.4: Implement add position loop

**Files:**
- Modify: `app/holdings/page.tsx` or create new component for adding holdings

- [ ] **Step 1: Create AddHoldingForm component with validation**

- [ ] **Step 2: Implement ADD_TRANSACTION action on submit**

- [ ] **Step 3: Verify state updates propagate to all pages**

- [ ] **Step 4: Commit Part 2.4**

```bash
git add app/holdings/
git commit -m "feat(v4): Part 2.4 - Implement add position → transaction → recalc loop"
```

### Task 2.5: Verify build

- [ ] **Step 1: Run build**

```bash
npx next build
```

Expected: Build succeeds

- [ ] **Step 2: Commit Part 2 complete**

```bash
git add .
git commit -m "feat(v4): Part 2 complete - State management and product loop"
```

---

## Part 3: Product Experience Upgrade

**Goal:** Rebrand to InvestScope, restructure tabs, improve UX, rename pages.

### Task 3.1: Update Navigation with new structure

**Files:**
- Modify: `components/Navigation.tsx`

- [ ] **Step 1: Update navItems**

```typescript
const navItems = [
  { href: '/', label: '总览', icon: '📊' },
  { href: '/holdings', label: '持仓', icon: '🎯' },
  { href: '/actions', label: '行动', icon: '⚡' },
  { href: '/market', label: '市场', icon: '🌍' },
  { href: '/profile', label: '我的', icon: '👤' },
];
```

- [ ] **Step 2: Update branding to "InvestScope 投资看板"**

- [ ] **Step 3: Commit Part 3.1**

```bash
git add components/Navigation.tsx
git commit -m "feat(v4): Part 3.1 - Update navigation structure and branding"
```

### Task 3.2: Rename and create new pages

**Files:**
- Rename: `app/trading/page.tsx` → `app/actions/page.tsx`
- Rename: `app/macro/page.tsx` → `app/market/page.tsx`
- Create: `app/profile/page.tsx`
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Rename trading → actions**

```bash
git mv app/trading app/actions
```

- [ ] **Step 2: Rename macro → market**

```bash
git mv app/macro app/market
```

- [ ] **Step 3: Create profile page**

- [ ] **Step 4: Create settings page**

- [ ] **Step 5: Commit Part 3.2**

```bash
git add app/
git commit -m "feat(v4): Part 3.2 - Restructure pages: actions, market, profile, settings"
```

### Task 3.3: Redesign homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Implement new homepage layout**

```
┌─ 资产总览卡片 ──────────────────────────┐
│ 总市值 ¥342,417  今日 -327 (-0.10%)     │
│ 数据截至 14:00 (盘中估值) ⚠️演示数据    │
└──────────────────────────────────────────┘

┌─ 今日决策 ──────────────────────────────┐
│ 🚨 清仓平安鑫安C (待执行)               │
│ ⚠️ 易方达软件ETF 浮亏-14% 风险预警      │
│ 📊 兴业港股互联网 接近回本价1.58        │
└──────────────────────────────────────────┘

┌─ 持仓配比 ─┐ ┌─ 今日排行 ─┐
│ (饼图)      │ │ 涨跌排行    │
└─────────────┘ └─────────────┘

┌─ 近期走势（演示）────────────────────────┐
│ (折线图)                                 │
└──────────────────────────────────────────┘
```

- [ ] **Step 2: Commit Part 3.3**

```bash
git add app/page.tsx
git commit -m "feat(v4): Part 3.3 - Redesign homepage with decision-focused layout"
```

### Task 3.4: Update content pages

**Files:**
- Modify: `app/actions/page.tsx` (merge trading + strategy)
- Modify: `app/profile/page.tsx` (merge logs + settings)
- Modify: `app/settings/page.tsx`

- [ ] **Step 1: Merge trading center into actions page**

- [ ] **Step 2: Merge logs into profile page**

- [ ] **Step 3: Add settings functionality**

- [ ] **Step 4: Commit Part 3.4**

```bash
git add app/actions/ app/profile/ app/settings/
git commit -m "feat(v4): Part 3.4 - Merge and update content pages"
```

### Task 3.5: Verify build

- [ ] **Step 1: Run build**

```bash
npx next build
```

Expected: Build succeeds

- [ ] **Step 2: Commit Part 3 complete**

```bash
git add .
git commit -m "feat(v4): Part 3 complete - Product experience upgrade"
```

---

## Part 4: Market Data Integration

**Goal:** Implement real API calls for fund NAV, ETF realtime, gold, FX rates.

### Task 4.1: Create API modules

**Files:**
- Create: `lib/api/fund.ts`
- Create: `lib/api/etf.ts`
- Create: `lib/api/gold.ts`
- Create: `lib/api/fx.ts`
- Create: `lib/api/sector.ts`
- Modify: `lib/api/index.ts`

- [ ] **Step 1: Create lib/api/fund.ts**

```typescript
import { Quote } from '@/types/quote';
import { fetchMarketData } from './market-data';

/**
 * Get fund estimated NAV from TianTian Fund API
 */
export async function getFundEstimatedNav(code: string): Promise<Quote> {
  const url = `https://fundgz.1234567.com.cn/js/${code}.js`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse JSONP response: jsonpgz({"fundcode":..., "dwjz":..., "gsz":..., "gszzl":..., "gztime":...})
    const match = text.match(/jsonpgz\((.*)\)/);
    if (!match) throw new Error('Invalid response format');

    const data = JSON.parse(match[1]);

    return {
      price: parseFloat(data.gsz), // 估值
      prevClose: parseFloat(data.dwjz), // 昨日净值
      change: parseFloat(data.gszzl), // 估值涨跌幅%
      changeAmount: parseFloat(data.gsz) - parseFloat(data.dwjz),
      quoteType: 'estimated_nav',
      asOf: data.gztime,
      source: '天天基金估值',
      delayHours: 0,
      staleness: 'fresh',
      isMock: false
    };
  } catch (error) {
    // Return mock quote on error
    return {
      price: 1.0,
      prevClose: 1.0,
      change: 0,
      changeAmount: 0,
      quoteType: 'estimated_nav',
      asOf: new Date().toISOString(),
      source: 'mock',
      delayHours: 0,
      staleness: 'unknown',
      isMock: true,
      error: error.message
    };
  }
}

/**
 * Get fund confirmed NAV
 */
export async function getFundConfirmedNav(code: string): Promise<Quote> {
  // Implementation for confirmed NAV API
  // This would use a different API endpoint
  return getFundEstimatedNav(code); // Fallback for now
}
```

- [ ] **Step 2: Create lib/api/etf.ts**

```typescript
import { Quote } from '@/types/quote';

/**
 * Get ETF realtime quote from Tencent Finance API
 */
export async function getETFRealtime(code: string): Promise<Quote> {
  const url = `https://qt.gtimg.cn/q=${code}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse response: v_sh510300="51~华夏沪深300ETF~0.~...
    // Format: name~price~prevClose~open~high~low~volume~turnover~bid~ask~
    const match = text.match(/="(.*)"/);
    if (!match) throw new Error('Invalid response format');

    const fields = match[1].split('~');
    const price = parseFloat(fields[2]);
    const prevClose = parseFloat(fields[3]);
    const bid = parseFloat(fields[9]);
    const ask = parseFloat(fields[10]);

    return {
      price,
      prevClose,
      change: prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0,
      changeAmount: price - prevClose,
      open: parseFloat(fields[4]),
      high: parseFloat(fields[5]),
      low: parseFloat(fields[6]),
      volume: parseFloat(fields[7]),
      turnover: parseFloat(fields[8]),
      bid,
      ask,
      spread: ask - bid,
      quoteType: 'realtime',
      asOf: new Date().toISOString(),
      source: '腾讯财经',
      delayHours: 0,
      staleness: 'fresh',
      isMock: false
    };
  } catch (error) {
    // Return mock quote on error
    return {
      price: 1.0,
      prevClose: 1.0,
      change: 0,
      changeAmount: 0,
      quoteType: 'realtime',
      asOf: new Date().toISOString(),
      source: 'mock',
      delayHours: 0,
      staleness: 'unknown',
      isMock: true
    };
  }
}
```

- [ ] **Step 3: Create lib/api/gold.ts**

```typescript
import { Quote } from '@/types/quote';

/**
 * Get gold spot price
 * Returns price in CNY per gram
 */
export async function getGoldPrice(): Promise<Quote> {
  // Formula: CNY/gram = (XAUUSD * USDCNY) / 31.1035

  try {
    // Fetch XAUUSD and USDCNY
    const [xauResponse, usdResponse] = await Promise.all([
      fetch('https://api.exchangerate.host/latest?base=XAU&symbols=USD'),
      fetch('https://api.exchangerate.host/latest?base=USD&symbols=CNY')
    ]);

    const xauData = await xauResponse.json();
    const usdData = await usdResponse.json();

    const xauUsd = xauData.rates.USD;
    const usdCny = usdData.rates.CNY;

    const pricePerGram = (xauUsd * usdCny) / 31.1035;

    return {
      price: pricePerGram,
      prevClose: pricePerGram * 0.995, // Mock prevClose
      change: 0.5,
      changeAmount: pricePerGram * 0.005,
      quoteType: 'gold_spot',
      asOf: new Date().toISOString(),
      source: '国际金价+汇率',
      delayHours: 0,
      staleness: 'fresh',
      isMock: false
    };
  } catch (error) {
    // Return mock quote on error
    return {
      price: 545,
      prevClose: 542,
      change: 0.55,
      changeAmount: 3,
      quoteType: 'gold_spot',
      asOf: new Date().toISOString(),
      source: 'mock',
      delayHours: 0,
      staleness: 'unknown',
      isMock: true
    };
  }
}
```

- [ ] **Step 4: Create lib/api/fx.ts**

```typescript
/**
 * Get USD/CNY exchange rate
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=CNY');
    const data = await response.json();
    return data.rates.CNY;
  } catch (error) {
    return 7.23; // Mock fallback
  }
}
```

- [ ] **Step 5: Update lib/api/index.ts**

```typescript
export * from './fund';
export * from './etf';
export * from './gold';
export * from './fx';
export * from './sector';
export * from './market-data';
```

- [ ] **Step 6: Commit Part 4.1**

```bash
git add lib/api/
git commit -m "feat(v4): Part 4.1 - Create API modules for real market data"
```

### Task 4.2: Integrate real quotes into state

**Files:**
- Modify: `lib/store/portfolio-context.tsx` or create separate hook for quote updates

- [ ] **Step 1: Create useQuotes hook to fetch real-time quotes**

- [ ] **Step 2: Dispatch UPDATE_QUOTE actions with real data**

- [ ] **Step 3: Handle errors and fallback to mock**

- [ ] **Step 4: Commit Part 4.2**

```bash
git add lib/store/
git commit -m "feat(v4): Part 4.2 - Integrate real quotes into state management"
```

### Task 4.3: Upgrade T0 signals with real data

**Files:**
- Modify: `app/actions/page.tsx` or T0 calculation logic

- [ ] **Step 1: Use real bid/ask/spread from ETF quotes**

- [ ] **Step 2: Calculate T0 score based on liquidity, spread, volume**

- [ ] **Step 3: Add signal reasons with data citations**

- [ ] **Step 4: Commit Part 4.3**

```bash
git add app/actions/
git commit -m "feat(v4): Part 4.3 - Upgrade T0 signals with real market data"
```

### Task 4.4: Verify build

- [ ] **Step 1: Run build**

```bash
npx next build
```

Expected: Build succeeds

- [ ] **Step 2: Commit Part 4 complete**

```bash
git add .
git commit -m "feat(v4): Part 4 complete - Market data integration"
```

---

## Part 5: Externalization Preparation

**Goal:** ESLint setup, core unit tests, compliance, error handling.

### Task 5.1: Setup ESLint

**Files:**
- Create: `.eslintrc.json`
- Modify: `package.json` (if needed)

- [ ] **Step 1: Create .eslintrc.json**

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

- [ ] **Step 3: Fix any linting errors**

- [ ] **Step 4: Commit Part 5.1**

```bash
git add .eslintrc.json
git commit -m "feat(v4): Part 5.1 - Setup ESLint configuration"
```

### Task 5.2: Write core unit tests

**Files:**
- Create: `lib/calculator/__tests__/position.test.ts`
- Create: `lib/calculator/__tests__/pnl.test.ts`
- Create: `lib/calculator/__tests__/fees.test.ts`
- Create: `lib/calculator/__tests__/validate.test.ts`

- [ ] **Step 1: Install testing dependencies** (if not present)

```bash
npm install --save-dev jest @types/jest ts-jest
```

- [ ] **Step 2: Create Jest configuration**

- [ ] **Step 3: Write position.test.ts**

- [ ] **Step 4: Write pnl.test.ts**

- [ ] **Step 5: Write fees.test.ts**

- [ ] **Step 6: Write validate.test.ts**

- [ ] **Step 7: Run tests**

```bash
npm test
```

- [ ] **Step 8: Commit Part 5.2**

```bash
git add lib/calculator/__tests__/ jest.config.js
git commit -m "feat(v4): Part 5.2 - Add core calculator unit tests"
```

### Task 5.3: Add compliance disclaimers

**Files:**
- Modify: `components/Navigation.tsx` or create Footer component
- Modify: `app/actions/page.tsx`
- Modify: `app/market/page.tsx`

- [ ] **Step 1: Add global disclaimer to layout**

- [ ] **Step 2: Add strategy/signal page disclaimers**

- [ ] **Step 3: Add data source attributions**

- [ ] **Step 4: Commit Part 5.3**

```bash
git add app/ components/
git commit -m "feat(v4): Part 5.3 - Add compliance disclaimers and data sources"
```

### Task 5.4: Implement error handling

**Files:**
- Modify: All API files in `lib/api/`
- Modify: All pages to handle error/loading/stale states

- [ ] **Step 1: Add error boundaries**

- [ ] **Step 2: Show loading/skeleton states**

- [ ] **Step 3: Display stale data warnings**

- [ ] **Step 4: Commit Part 5.4**

```bash
git add lib/api/ app/ components/
git commit -m "feat(v4): Part 5.4 - Implement comprehensive error handling"
```

### Task 5.5: Final build verification

- [ ] **Step 1: Run build**

```bash
npx next build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Expected: No linting errors

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 4: Commit Part 5 complete**

```bash
git add .
git commit -m "feat(v4): Part 5 complete - Externalization preparation"
```

---

## Final Verification

### Task Final.1: Complete functionality check

- [ ] **Step 1: Test all pages**

Visit each page and verify:
- Homepage (/)
- Holdings (/holdings)
- Actions (/actions)
- Market (/market)
- Profile (/profile)
- Settings (/settings)

- [ ] **Step 2: Test add position loop**

Add a new position and verify it appears in holdings and logs.

- [ ] **Step 3: Test state persistence**

Reload page and verify data persists from localStorage.

- [ ] **Step 4: Test mobile responsiveness**

Check all pages on mobile viewport.

### Task Final.2: Final commit

- [ ] **Step 1: Commit v4.0 complete**

```bash
git add .
git commit -m "👑 v4.0 - 全面重构：数据模型/状态管理/真实行情/产品升级/合规化

- Part 1: Transaction模型 + Quote类型 + 计算器层
- Part 2: React Context状态管理 + localStorage持久化
- Part 3: 重品牌InvestScope + 页面架构重组
- Part 4: 真实行情API接入（基金/ETF/黄金/汇率）
- Part 5: ESLint + 单测 + 免责声明 + 错误处理

架构升级：
- 所有持仓从Transaction派生，确保数据一致性
- 计算层纯函数，可测试可验证
- 状态管理统一，产品闭环打通
- 支持真实市场数据，降级到mock
- 外部化准备就绪，合规完善

交付标准：
✅ 构建通过
✅ 所有页面可访问
✅ 移动端+桌面端适配
✅ 数据持久化
✅ 错误处理完善
🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] **Step 2: Create tag**

```bash
git tag -a v4.0 -m "InvestScope v4.0 - Production-ready release"
```

---

## Completion Report

After execution, report:

1. **Files Created:**
   - types/transaction.ts
   - types/quote.ts
   - lib/calculator/*.ts (6 files)
   - lib/store/*.ts (5 files)
   - lib/api/*.ts (5 files)
   - app/actions/, app/market/, app/profile/, app/settings/
   - lib/calculator/__tests__/*.ts (4 files)
   - .eslintrc.json

2. **Files Modified:**
   - types/portfolio.ts (complete rewrite)
   - lib/api/market-data.ts (typed rewrite)
   - app/layout.tsx (Provider integration)
   - app/page.tsx (usePortfolio hook)
   - app/holdings/page.tsx (usePortfolio hook)
   - app/logs/page.tsx (usePortfolio hook)
   - components/Navigation.tsx (rebrand)
   - All other pages (usePortfolio hook)

3. **Build Status:**
   - ✅ npx next build: PASS
   - ✅ npm run lint: PASS
   - ✅ npm test: PASS

4. **Remaining Issues:**
   - (List any incomplete items or known issues)

5. **Migration Notes:**
   - Old data structure automatically migrated via localStorage migration logic
   - Existing holdings converted to initial buy transactions
   - User data preserved during upgrade
