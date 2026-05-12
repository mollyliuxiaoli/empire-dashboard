import { HoldingLegacy, T0Target, Gold, Macro, PendingAction, History } from '@/types/portfolio';
import { calculatePortfolioSummary } from '@/lib/portfolio-calculations';

export interface Fund {
  name: string; code: string; type: string;
  amount: number; cost: number; current: number;
  profit: number; dailyChange: number;
  rating: 'A' | 'B' | 'C' | 'D';
  riskLevel: 'green' | 'yellow' | 'red';
  strategy: string; autoInvest: number; triggerPrice?: number;
}

export interface ETFStock {
  name: string; code: string; exchange: string;
  amount: number; price: number; cost: number;
  profit: number; profitPercent: number;
  dailyChange: number; shares: number;
}

// ===== 美股持仓 =====
export interface USStock {
  name: string; code: string;
  price: number; costPrice: number; shares: number;
  marketValue: number; pnl: number;
}

export const usStocks: USStock[] = [
  { name: "Bitdeer Technologies", code: "BTDR", price: 12.92, costPrice: 11.12, shares: 602, marketValue: 7777.84, pnl: 1323.45 },
  { name: "Coinbase Global", code: "COIN", price: 212.12, costPrice: 306.20, shares: 10, marketValue: 2121.20, pnl: -945.53 },
  { name: "Roundhill Mem ETF", code: "DRAM", price: 51.55, costPrice: 50.28, shares: 1, marketValue: 51.55, pnl: 1.29 },
  { name: "IREN Ltd", code: "IREN", price: 55.80, costPrice: 57.16, shares: 225, marketValue: 12555.00, pnl: -1601.32 },
  { name: "JPMorgan Equity Premium", code: "JEPI", price: 55.82, costPrice: 56.67, shares: 171, marketValue: 9545.39, pnl: -141.89 },
  { name: "迈威尔科技", code: "MRVL", price: 165.38, costPrice: 167.55, shares: 8, marketValue: 1323.04, pnl: -14.14 },
  { name: "Oklo Inc.", code: "OKLO", price: 75.95, costPrice: 72.93, shares: 30, marketValue: 2278.50, pnl: 145.99 },
  { name: "甲骨文", code: "ORCL", price: 191.49, costPrice: 235.11, shares: 62, marketValue: 11936.38, pnl: -2675.95 },
  { name: "辉瑞", code: "PFE", price: 25.82, costPrice: 26.36, shares: 61, marketValue: 1575.02, pnl: -9.47 },
  { name: "X-Energy", code: "XE", price: 32.71, costPrice: 31.16, shares: 184, marketValue: 6018.24, pnl: 258.04 },
];

// ===== 港股持仓 =====
export interface HKStock {
  name: string; code: string;
  price: number; costPrice: number; shares: number;
  marketValue: number; pnl: number;
}

export const hkStocks: HKStock[] = [
  { name: "美团-W", code: "03690", price: 84.150, costPrice: 90.267, shares: 600, marketValue: 50490.00, pnl: -8569.32 },
  { name: "阿里巴巴-W", code: "09988", price: 133.300, costPrice: 122.531, shares: 100, marketValue: 13330.00, pnl: 1076.91 },
];

const cashBalance = 15112;

// ===== 基金持仓（支付宝） =====
export const holdings: HoldingLegacy[] = [
  // 第一组：盈利
  {
    code: "014368", name: "富国全球科技互联网股票(QDII)C", type: "QDII科技", assetCategory: "fund",
    holdingUnits: 5580, costPrice: 3.910, lastPrice: 5.2287,
    costAmount: 21873, marketValue: 29194,
    unrealizedPnlAmount: 7321, unrealizedPnlPercent: 33.78,
    prevClosePrice: 5.168, dailyChange: 1.18, dailyChangeAmount: 338,
    rating: "A", riskLevel: "green", strategy: "盈利丰厚，继续定投", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "010719", name: "易方达科融混合", type: "A股混合", assetCategory: "fund",
    holdingUnits: 780, costPrice: 6.773, lastPrice: 8.3102,
    costAmount: 5283, marketValue: 6489,
    unrealizedPnlAmount: 1189, unrealizedPnlPercent: 22.87,
    prevClosePrice: 8.148, dailyChange: 1.99, dailyChangeAmount: 133,
    rating: "A", riskLevel: "green", strategy: "金选·超额收益，继续定投", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "014077", name: "平安新能源精选混合C", type: "A股新能源", assetCategory: "fund",
    holdingUnits: 3214, costPrice: 1.213, lastPrice: 1.2765,
    costAmount: 3490, marketValue: 4098,
    unrealizedPnlAmount: 606, unrealizedPnlPercent: 17.88,
    prevClosePrice: 1.3073, dailyChange: -2.36, dailyChangeAmount: -11,
    rating: "B", riskLevel: "yellow", strategy: "盈利但波动大，继续定投", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "012361", name: "华宝纳斯达克精选股票发起式(QDII)A", type: "QDII美股", assetCategory: "fund",
    holdingUnits: 11234, costPrice: 2.095, lastPrice: 2.4036,
    costAmount: 23534, marketValue: 26959,
    unrealizedPnlAmount: 3447, unrealizedPnlPercent: 14.78,
    prevClosePrice: 2.3890, dailyChange: 0.61, dailyChangeAmount: 433,
    rating: "A", riskLevel: "green", strategy: "纳指长期看涨，继续定投", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "007221", name: "摩根日本精选股票(QDII)A", type: "QDII日本", assetCategory: "fund",
    holdingUnits: 16056, costPrice: 2.008, lastPrice: 2.1728,
    costAmount: 32245, marketValue: 34887,
    unrealizedPnlAmount: 1360, unrealizedPnlPercent: 8.23,
    prevClosePrice: 2.165, dailyChange: 0.36, dailyChangeAmount: 122,
    rating: "B", riskLevel: "green", strategy: "定投200/日", autoInvest: 200, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "008764", name: "天弘越南市场股票发起(QDII)C", type: "QDII新兴", assetCategory: "fund",
    holdingUnits: 14306, costPrice: 1.630, lastPrice: 1.6810,
    costAmount: 23319, marketValue: 24052,
    unrealizedPnlAmount: 716, unrealizedPnlPercent: 3.10,
    prevClosePrice: 1.6839, dailyChange: -0.17, dailyChangeAmount: -40,
    rating: "B", riskLevel: "green", strategy: "新兴市场配置，持有", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  // 第二组：固收/低波动
  {
    code: "008258", name: "景顺长城景颐招利6个月持有期债券A", type: "债券", assetCategory: "fund",
    holdingUnits: 15431, costPrice: 1.299, lastPrice: 1.3336,
    costAmount: 20046, marketValue: 20537,
    unrealizedPnlAmount: 537, unrealizedPnlPercent: 2.68,
    prevClosePrice: 1.3336, dailyChange: 0.04, dailyChangeAmount: 8,
    rating: "A", riskLevel: "green", strategy: "固收+底仓，稳定持有", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "011619", name: "安信新价值灵活配置混合C", type: "固收+", assetCategory: "fund",
    holdingUnits: 12682, costPrice: 1.971, lastPrice: 1.9982,
    costAmount: 25000, marketValue: 25351,
    unrealizedPnlAmount: 351, unrealizedPnlPercent: 1.41,
    prevClosePrice: 1.9992, dailyChange: -0.05, dailyChangeAmount: 65,
    rating: "B", riskLevel: "green", strategy: "固收+底仓，稳定持有", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "501305", name: "华宝标普港股通低波红利ETF联接A", type: "港股红利", assetCategory: "fund",
    holdingUnits: 7230, costPrice: 1.267, lastPrice: 1.2746,
    costAmount: 9162, marketValue: 9218,
    unrealizedPnlAmount: 59, unrealizedPnlPercent: 0.65,
    prevClosePrice: 1.2670, dailyChange: 0.60, dailyChangeAmount: 54,
    rating: "B", riskLevel: "green", strategy: "金选·指数基金，定投", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "011256", name: "易方达中证红利ETF联接发起式A", type: "红利", assetCategory: "fund",
    holdingUnits: 6403, costPrice: 1.298, lastPrice: 1.3027,
    costAmount: 8315, marketValue: 8330,
    unrealizedPnlAmount: 30, unrealizedPnlPercent: 0.37,
    prevClosePrice: 1.3030, dailyChange: -0.02, dailyChangeAmount: 34,
    rating: "B", riskLevel: "green", strategy: "红利底仓，定投100/日", autoInvest: 100, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  // 第二组：亏损/待处理
  {
    code: "012346", name: "平安鑫安混合C", type: "A股混合", assetCategory: "fund",
    holdingUnits: 0, costPrice: 2.8227, lastPrice: 2.8227,
    costAmount: 0, marketValue: 0,
    unrealizedPnlAmount: 0, unrealizedPnlPercent: 0,
    prevClosePrice: 2.8506, dailyChange: -0.98, dailyChangeAmount: 0,
    rating: "D", riskLevel: "red", strategy: "已清仓", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "014078", name: "平安资源精选混合发起式C", type: "A股资源", assetCategory: "fund",
    holdingUnits: 10937, costPrice: 1.442, lastPrice: 1.2816,
    costAmount: 15771, marketValue: 14031,
    unrealizedPnlAmount: -1766, unrealizedPnlPercent: -11.18,
    prevClosePrice: 1.2937, dailyChange: -0.47, dailyChangeAmount: -250,
    rating: "C", riskLevel: "yellow", strategy: "已暂停定投，反弹减仓", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "012548", name: "天弘恒生科技ETF联接(QDII)C", type: "港股科技", assetCategory: "fund",
    holdingUnits: 60382, costPrice: 0.795, lastPrice: 0.6922,
    costAmount: 48004, marketValue: 41692,
    unrealizedPnlAmount: -6308, unrealizedPnlPercent: -13.17,
    prevClosePrice: 0.6898, dailyChange: 0.35, dailyChangeAmount: 24,
    rating: "C", riskLevel: "yellow", strategy: "反弹回本后减仓", autoInvest: 100, triggerPrice: 0.79, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "012996", name: "易方达软件服务ETF联接C", type: "A股科技", assetCategory: "fund",
    holdingUnits: 20688, costPrice: 1.212, lastPrice: 1.0508,
    costAmount: 25074, marketValue: 21767,
    unrealizedPnlAmount: -3351, unrealizedPnlPercent: -13.34,
    prevClosePrice: 1.0532, dailyChange: -0.23, dailyChangeAmount: 155,
    rating: "C", riskLevel: "yellow", strategy: "浮亏中，反弹减仓", autoInvest: 0, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  {
    code: "011098", name: "兴业中证港股通互联网ETF联接C", type: "港股互联网", assetCategory: "fund",
    holdingUnits: 19328, costPrice: 1.582, lastPrice: 1.2257,
    costAmount: 30585, marketValue: 23786,
    unrealizedPnlAmount: -7214, unrealizedPnlPercent: -23.27,
    prevClosePrice: 1.2198, dailyChange: 0.48, dailyChangeAmount: -307,
    rating: "D", riskLevel: "red", strategy: "反弹回本后立即减仓", autoInvest: 0, triggerPrice: 1.58, isT0: false,
    priceAsOf: "2026-05-12 15:00", priceSource: "天天基金估值", priceDelayHours: 0, isMock: true
  },
  // ETF持仓
  {
    code: "159825", name: "农牧ETF建信", type: "ETF", assetCategory: "etf",
    holdingUnits: 20000, costPrice: 0.9793, lastPrice: 0.895,
    costAmount: 19586, marketValue: 17900,
    unrealizedPnlAmount: -1685, unrealizedPnlPercent: -8.60,
    prevClosePrice: 0.906, dailyChange: -1.21, dailyChangeAmount: -218,
    rating: "C", riskLevel: "yellow", strategy: "浮亏中，可做T", autoInvest: 0, isT0: true,
    priceAsOf: "2026-05-12 15:00", priceSource: "实时行情", priceDelayHours: 0, isMock: true
  },
  {
    code: "513130", name: "恒生科技ETF华泰柏瑞", type: "ETF", assetCategory: "etf",
    holdingUnits: 7700, costPrice: 0.6356, lastPrice: 0.635,
    costAmount: 4894, marketValue: 4890,
    unrealizedPnlAmount: -5, unrealizedPnlPercent: -0.10,
    prevClosePrice: 0.641, dailyChange: -0.94, dailyChangeAmount: -46,
    rating: "B", riskLevel: "yellow", strategy: "T+0标的，做T降成本", autoInvest: 0, isT0: true,
    priceAsOf: "2026-05-12 15:00", priceSource: "实时行情", priceDelayHours: 0, isMock: true
  },
];

// ===== T0 做T标的池 =====
export const t0Targets: T0Target[] = [
  {
    code: "513130", name: "恒生科技ETF华泰柏瑞", price: 0.635, dailyChange: -0.94, amplitude: 1.09,
    t0Score: 3, status: "观望", signal: "持仓中，观望尾盘机会",
    isT0: true, isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "实时行情"
  },
  {
    code: "159825", name: "农牧ETF建信", price: 0.895, dailyChange: -1.21, amplitude: 1.20,
    t0Score: 4, status: "关注", signal: "浮亏-8.6%，做T降成本",
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
];

// ===== 黄金持仓 =====
export const gold: Gold = {
  internationalPrice: 4711.4, exchangeRate: 6.7954, yuanPerGram: 1028.84,
  holding: 30.4189, value: 31296, profit: 1296, profitPercent: 4.3,
  isMock: true, priceAsOf: "2026-05-12 15:00", priceSource: "京东黄金·民生银行"
};

// ===== 宏观数据 =====
export const macro: Macro = {
  usStocks: {
    dowJones: { value: 49704.47, change: 0.19 },
    nasdaq: { value: 26274.13, change: 0.10 },
    sp500: { value: 7412.84, change: 0.19 },
    note: "三大指数齐创历史收盘新高"
  },
  commodities: {
    gold: { price: 4711.4, change: -0.62, signal: "高位调整" },
    silver: { price: 86.88, change: 0.92, signal: "跟随黄金" },
    copper: { price: 6.44, change: 0, signal: "历史新高" },
    oil: { price: 98.06, change: 0, signal: "高位震荡" }
  },
  isMock: true, asOf: "2026-05-12 15:00", source: "综合市场数据"
};

// ===== 待执行操作 =====
export const pendingActions: PendingAction[] = [
  { action: "兴业港股互联网反弹减仓", code: "011098", trigger: "净值回到1.58（当前-23.27%）", priority: "high" },
  { action: "天弘恒生科技反弹减仓", code: "012548", trigger: "净值回到0.79（当前-13.17%）", priority: "medium" },
  { action: "易方达软件ETF反弹减仓", code: "012996", trigger: "反弹减仓（当前-13.34%）", priority: "medium" },
  { action: "平安资源精选反弹减仓", code: "014078", trigger: "反弹回本（当前-11.18%）", priority: "low" },
];

// ===== 操作历史 =====
export const history: History[] = [
  { date: "2026-05-12", action: "平安鑫安C确认清仓", detail: "金额¥0，已清仓完毕", status: "done" },
  { date: "2026-05-11", action: "纳指ETF清仓", detail: "2500份@2.106，回笼约5,265元", status: "done" },
  { date: "2026-05-11", action: "机器人ETF清仓", detail: "@1.456，回笼约6,261元", status: "done" },
  { date: "2026-05-11", action: "摩根日本减半", detail: "卖出一半约16,000元", status: "done" },
  { date: "2026-05-11", action: "平安医疗清仓", detail: "全部清仓", status: "done" },
];

// ===== 动态计算 =====
const portfolioSummary = calculatePortfolioSummary(holdings, gold, cashBalance);

export const portfolioData = {
  get totalAssets() { return portfolioSummary.totalAssets; },
  get todayChange() { return portfolioSummary.todayChange; },
  get todayChangePercent() { return portfolioSummary.todayChangePercent; },
  get cashBalance() { return cashBalance; },

  funds: holdings.filter(h => h.assetCategory === 'fund').map(h => ({
    name: h.name, code: h.code, type: h.type,
    amount: h.marketValue, cost: h.costPrice, current: h.lastPrice,
    profit: h.unrealizedPnlAmount, dailyChange: h.dailyChange,
    rating: h.rating, riskLevel: h.riskLevel, strategy: h.strategy,
    autoInvest: h.autoInvest, triggerPrice: h.triggerPrice
  })),

  etfStocks: holdings.filter(h => h.assetCategory === 'etf').map(h => ({
    name: h.name, code: h.code, exchange: h.code.startsWith('5') ? "sh" : "sz",
    amount: h.marketValue, price: h.lastPrice, cost: h.costPrice,
    profit: h.unrealizedPnlAmount, profitPercent: h.unrealizedPnlPercent,
    dailyChange: h.dailyChange, shares: h.holdingUnits
  })),

  t0Targets, gold, macro, usStocks, hkStocks, pendingActions, history
};
