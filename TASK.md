## 项目：构建「帝国操盘室」投资决策仪表盘

### 产品需求
为用户Molly构建一个个人投资决策仪表盘Web应用，电脑端和手机端都能完美查看。

### 技术要求
- **前端框架：** Next.js 14 + Tailwind CSS + shadcn/ui
- **响应式设计：** 移动端优先，桌面端也完美展示
- **部署：** next.config.js 设置 output: 'export' 用于静态部署到Vercel
- **数据：** 内置真实持仓数据（JSON），后续可接API
- **语言：** UI文案全部中文
- **包管理：** npm

### 信息架构（5大模块页面）

#### Page 1: 📊 持仓总览（首页 / page.tsx）
- **资产全景卡片：** 总市值342,417元、今日盈亏-327元(-0.10%)、本周收益
- **资产配比饼图：** 按类型分布（A股基金/ETF/黄金/港股/美股），用recharts的PieChart
- **涨跌排行：** 今日最佳/最差Top3，红涨绿跌
- **信号看板：** ⚠️减仓提醒 / 🔥止盈提醒 / 📌操作待办 的卡片列表
- **迷你收益曲线：** 用recharts折线图展示模拟的近期走势

#### Page 2: 🎯 标的详情（/holdings/page.tsx）
列表展示所有持仓标的（基金14只+ETF1只+黄金），每项可展开详情：
- 基本面：名称、代码、类型、持仓金额、盈亏%
- 诊断报告：风险评级(🟢🟡🔴)、太后评级(A/B/C/D)
- 操作策略：加仓/持有/减仓/清仓建议
- 定投状态：金额/暂停

#### Page 3: ⚡ 做T中心（/trading/page.tsx）
- **T+0标的池表格：** 代码、名称、现价、涨跌%、振幅%、做T评分(1-5星)、状态标签
- **做T信号卡片：** 每个标的有独立的信号说明
- **做T计算器：** 交互式计算器，输入买入价+数量，实时计算：
  - 止盈价(+2%)、止损价(-1.5%)、预期收益、手续费(万1.5)
- **纪律提示卡片：** 单次≤5000元 | T+0止损-1.5% | 止盈+2%

#### Page 4: 🌍 宏观雷达（/macro/page.tsx）
- **大宗商品卡片网格：** 黄金$4739.3、白银$86.88、铜$6.44/lb、原油$98.06
  每个卡片显示价格、日涨跌、太后信号判断
- **美股传导分析卡片：** 道琼斯49,704、纳指26,274、标普7,412
  显示隔夜涨跌+对A股影响的文字判断
- **汇率卡片：** 美元汇率6.794

#### Page 5: 📋 操作日志（/logs/page.tsx）
- **提醒中心：** 待执行操作列表，按优先级排列（high/medium/low）
  带颜色标识：红色=紧急、黄色=中等、灰色=低
- **历史操作记录：** 时间线形式展示已完成和待完成的操作

### 真实持仓数据（直接硬编码到 data/portfolio.ts）

```typescript
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
  ],

  etfStocks: [
    { name: "农牧ETF建信", code: "159616", exchange: "sz", amount: 16759, price: 0.901, cost: 0.981, profit: -1469, profitPercent: -8.1, dailyChange: -0.55, shares: 20000 }
  ],

  t0Targets: [
    { code: "513130", name: "恒生科技ETF", price: 0.640, dailyChange: -0.16, amplitude: 1.09, t0Score: 3, status: "观望", signal: "相对抗跌，可观望尾盘机会" },
    { code: "513100", name: "纳指ETF", price: 2.093, dailyChange: -0.71, amplitude: 1.00, t0Score: 2, status: "偏弱", signal: "纳指新高但涨幅收窄" },
    { code: "159819", name: "跨境半导体ETF", price: 1.941, dailyChange: -0.36, amplitude: 1.69, t0Score: 4, status: "关注", signal: "振幅大适合做T" },
    { code: "513520", name: "日经ETF", price: 2.143, dailyChange: -0.19, amplitude: 1.26, t0Score: 2, status: "观望", signal: "波动一般" }
  ],

  gold: {
    internationalPrice: 4739.3, exchangeRate: 6.794, yuanPerGram: 1035.2,
    holding: 30.4188, value: 31490, profit: 1490, profitPercent: 5.0
  },

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
  },

  pendingActions: [
    { action: "清仓平安鑫安混合C", code: "012346", trigger: "尽快执行", priority: "high" as const },
    { action: "兴业港股互联网反弹减仓", code: "011098", trigger: "净值回到1.58", priority: "medium" as const },
    { action: "天弘恒生科技反弹减仓", code: "012548", trigger: "净值回到0.79", priority: "medium" as const },
    { action: "平安资源精选反弹减仓", code: "014078", trigger: "反弹回本", priority: "low" as const }
  ],

  history: [
    { date: "2026-05-11", action: "纳指ETF清仓", detail: "2500份@2.106，回笼约5,265元", status: "done" as const },
    { date: "2026-05-11", action: "机器人ETF清仓", detail: "@1.456，回笼约6,261元", status: "done" as const },
    { date: "2026-05-11", action: "摩根日本减半", detail: "卖出一半约16,000元", status: "done" as const },
    { date: "2026-05-11", action: "平安医疗清仓", detail: "全部清仓", status: "done" as const },
    { date: "2026-05-12", action: "平安鑫安C清仓", detail: "约9,159元", status: "pending" as const }
  ]
};
```

### UI设计要求
1. **主题色：** 深色主题（背景 #0a0a0f / #111118，卡片 rgba(255,255,255,0.05)，边框 rgba(255,255,255,0.08)）
2. **点缀色：** 金色 #D4AF37 用于标题和重要元素
3. **配色规则：** 红涨绿跌（中国标准）：涨 #ef4444，跌 #22c55e
4. **卡片设计：** 圆角 rounded-xl、backdrop-blur、hover效果
5. **移动端：** 底部固定Tab导航（5个Tab对应5个页面）；桌面端：左侧侧边栏导航
6. **图表：** recharts，深色主题配色
7. **标题栏：** 每页顶部显示 "👑 帝国操盘室" + 页面标题 + 当前时间（实时更新）
8. **字体：** 中文使用系统默认即可
9. **图标：** 用emoji即可，不需要icon库

### 文件结构
```
empire-dashboard/
├── app/
│   ├── layout.tsx         # 根布局，包含导航
│   ├── page.tsx           # 持仓总览
│   ├── holdings/
│   │   └── page.tsx       # 标的详情
│   ├── trading/
│   │   └── page.tsx       # 做T中心
│   ├── macro/
│   │   └── page.tsx       # 宏观雷达
│   └── logs/
│       └── page.tsx       # 操作日志
├── components/
│   ├── Navigation.tsx     # 响应式导航（移动端底部Tab/桌面端侧边栏）
│   ├── DashboardCard.tsx  # 通用仪表盘卡片
│   └── T0Calculator.tsx   # 做T计算器（交互式）
├── data/
│   └── portfolio.ts       # 真实数据
├── next.config.js         # output: 'export'
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 关键注意事项
- 使用 Next.js 14 App Router
- 所有页面必须是客户端组件（"use client"），因为用了交互和recharts
- next.config.js 设置 output: 'export' 用于静态导出
- 图片不使用 next/image，用普通 img 标签
- 不使用 getServerSideProps 等 SSR 特性
- npm install 后确保 npm run dev 能直接启动
- 所有UI文案中文
