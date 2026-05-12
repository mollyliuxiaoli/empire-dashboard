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

export interface T0Target {
  code: string;
  name: string;
  price: number;
  dailyChange: number;
  amplitude: number;
  t0Score: number;
  status: string;
  signal: string;
}

export interface Gold {
  internationalPrice: number;
  exchangeRate: number;
  yuanPerGram: number;
  holding: number;
  value: number;
  profit: number;
  profitPercent: number;
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

export const portfolioData = {
  totalAssets: 342417,
  todayChange: -327,
  todayChangePercent: -0.10,

  funds: [
    { name: "富国全球科技互联网股票(QDII)C", code: "014368", type: "QDII科技", amount: 25761, cost: 5.2287, current: 5.2287, profit: 30, dailyChange: 0.09, rating: "B", riskLevel: "green" as const, strategy: "持有，盈利丰厚继续定投", autoInvest: 100 },
    { name: "华宝纳斯达克精选股票发起式(QDII)A", code: "012361", type: "QDII美股", amount: 25566, cost: 2.4036, current: 2.4036, profit: 13, dailyChange: 0.14, rating: "B", riskLevel: "green" as const, strategy: "持有，纳指长期看涨", autoInvest: 100 },
    { name: "摩根日本精选股票(QDII)A", code: "007221", type: "QDII日本", amount: 32280, cost: 2.1728, current: 2.1728, profit: 8.1, dailyChange: 0.36, rating: "B", riskLevel: "green" as const, strategy: "已减半，定投降至200/日", autoInvest: 200 },
    { name: "景顺景颐招利6个月持有期债券A", code: "008258", type: "债券", amount: 20575, cost: 1.3336, current: 1.3336, profit: 2.7, dailyChange: 0.00, rating: "A", riskLevel: "green" as const, strategy: "固收底仓，稳定持有", autoInvest: 100 },
    { name: "易方达软件ETF联接C", code: "012996", type: "A股科技", amount: 21254, cost: 1.0532, current: 1.0373, profit: -14.0, dailyChange: -1.51, rating: "C", riskLevel: "yellow" as const, strategy: "浮亏中，反弹减仓", autoInvest: 0 },
    { name: "天弘越南市场股票发起(QDII)C", code: "008764", type: "QDII新兴", amount: 23198, cost: 1.6810, current: 1.6810, profit: 3.3, dailyChange: -0.17, rating: "B", riskLevel: "green" as const, strategy: "新兴市场配置，持有", autoInvest: 100 },
    { name: "天弘恒生科技ETF联接C", code: "012548", type: "港股科技", amount: 40360, cost: 0.6946, current: 0.6922, profit: -13.3, dailyChange: 0.35, rating: "C", riskLevel: "yellow" as const, strategy: "反弹回本后减仓", autoInvest: 100, triggerPrice: 0.79 },
    { name: "兴业中证港股通互联网ETF联接C", code: "011098", type: "港股互联网", amount: 23295, cost: 1.2316, current: 1.2257, profit: -22.3, dailyChange: 0.48, rating: "D", riskLevel: "red" as const, strategy: "反弹回本后立即减仓", autoInvest: 0, triggerPrice: 1.58 },
    { name: "平安新能源精选混合发起式C", code: "014077", type: "A股新能源", amount: 4021, cost: 1.2774, current: 1.3073, profit: 18.8, dailyChange: -2.29, rating: "B", riskLevel: "yellow" as const, strategy: "盈利但波动大，观望", autoInvest: 100 },
    { name: "平安资源精选混合发起式C", code: "014078", type: "A股资源", amount: 14239, cost: 1.2816, current: 1.2876, profit: -9.6, dailyChange: -0.47, rating: "C", riskLevel: "yellow" as const, strategy: "已暂停定投，反弹减仓", autoInvest: 0 },
    { name: "易方达科融混合", code: "011579", type: "A股混合", amount: 5887, cost: 8.4119, current: 8.3102, profit: 19.7, dailyChange: 1.22, rating: "A", riskLevel: "green" as const, strategy: "今日最佳！继续持有", autoInvest: 100 },
    { name: "易方达中证红利ETF联接发起式A", code: "011256", type: "红利", amount: 8143, cost: 1.3024, current: 1.3027, profit: -0.05, dailyChange: -0.02, rating: "B", riskLevel: "green" as const, strategy: "红利底仓，长期持有", autoInvest: 100 },
    { name: "平安鑫安混合C", code: "012346", type: "A股混合", amount: 9159, cost: 2.7950, current: 2.8227, profit: -0.98, dailyChange: -0.98, rating: "D", riskLevel: "red" as const, strategy: "待清仓！尽快执行", autoInvest: 0 },
    { name: "安信新价值混合C", code: "011619", type: "固收+", amount: 25318, cost: 1.9973, current: 1.9982, profit: 1.2, dailyChange: -0.05, rating: "B", riskLevel: "green" as const, strategy: "固收+底仓，稳定持有", autoInvest: 0 }
  ] as Fund[],

  etfStocks: [
    { name: "农牧ETF建信", code: "159616", exchange: "sz", amount: 16759, price: 0.901, cost: 0.981, profit: -1469, profitPercent: -8.1, dailyChange: -0.55, shares: 20000 }
  ] as ETFStock[],

  t0Targets: [
    { code: "513130", name: "恒生科技ETF", price: 0.640, dailyChange: -0.16, amplitude: 1.09, t0Score: 3, status: "观望", signal: "相对抗跌，可观望尾盘机会" },
    { code: "513100", name: "纳指ETF", price: 2.093, dailyChange: -0.71, amplitude: 1.00, t0Score: 2, status: "偏弱", signal: "纳指新高但涨幅收窄" },
    { code: "159819", name: "人工智能ETF易方达", price: 1.941, dailyChange: -0.36, amplitude: 1.69, t0Score: 4, status: "关注", signal: "振幅大适合做T" },
    { code: "513520", name: "日经ETF华夏", price: 2.143, dailyChange: -0.19, amplitude: 1.26, t0Score: 2, status: "观望", signal: "波动一般" },
    { code: "159616", name: "农牧ETF建信", price: 0.901, dailyChange: -0.55, amplitude: 1.20, t0Score: 3, status: "关注", signal: "农业板块轮动机会" }
  ] as T0Target[],

  gold: {
    internationalPrice: 4739.3, exchangeRate: 6.794, yuanPerGram: 1035.2,
    holding: 30.4188, value: 31490, profit: 1490, profitPercent: 5.0
  } as Gold,

  macro: {
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
    }
  } as Macro,

  pendingActions: [
    { action: "清仓平安鑫安混合C", code: "012346", trigger: "尽快执行", priority: "high" as const },
    { action: "兴业港股互联网反弹减仓", code: "011098", trigger: "净值回到1.58", priority: "medium" as const },
    { action: "天弘恒生科技反弹减仓", code: "012548", trigger: "净值回到0.79", priority: "medium" as const },
    { action: "平安资源精选反弹减仓", code: "014078", trigger: "反弹回本", priority: "low" as const }
  ] as PendingAction[],

  history: [
    { date: "2026-05-11", action: "纳指ETF清仓", detail: "2500份@2.106，回笼约5,265元", status: "done" as const },
    { date: "2026-05-11", action: "机器人ETF清仓", detail: "@1.456，回笼约6,261元", status: "done" as const },
    { date: "2026-05-11", action: "摩根日本减半", detail: "卖出一半约16,000元", status: "done" as const },
    { date: "2026-05-11", action: "平安医疗清仓", detail: "全部清仓", status: "done" as const },
    { date: "2026-05-12", action: "平安鑫安C清仓", detail: "约9,159元", status: "pending" as const }
  ] as History[]
};
