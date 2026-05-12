import { HoldingLegacy, T0Target, Gold, Macro, PendingAction, History } from '@/types/portfolio';
import { calculatePortfolioSummary } from '@/lib/portfolio-calculations';

// Legacy types kept for backward compatibility during migration
export interface Fund {
  name: string;
  code: string;
  type: string;
  amount: number;
  cost: number;
  current: number;
  profit: number;
  dailyChange: number;
  rating: 'A' | 'B' | 'C' | 'D';
  riskLevel: 'green' | 'yellow' | 'red';
  strategy: string;
  autoInvest: number;
  triggerPrice?: number;
}

export interface ETFStock {
  name: string;
  code: string;
  exchange: string;
  amount: number;
  price: number;
  cost: number;
  profit: number;
  profitPercent: number;
  dailyChange: number;
  shares: number;
}

// Cash balance - the 15,112 discrepancy mentioned in the review
const cashBalance = 15112;

// Unified holdings data using legacy holding structure for v4 migration
export const holdings: HoldingLegacy[] = [
  // Funds
  {
    code: "014368", name: "富国全球科技互联网股票(QDII)C", type: "QDII科技", assetCategory: "fund",
    holdingUnits: 4928, costPrice: 5.2287, lastPrice: 5.2287,
    costAmount: 25761, marketValue: 25761,
    unrealizedPnlAmount: 30, unrealizedPnlPercent: 0.12,
    prevClosePrice: 5.224, dailyChange: 0.09, dailyChangeAmount: 23,
    rating: "B", riskLevel: "green", strategy: "持有，盈利丰厚继续定投", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "012361", name: "华宝纳斯达克精选股票发起式(QDII)A", type: "QDII美股", assetCategory: "fund",
    holdingUnits: 10639, costPrice: 2.4036, lastPrice: 2.4036,
    costAmount: 25566, marketValue: 25566,
    unrealizedPnlAmount: 13, unrealizedPnlPercent: 0.05,
    prevClosePrice: 2.4002, dailyChange: 0.14, dailyChangeAmount: 36,
    rating: "B", riskLevel: "green", strategy: "持有，纳指长期看涨", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "007221", name: "摩根日本精选股票(QDII)A", type: "QDII日本", assetCategory: "fund",
    holdingUnits: 14856, costPrice: 2.1728, lastPrice: 2.1728,
    costAmount: 32280, marketValue: 32280,
    unrealizedPnlAmount: 8.1, unrealizedPnlPercent: 0.25,
    prevClosePrice: 2.165, dailyChange: 0.36, dailyChangeAmount: 116,
    rating: "B", riskLevel: "green", strategy: "已减半，定投降至200/日", autoInvest: 200, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "008258", name: "景顺景颐招利6个月持有期债券A", type: "债券", assetCategory: "fund",
    holdingUnits: 15431, costPrice: 1.3336, lastPrice: 1.3336,
    costAmount: 20575, marketValue: 20575,
    unrealizedPnlAmount: 2.7, unrealizedPnlPercent: 0.01,
    prevClosePrice: 1.3336, dailyChange: 0.00, dailyChangeAmount: 0,
    rating: "A", riskLevel: "green", strategy: "固收底仓，稳定持有", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "012996", name: "易方达软件ETF联接C", type: "A股科技", assetCategory: "fund",
    holdingUnits: 20178, costPrice: 1.0532, lastPrice: 1.0373,
    costAmount: 21254, marketValue: 20927,
    unrealizedPnlAmount: -327, unrealizedPnlPercent: -1.54,
    prevClosePrice: 1.0533, dailyChange: -1.51, dailyChangeAmount: -322,
    rating: "C", riskLevel: "yellow", strategy: "浮亏中，反弹减仓", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "008764", name: "天弘越南市场股票发起(QDII)C", type: "QDII新兴", assetCategory: "fund",
    holdingUnits: 13800, costPrice: 1.6810, lastPrice: 1.6810,
    costAmount: 23198, marketValue: 23198,
    unrealizedPnlAmount: 3.3, unrealizedPnlPercent: 0.01,
    prevClosePrice: 1.6839, dailyChange: -0.17, dailyChangeAmount: -40,
    rating: "B", riskLevel: "green", strategy: "新兴市场配置，持有", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "012548", name: "天弘恒生科技ETF联接C", type: "港股科技", assetCategory: "fund",
    holdingUnits: 58110, costPrice: 0.6946, lastPrice: 0.6922,
    costAmount: 40360, marketValue: 40227,
    unrealizedPnlAmount: -133, unrealizedPnlPercent: -0.33,
    prevClosePrice: 0.6898, dailyChange: 0.35, dailyChangeAmount: 140,
    rating: "C", riskLevel: "yellow", strategy: "反弹回本后减仓", autoInvest: 100, triggerPrice: 0.79, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "011098", name: "兴业中证港股通互联网ETF联接C", type: "港股互联网", assetCategory: "fund",
    holdingUnits: 18920, costPrice: 1.2316, lastPrice: 1.2257,
    costAmount: 23295, marketValue: 23193,
    unrealizedPnlAmount: -102, unrealizedPnlPercent: -0.44,
    prevClosePrice: 1.2198, dailyChange: 0.48, dailyChangeAmount: 110,
    rating: "D", riskLevel: "red", strategy: "反弹回本后立即减仓", autoInvest: 0, triggerPrice: 1.58, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "014077", name: "平安新能源精选混合发起式C", type: "A股新能源", assetCategory: "fund",
    holdingUnits: 3148, costPrice: 1.2774, lastPrice: 1.3073,
    costAmount: 4021, marketValue: 4116,
    unrealizedPnlAmount: 95, unrealizedPnlPercent: 2.36,
    prevClosePrice: 1.3379, dailyChange: -2.29, dailyChangeAmount: -96,
    rating: "B", riskLevel: "yellow", strategy: "盈利但波动大，观望", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "014078", name: "平安资源精选混合发起式C", type: "A股资源", assetCategory: "fund",
    holdingUnits: 11109, costPrice: 1.2816, lastPrice: 1.2876,
    costAmount: 14239, marketValue: 14300,
    unrealizedPnlAmount: 61, unrealizedPnlPercent: 0.43,
    prevClosePrice: 1.2937, dailyChange: -0.47, dailyChangeAmount: -68,
    rating: "C", riskLevel: "yellow", strategy: "已暂停定投，反弹减仓", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "011579", name: "易方达科融混合", type: "A股混合", assetCategory: "fund",
    holdingUnits: 700, costPrice: 8.4119, lastPrice: 8.3102,
    costAmount: 5887, marketValue: 5817,
    unrealizedPnlAmount: -70, unrealizedPnlPercent: -1.19,
    prevClosePrice: 8.210, dailyChange: 1.22, dailyChangeAmount: 70,
    rating: "A", riskLevel: "green", strategy: "今日领涨！继续持有", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "011256", name: "易方达中证红利ETF联接发起式A", type: "红利", assetCategory: "fund",
    holdingUnits: 6252, costPrice: 1.3024, lastPrice: 1.3027,
    costAmount: 8143, marketValue: 8145,
    unrealizedPnlAmount: 2, unrealizedPnlPercent: 0.02,
    prevClosePrice: 1.3030, dailyChange: -0.02, dailyChangeAmount: -2,
    rating: "B", riskLevel: "green", strategy: "红利底仓，长期持有", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "012346", name: "平安鑫安混合C", type: "A股混合", assetCategory: "fund",
    holdingUnits: 3277, costPrice: 2.7950, lastPrice: 2.8227,
    costAmount: 9159, marketValue: 9249,
    unrealizedPnlAmount: 90, unrealizedPnlPercent: 0.98,
    prevClosePrice: 2.8506, dailyChange: -0.98, dailyChangeAmount: -91,
    rating: "D", riskLevel: "red", strategy: "待清仓！尽快执行", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "011619", name: "安信新价值混合C", type: "固收+", assetCategory: "fund",
    holdingUnits: 12675, costPrice: 1.9973, lastPrice: 1.9982,
    costAmount: 25318, marketValue: 25328,
    unrealizedPnlAmount: 10, unrealizedPnlPercent: 0.04,
    prevClosePrice: 1.9992, dailyChange: -0.05, dailyChangeAmount: -13,
    rating: "B", riskLevel: "green", strategy: "固收+底仓，稳定持有", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  // ETF
  {
    code: "159616", name: "农牧ETF建信", type: "ETF", assetCategory: "etf",
    holdingUnits: 20000, costPrice: 0.981, lastPrice: 0.901,
    costAmount: 19620, marketValue: 18020,
    unrealizedPnlAmount: -1600, unrealizedPnlPercent: -8.15,
    prevClosePrice: 0.906, dailyChange: -0.55, dailyChangeAmount: -100,
    rating: "C", riskLevel: "yellow", strategy: "浮亏中，可做T", autoInvest: 0, isT0: true,
    priceAsOf: "2026-05-12 15:00", priceSource: "实时行情", priceDelayHours: 0, isMock: true
  }
];

// T0 trading targets
export const t0Targets: T0Target[] = [
  {
    code: "513130", name: "恒生科技ETF", price: 0.640, dailyChange: -0.16, amplitude: 1.09,
    t0Score: 3, status: "观望", signal: "相对抗跌，可观望尾盘机会",
    isT0: true, isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "实时行情"
  },
  {
    code: "513100", name: "纳指ETF", price: 2.093, dailyChange: -0.71, amplitude: 1.00,
    t0Score: 2, status: "偏弱", signal: "纳指新高但涨幅收窄",
    isT0: true, isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "实时行情"
  },
  {
    code: "159819", name: "人工智能ETF易方达", price: 1.941, dailyChange: -0.36, amplitude: 1.69,
    t0Score: 4, status: "关注", signal: "振幅大适合做T",
    isT0: true, isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "实时行情"
  },
  {
    code: "513520", name: "日经ETF华夏", price: 2.143, dailyChange: -0.19, amplitude: 1.26,
    t0Score: 2, status: "观望", signal: "波动一般",
    isT0: true, isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "实时行情"
  },
  {
    code: "159616", name: "农牧ETF建信", price: 0.901, dailyChange: -0.55, amplitude: 1.20,
    t0Score: 3, status: "关注", signal: "农业板块轮动机会",
    isT0: true, isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "实时行情"
  }
];

// Gold holdings
export const gold: Gold = {
  internationalPrice: 4739.3, exchangeRate: 6.794, yuanPerGram: 1035.2,
  holding: 30.4188, value: 31490, profit: 1490, profitPercent: 5.0,
  isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "上海黄金交易所"
};

// Macro data
export const macro: Macro = {
  usStocks: {
    dowJones: { value: 49704.47, change: 0.19 },
    nasdaq: { value: 26274.13, change: 0.10 },
    sp500: { value: 7412.84, change: 0.19 },
    note: "三大指数齐创历史收盘新高"
  },
  commodities: {
    gold: { price: 4739.3, change: 0.5, signal: "高位，不宜追" },
    silver: { price: 86.88, change: 0.92, signal: "跟随黄金" },
    copper: { price: 6.44, change: 0, signal: "历史新高" },
    oil: { price: 98.06, change: 0, signal: "高位震荡" }
  },
  isMock: true, asOf: "2026-05-12 15:00", source: "模拟数据"
};

// Pending actions
export const pendingActions: PendingAction[] = [
  { action: "清仓平安鑫安混合C", code: "012346", trigger: "尽快执行", priority: "high" },
  { action: "兴业港股互联网反弹减仓", code: "011098", trigger: "净值回到1.58", priority: "medium" },
  { action: "天弘恒生科技反弹减仓", code: "012548", trigger: "净值回到0.79", priority: "medium" },
  { action: "平安资源精选反弹减仓", code: "014078", trigger: "反弹回本", priority: "low" }
];

// History
export const history: History[] = [
  { date: "2026-05-11", action: "纳指ETF清仓", detail: "2500份@2.106，回笼约5,265元", status: "done" },
  { date: "2026-05-11", action: "机器人ETF清仓", detail: "@1.456，回笼约6,261元", status: "done" },
  { date: "2026-05-11", action: "摩根日本减半", detail: "卖出一半约16,000元", status: "done" },
  { date: "2026-05-11", action: "平安医疗清仓", detail: "全部清仓", status: "done" },
  { date: "2026-05-12", action: "平安鑫安C清仓", detail: "约9,159元", status: "pending" }
];

// Calculate portfolio summary dynamically
const portfolioSummary = calculatePortfolioSummary(holdings, gold, cashBalance);

// Export portfolio data (legacy format for backward compatibility)
export const portfolioData = {
  get totalAssets() { return portfolioSummary.totalAssets; },
  get todayChange() { return portfolioSummary.todayChange; },
  get todayChangePercent() { return portfolioSummary.todayChangePercent; },
  get cashBalance() { return cashBalance; },

  // Legacy exports - these will be phased out
  funds: holdings.filter(h => h.assetCategory === 'fund').map(h => ({
    name: h.name,
    code: h.code,
    type: h.type,
    amount: h.marketValue,
    cost: h.costPrice,
    current: h.lastPrice,
    profit: h.unrealizedPnlAmount,
    dailyChange: h.dailyChange,
    rating: h.rating,
    riskLevel: h.riskLevel,
    strategy: h.strategy,
    autoInvest: h.autoInvest,
    triggerPrice: h.triggerPrice
  })),

  etfStocks: holdings.filter(h => h.assetCategory === 'etf').map(h => ({
    name: h.name,
    code: h.code,
    exchange: "sz",
    amount: h.marketValue,
    price: h.lastPrice,
    cost: h.costPrice,
    profit: h.unrealizedPnlAmount,
    profitPercent: h.unrealizedPnlPercent,
    dailyChange: h.dailyChange,
    shares: h.holdingUnits
  })),

  t0Targets,
  gold,
  macro,
  pendingActions,
  history
};
