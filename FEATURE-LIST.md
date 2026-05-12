## 功能实现清单 — Molly 20:54 要求

### 1. 待执行操作的反馈/提醒弹窗

**位置：** `app/actions/page.tsx` — 待执行操作/策略tab

**反馈按钮：**
- 点击后弹出模态框
- 模态框字段：操作类型（买入/卖出/做T买/做T卖）、成交价格、成交数量、备注
- 提交后保存到localStorage
- 复用 `app/holdings/page.tsx` 里的反馈模态框样式（已有showFeedbackModal/selectedAsset模式）

**设提醒按钮：**
- 点击后弹出模态框
- 模态框字段：提醒名称、触发条件（净值到X/涨跌幅到X%）、提醒方式（飞书消息）
- 保存到localStorage
- 暂不实现真实飞书推送（标注"即将支持"），UI先做好

### 2. T0详情页返回行动列表

**问题：** 从行动页点击T0标的进详情页，点返回默认跳 /holdings，应该回到 /actions
**方案：** 
- 在 `/actions` 页面，T0标的的详情链接加上 query param: `?from=/actions`
- 详情页的返回按钮检查 `router.query.from`，如果有就跳回该路径
- 修改 `app/holdings/[code]/page.tsx` 或其 client component 中的返回逻辑

### 3. 更多T0标的 — 接入实时行情API筛选

**当前：** hardcoded 5只ETF
**目标：** 
- 添加一个"扫描更多"按钮
- 点击后从预定义的T+0 ETF池（约30只主流ETF）中筛选
- 筛选条件：振幅 > 1.5%
- 因为是static export没有后端，用前端fetch Yahoo Finance或东方财富API
- 如果API失败，fallback到展示更多预定义标的
- 每次扫描展示10只，可翻页

**预定义T+0 ETF池（可跨市场交易的ETF）：**
513130 恒生科技ETF、159825 农牧ETF、513100 纳指ETF、513520 日经ETF、
159819 人工智能ETF、513500 标普500ETF、513050 中概互联ETF、
159920 恒生ETF、513060 恒生医疗ETF、588000 科创50ETF、
159995 芯片ETF、515030 新能源车ETF、159825 农业ETF、
513060 恒生医疗ETF、159941 纳指ETF、512100 中证1000ETF、
510300 沪深300ETF、510500 中证500ETF、159915 创业板ETF、
512660 军工ETF、512010 医药ETF、515880 通信ETF、
512480 半导体ETF、159869 游戏ETF、516160 新能源ETF、
562500 科创芯片ETF、513060 恒生医疗、513660 恒生互联网

**扫描逻辑：**
- 默认展示当前5只（已持仓的T0标的）
- 点击"扫描更多"按钮
- fetch 东方财富API获取ETF实时行情
- 筛选振幅>1.5%的，按振幅排序
- 展示结果，标注哪些已持仓
- API失败时展示扩展池的mock数据

### 执行要求
1. 三个功能都实现
2. `npx next build` 必须通过
3. git commit 并 push
4. 代码风格：dark theme, gold accent, Chinese UI, red=up/green=down
