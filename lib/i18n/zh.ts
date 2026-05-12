/**
 * i18n Chinese translations - v3.0
 * Structure to support future English translations
 */

export const zh = {
  // App metadata
  appTitle: 'InvestScope 投资看板',
  appDescription: '个人投资组合管理与决策系统',
  internalName: '帝国操盘室',

  // Navigation
  nav: {
    overview: '总览',
    holdings: '持仓',
    trading: '做T',
    macro: '宏观',
    logs: '日志',
    settings: '设置'
  },

  // Common
  common: {
    loading: '加载中...',
    error: '加载失败',
    retry: '重试',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '新增',
    confirm: '确认',
    back: '返回',
    total: '总计',
    today: '今日',
    yesterday: '昨日',
    amount: '金额',
    quantity: '数量',
    price: '价格',
    profit: '盈亏',
    profitPercent: '盈亏%',
    change: '涨跌',
    changePercent: '涨跌幅'
  },

  // Dashboard
  dashboard: {
    totalAssets: '总资产',
    todayChange: '今日盈亏',
    cumulativeProfit: '累计盈亏',
    cashBalance: '现金余额',
    bestPerformer: '今日领涨',
    worstPerformer: '今日领跌',
    assetAllocation: '资产配置',
    recentActivity: '近期活动'
  },

  // Holdings
  holdings: {
    title: '持仓明细',
    fund: '基金',
    etf: 'ETF',
    stock: '股票',
    gold: '黄金',
    code: '代码',
    name: '名称',
    type: '类型',
    holdingUnits: '持有份额',
    costPrice: '成本价',
    lastPrice: '最新价',
    marketValue: '市值',
    costAmount: '投入成本',
    unrealizedPnl: '浮盈亏',
    dailyChange: '今日涨跌',
    strategyRating: '策略评级',
    riskLevel: '风险等级',
    strategy: '策略建议',
    autoInvest: '每日定投',
    triggerPrice: '触发价',
    addHolding: '新增持仓',
    editHolding: '编辑持仓',
    deleteHolding: '删除持仓',
    noHoldings: '暂无持仓数据',
    addFirstHolding: '点击右上角新增持仓开始使用'
  },

  // Trading
  trading: {
    title: '做T工具',
    t0Targets: 'T0标的',
    t0Calculator: '做T计算器',
    tradingRules: '交易纪律',
    entrySignal: '买入信号',
    exitSignal: '卖出信号',
    stopLoss: '止损',
    takeProfit: '止盈',
    positionSize: '仓位大小',
    buyPrice: '买入价',
    sellPrice: '卖出价',
    quantity: '数量',
    assetType: '资产类型',
    expectedProfit: '预期收益',
    totalFees: '总费用',
    netProfit: '净收益',
    profitPercent: '收益率',
    breakEvenPrice: '盈亏平衡价',
    commission: '佣金',
    stampDuty: '印花税',
    transferFee: '过户费',
    buyCommission: '买入佣金',
    sellCommission: '卖出佣金',
    grossProfit: '毛收益',
    feeDetails: '费用明细'
  },

  // Macro
  macro: {
    title: '宏观概览',
    usStocks: '美股市场',
    commodities: '大宗商品',
    sectorRotation: '板块轮动',
    asianMarkets: '亚太市场',
    europeanMarkets: '欧洲市场',
    currencies: '汇率市场',
    dowJones: '道琼斯',
    nasdaq: '纳斯达克',
    sp500: '标普500',
    gold: '黄金',
    silver: '白银',
    copper: '铜',
    oil: '原油',
    signal: '信号'
  },

  // Logs
  logs: {
    title: '操作日志',
    history: '历史记录',
    pendingActions: '待办事项',
    date: '日期',
    action: '操作',
    detail: '详情',
    status: '状态',
    statusDone: '已完成',
    statusPending: '待处理',
    priority: '优先级',
    priorityHigh: '高',
    priorityMedium: '中',
    priorityLow: '低',
    addLog: '新增日志',
    addTodo: '新增待办',
    noLogs: '暂无操作记录',
    noTodos: '暂无待办事项'
  },

  // Asset detail
  assetDetail: {
    title: '标的详情',
    overview: '概览',
    strategyAndRisk: '评级与风险',
    strategyRating: '策略评级',
    riskLevel: '风险等级',
    strategyAdvice: '策略建议',
    recentTrend: '近期走势',
    tradingSignals: '交易信号',
    note: '备注'
  },

  // Risk levels
  riskLevels: {
    green: '低风险',
    yellow: '中等风险',
    red: '高风险'
  },

  // Ratings
  ratings: {
    A: '强烈推荐',
    B: '推荐',
    C: '观望',
    D: '规避'
  },

  // Disclaimer
  disclaimer: {
    title: '免责声明',
    warning: '⚠️ 免责声明',
    text1: '本工具仅供参考，不构成任何投资建议。投资有风险，入市需谨慎。',
    text2: '数据可能存在延迟，请以官方渠道为准。',
    version: 'InvestScope 投资看板 v3.0 | 内部代号：帝国操盘室'
  },

  // Mock data notice
  mockData: {
    label: '📊 演示数据',
    notice: '本数据为演示用途'
  },

  // Form validation
  validation: {
    required: '此字段为必填项',
    positiveNumber: '请输入正数',
    invalidCode: '请输入有效的代码',
    invalidPrice: '请输入有效的价格',
    invalidQuantity: '请输入有效的数量'
  }
};

export type Translations = typeof zh;
