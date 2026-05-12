## 帝国操盘室 v4.0 - 全面重构任务书

> 基于 Codex 两轮 Review + REFACTOR-PLAN.md
> 一次性执行所有阶段的架构级改动

---

## Part 1: 数据根基重构

### 1.0 创建新目录结构
```
types/
  portfolio.ts → 保留Gold/Macro/PendingAction等，重写Holding
  transaction.ts → 新增Transaction类型
  quote.ts → 新增行情相关类型
  index.ts → 统一导出
lib/
  calculator/
    position.ts → 从Transactions计算持仓
    pnl.ts → 盈亏计算
    quote.ts → 行情标准化
    fees.ts → 费用计算
    validate.ts → 数据校验
    index.ts → 统一导出
  store/
    portfolio-context.tsx → React Context + Reducer
    portfolio-reducer.ts → 纯reducer函数
    localStorage.ts → localStorage适配器
    initial-data.ts → 初始mock数据（从现有data/portfolio.ts迁移）
    index.ts
  api/
    market-data.ts → 重写，typed返回值
    fund.ts → 基金净值
    etf.ts → ETF行情
    gold.ts → 黄金价格
    fx.ts → 汇率
    sector.ts → 板块数据
    index.ts
  i18n/ → 保持现有
data/
  portfolio.ts → 改为从store/initial-data.ts导出（向后兼容过渡）
components/ → 保持现有+新增
app/ → 重构页面
```

### 1.1 新增 types/transaction.ts
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

### 1.2 新增 types/quote.ts
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

### 1.3 重写 types/portfolio.ts
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
export interface Macro { ... 保持现有 }
export interface PendingAction { ... 保持现有 }
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

### 1.4 实现 lib/calculator/position.ts
核心函数：
- `buildHoldingsFromTransactions(transactions: Transaction[]): Map<string, {units, avgCostPrice, bookCostAmount}>`
- `calculateHoldingMetrics(holding: Holding): HoldingWithMetrics`
- `calculatePortfolioSummary(holdings: HoldingWithMetrics[], gold: GoldHolding, cash: number): PortfolioSummary`
- `calculateCategoryStats(holdings: HoldingWithMetrics[], type: InstrumentType): CategoryStats`

关键原则：
- 只接受原子输入（Transaction/Holding.quote）
- 所有金额/盈亏/百分比由函数计算
- 纯函数，无副作用
- 加 invariant: `if (Math.abs(marketValue - units * quote.price) > 0.01) throw`

### 1.5 实现 lib/calculator/pnl.ts
- `calculateDailyPnl(holding: Holding): number` — units * (quote.price - quote.prevClose)
- `calculateUnrealizedPnl(holding: Holding): number` — units * quote.price - bookCostAmount
- `calculateRealizedPnl(transactions: Transaction[]): number` — sum of sell proceeds - cost
- `calculateTotalReturn(holding: Holding, transactions: Transaction[]): number` — unrealized + realized + dividends

### 1.6 实现 lib/calculator/validate.ts
- `validateHoldingConsistency(holding: Holding): string[]` — 返回错误列表
- `validateTransactions(transactions: Transaction[]): string[]`
- `validatePortfolioBalance(summary: PortfolioSummary): string[]`

### 1.7 重写 lib/api/market-data.ts
- 使用 MarketDataResult<T> 替代 `data: any`
- 每个函数返回 discriminated union
- try/catch + timeout + fallback
- 缓存策略（5min for realtime, 1day for confirmed NAV）

---

## Part 2: 状态管理与产品闭环

### 2.1 实现 lib/store/portfolio-context.tsx
React Context + useReducer:
```
State: {
  transactions: Transaction[]
  holdings: Holding[]
  gold: GoldHolding
  cash: number
  t0Targets: T0Target[]
  pendingActions: PendingAction[]
  macro: Macro
}
```

Actions:
- ADD_TRANSACTION → 重新计算持仓
- UPDATE_QUOTE → 更新行情快照
- UPDATE_STRATEGY → 更新策略
- REMOVE_HOLDING → 清仓
- IMPORT_DATA → 批量导入
- LOAD_FROM_STORAGE → 初始化

### 2.2 实现 lib/store/portfolio-reducer.ts
纯 reducer，所有状态变更逻辑集中于此。

### 2.3 实现 lib/store/localStorage.ts
- `loadPortfolio(userId: string): State | null`
- `savePortfolio(userId: string, state: State): void`
- 自动持久化（debounce 1s）
- 数据迁移（v1→v2→v3→v4）

### 2.4 实现 lib/store/initial-data.ts
从现有 data/portfolio.ts 的真实持仓数据转换为 Transactions：
- 14只基金 → 14笔初始买入Transaction
- 1只ETF → 1笔初始买入
- 黄金 → 1笔实物金Transaction
- 现金 → cashBalance
- 历史操作 → 对应Transactions（已完成的清仓/减仓等）

### 2.5 重构 app/layout.tsx
- 用 `<PortfolioProvider>` 包裹整个应用
- 去掉"内部代号：帝国操盘室"
- 统一为"InvestScope 投资看板"

### 2.6 重构所有页面使用 usePortfolio() hook
- 不再直接 `import { portfolioData } from '@/data/portfolio'`
- 改为 `const { state, dispatch } = usePortfolio()`
- 从state中取holdings/summary等

### 2.7 新增持仓闭环
- 受控表单 + zod schema
- 提交 → dispatch ADD_TRANSACTION → 自动重新计算持仓 → 列表刷新
- 去掉 alert

### 2.8 操作反馈闭环
- 受控表单 + 校验
- 提交 → dispatch ADD_TRANSACTION → 更新份额成本 → 日志页显示
- 详情页同理

### 2.9 日志页统一
- 从 state.transactions 读取
- 按 date 排序
- 待执行操作从 holdings 策略触发条件派生
- 已完成操作从 transactions 的 sell/adjust 类型派生

---

## Part 3: 产品体验升级

### 3.1 统一命名
- Navigation.tsx: "InvestScope 投资看板"
- 去掉所有"帝国操盘室""太后评级""内部代号"
- "策略评级" "交易纪律" "今日领涨" 保持

### 3.2 首屏改造 (app/page.tsx)
新布局：
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
- 去掉硬编码"本周收益"
- mock数据标注"📊演示数据"
- 增加数据新鲜度指示器

### 3.3 Tab架构重排
```typescript
const navItems = [
  { href: '/', label: '总览', icon: '📊' },
  { href: '/holdings', label: '持仓', icon: '🎯' },
  { href: '/actions', label: '行动', icon: '⚡' },     // 合并做T+策略执行
  { href: '/market', label: '市场', icon: '🌍' },     // 重命名"宏观"→"市场"
  { href: '/profile', label: '我的', icon: '👤' },    // 合并日志+设置
];
```

### 3.4 新建 /actions 页
- 合并做T中心 + 待执行策略 + 操作记录
- 做T标的池 + 计算器
- 待执行策略列表（从holdings策略派生）
- 操作记录（从transactions派生）

### 3.5 新建 /profile 页
- 操作日志（历史transactions）
- 设置入口
- 数据导入/导出
- 关于 InvestScope

### 3.6 新建 /settings 页
- 持仓管理
- 风控参数设置
- 定投计划管理
- 数据备份

### 3.7 行情展示优化
- 每个价格旁标注类型badge："实时"/"估值"/"净值T+1"
- QDII显示"⚠️ QDII基金净值延迟1-2个交易日"
- 黄金显示"实物金"标识
- 所有mock数据显示"演示"badge

### 3.8 移动端优化
- 卡片减少信息密度
- 图表高度适配
- 底部Tab间距调整
- 设置入口加到"我的"Tab

---

## Part 4: 行情接入与差异化

### 4.1 基金净值API
实现 lib/api/fund.ts:
- `getFundNav(code)` → 天天基金估值API (https://fundgz.1234567.com.cn/js/{code}.js)
- `getFundConfirmedNav(code)` → 确认净值
- 区分估值和确认净值
- QDII标注延迟

### 4.2 ETF实时行情API
实现 lib/api/etf.ts:
- `getETFRealtime(code)` → 腾讯财经API (qt.gtimg.cn)
- 包含 bid/ask/spread/amplitude/volume

### 4.3 黄金价格API
实现 lib/api/gold.ts:
- `getGoldPrice()` → 上海金交所/国际金价
- 人民币克价 = xauUsd * usdCny / 31.1035

### 4.4 汇率API
实现 lib/api/fx.ts:
- `getExchangeRate()` → USD/CNY

### 4.5 T0信号升级
- 从真实行情的 high/low/volume/turnover/bid/ask 计算
- 评分考虑流动性、盘口价差、可卖数量
- 每个信号附带reason

### 4.6 收益曲线真实化
- 基于historical transactions + daily quotes
- 保存每日snapshot到localStorage
- 展示真实历史曲线

---

## Part 5: 外部化准备

### 5.1 ESLint配置
- 创建 .eslintrc.json
- 配置 Next.js + TypeScript rules
- 确保 `npm run lint` 可运行

### 5.2 核心单测
- lib/calculator/position.test.ts
- lib/calculator/pnl.test.ts
- lib/calculator/fees.test.ts
- lib/calculator/validate.test.ts

### 5.3 合规完善
- 全局Disclaimer组件（Footer已有，增强）
- 每个策略/信号页加免责
- 首次使用弹窗：风险评估声明
- 数据来源标注

### 5.4 错误处理统一
- API调用统一 try/catch
- 展示 stale/error/loading 三态
- 网络断开时显示缓存数据+stale标记

---

## 实施要求

1. **按 Part 1→2→3→4→5 顺序执行**
2. **每个 Part 完成后运行 `npx next build` 确认构建通过**
3. **保持现有功能不退化**（所有页面可正常访问）
4. **红涨绿跌**保持不变
5. **移动端和桌面端**都正常
6. **所有文案中文**
7. **最终 `npx next build` 必须通过**
8. **git commit 每个 Part 完成后各提交一次**

完成后报告：
- 创建了哪些新文件
- 修改了哪些文件
- 构建是否通过
- 遗留问题清单
