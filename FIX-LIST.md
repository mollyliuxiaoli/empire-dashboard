## 紧急修复清单 — Molly 20:29 反馈

### 1. 总览页 (app/page.tsx)

**Bug: 持仓配比里有现金**
- 去掉现金项，只保留投资类资产
- 或者改为"备用金"并标注来源

**Bug: 今日排行累计盈亏还是 ¥2,137,293**
- 检查 f.profit 到底映射的是什么
- holdings里 unrealizedPnlAmount: 7321 是对的
- 但 portfolioData.funds 里的 profit 映射自 h.unrealizedPnlAmount
- 所以 f.profit 应该是 7321，直接用就对了
- 如果线上还是错的，说明部署有问题，重新部署

### 2. 持仓页 (app/holdings/page.tsx)

**Bug: 美股港股Tab多了一个汇总区（复用黄金汇总数据）**
- stats 计算逻辑要根据 activeTab 区分
- 'us' 和 'hk' tab 不应该显示 stats 概览（或者显示自己的统计）

**Bug: 美股港股用表格而不是卡片**
- 改为和基金/ETF一样的卡片样式
- 每个标的一张卡片，显示名称/代码/现价/市值/盈亏
- 支持点击进入标的详情页

**Bug: 美股港股标的不支持点击进详情页**
- 需要把美股港股也加到 generateStaticParams
- AssetDetailClient 也需要支持美股港股类型

### 3. 行动页 (app/actions/page.tsx)

**Bug: T0标的池不显示是否持仓**
- 对比 t0Targets 和 holdings/etfStocks 的代码
- 如果该代码在持仓中，显示"已持仓 ¥金额 盈亏"
- 如果不在持仓中，显示"未持仓"

**Bug: 点击详情页后返回应回到行动列表页**
- 详情页返回按钮默认跳 /holdings
- 如果从 /actions 过来的，返回应该回 /actions
- 可以用 URL query param: router.push(`/holdings/${code}?from=/actions`)

**Bug: T0标的拉取逻辑**
- 当前是静态数据 t0Targets（5个标的）
- 告诉Molly：目前T0标的是hardcoded的5个ETF（513130/159825/513100/159819/513520）
- 未来可以从实时行情API动态筛选振幅>1.5%的ETF

**Bug: 支持拉取更多**
- 可以加一个"加载更多"按钮或"刷新扫描"按钮

### 4. 待执行操作 (app/actions/page.tsx - strategy tab)

**Bug: 反馈按钮无反应**
- 应该弹出反馈弹窗（复用 AssetDetailClient 的反馈弹窗组件）
- 弹窗包含：操作类型/价格/数量/备注

**Bug: 设提醒按钮无反应**
- 弹出提醒设置弹窗
- 支持设置触发条件（如净值回到X）
- 触发后发送消息到飞书（通过太后bot）

### 5. 市场雷达 (app/market/page.tsx)

**Bug: 缺少港股、A股数据**
- 添加A股主要指数（上证/深证/创业板）
- 添加港股主要指数（恒生/恒生科技）

**Bug: 缺少板块数据**
- 添加主要板块涨跌（半导体/新能源/医药/消费/金融等）

**Bug: 缺少行情分析**
- 基于当前数据给出简单的市场分析文字

### 执行要求
1. 按优先级修复：Bug > 功能
2. 每个修完后构建验证
3. 最终 `npx next build` 必须通过
4. git commit 并 push
