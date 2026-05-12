## 帝国操盘室 v3.0 - Codex Review 全量修复

### Critical 修复

#### C1. 总资产数据不一致
- data/portfolio.ts: 总资产必须 = 所有持仓之和
- 差额15,112可能是现金/在途资金，需要显式建立 `cashBalance` 字段
- 修改 totalAssets 为动态计算：`sum(基金) + sum(ETF) + 黄金 + cashBalance`
- 所有页面展示的总资产都从计算函数派生，不再硬编码

#### C2. 收益口径统一（最重要！）
重新设计数据模型，统一字段命名：
```typescript
interface Holding {
  code: string;
  name: string;
  type: string;
  assetCategory: 'fund' | 'etf' | 'gold' | 'hk_stock' | 'us_stock';
  
  // 持仓数据
  holdingUnits: number;       // 持有份额/股数
  costPrice: number;           // 成本单价
  lastPrice: number;           // 最新单价（净值/市价）
  costAmount: number;          // 投入成本 = holdingUnits * costPrice
  marketValue: number;         // 当前市值 = holdingUnits * lastPrice
  
  // 盈亏
  unrealizedPnlAmount: number; // 浮盈亏金额 = marketValue - costAmount
  unrealizedPnlPercent: number;// 浮盈亏% = (marketValue - costAmount) / costAmount * 100
  
  // 今日变化
  prevClosePrice: number;      // 昨收/昨净值
  dailyChange: number;         // 今日涨跌幅%
  dailyChangeAmount: number;   // 今日盈亏金额 = marketValue - (holdingUnits * prevClosePrice)
  
  // 策略
  rating: 'A' | 'B' | 'C' | 'D';
  riskLevel: 'green' | 'yellow' | 'red';
  strategy: string;
  autoInvest: number;          // 每日定投金额，0=暂停
  triggerPrice?: number;       // 触发价
  isT0: boolean;               // 是否可做T
  
  // 数据元信息
  priceAsOf: string;           // 价格时间 "2026-05-12 10:30"
  priceSource: string;         // "天天基金估值" | "实时行情" | "QDII延迟T+1"
  priceDelayHours: number;     // 延迟小时数（QDII可能24-48h）
}
```

#### C3. 今日盈亏可推导
- 建立 `calculatePortfolioSummary()` 函数
- 今日盈亏 = sum(每个持仓的dailyChangeAmount) + 现金今日变化
- 确保每个持仓的 dailyChangeAmount 能精确算出
- 总览页展示的数字必须等于明细之和

#### C4. T0标的详情页404修复
- 方案：把 T0 标的也纳入统一的 holdings 数据模型
- T0标的即使不在持仓中，也要有详情页
- generateStaticParams 要包含 T0 标的
- 或者改为动态路由，不使用静态导出

#### C5. 合规免责声明
- 在 layout.tsx 底部增加全局 Footer：
  - "⚠️ 本工具仅供参考，不构成任何投资建议。投资有风险，入市需谨慎。"
  - "数据可能存在延迟，请以官方渠道为准。"
- 所有"建议"类文案改为"观察项/规则触发"
- 标的详情页策略区域增加免责提示
- "太后评级"改为"策略评级"，去掉个人化命名

### High 修复

#### H6. 刷新时间改为真实数据时间戳
- 每个数据对象携带 `asOf: string` 字段
- 展示格式："数据截至 2026-05-12 14:00（盘中估值）"
- 区分：基金净值日/盘中估值/ETF实时/QDII延迟
- mock数据标注为 "演示数据" + 具体日期

#### H7. 模拟数据标注
- 所有 mock/硬编码数据添加 `isMock: true` 标记
- mock数据在UI上标注 "📊 演示数据" 小标签
- 走势图标题改为 "近期走势（演示）"
- 宏观板块数据标注 "数据来源：模拟"

#### H8. 数据计算抽离
- 新建 `lib/portfolio-calculations.ts`
  - `calculatePortfolioSummary(holdings)` → 总资产/今日盈亏/累计盈亏
  - `calculateHoldingStats(holdings, category)` → 分类统计
  - `calculateT0Signal(target)` → 做T信号计算
  - `formatCurrency(amount)` / `formatPercent(pct)` → 格式化
- 新建 `types/portfolio.ts` 放所有 TypeScript 类型
- 组件只消费计算结果，不自己算

#### H9. 持仓录入真实闭环
- 使用受控表单（React state）替代直接读DOM
- 添加表单校验：金额>0、代码非空、价格>0
- 保存到 localStorage（使用独立key `empire_holdings`）
- 提交后更新持仓列表和操作日志
- 操作反馈同样用受控表单+校验+localStorage持久化
- 增加成功/失败 toast 提示

#### H10. 数据源架构预留
- 新建 `lib/api/` 目录
- `lib/api/market-data.ts` - 行情数据接口层
  - `getFundNav(code)` - 基金净值
  - `getETFRealtime(code)` - ETF实时行情
  - `getGoldPrice()` - 黄金价格
  - `getExchangeRate()` - 汇率
  - `getSectorData()` - 板块资金流向
- 每个函数返回统一格式：`{ data, asOf, source, isMock }`
- 当前阶段返回mock数据+isMock=true标记
- 未来替换为真实API调用即可

### Medium 修复

#### M11. 做T计算器公式修正
- 输入：买入价、卖出价（而非只有买入价）、数量、资产类型
- 费用明细：
  - 佣金：max(成交金额 × 佣金率, 5元)，默认佣金率万2.5
  - 印花税：卖出金额 × 0.05%（仅卖出）
  - 过户费：成交金额 × 0.001%（沪市ETF）
  - ETF免印花税
- 输出：毛收益、总费用、净收益、盈亏平衡价、收益率%

#### M12. 空状态和错误状态
- 新建 `components/EmptyState.tsx`
- 新建 `components/ErrorState.tsx`
- 新建 `components/LoadingSkeleton.tsx`
- 持仓为空时显示引导（"点击右上角新增持仓开始使用"）
- 数据加载时显示骨架屏
- 错误时显示重试按钮

#### M13. 产品命名专业化
- "帝国操盘室" → 保留作为内部名，外部显示 "InvestScope 投资看板"
- "太后评级" → "策略评级"
- "今日最佳" → "今日领涨"
- "纪律铁律" → "交易纪律"
- 在设置或关于页面保留个性化命名的说明

#### M14. 性能优化
- Recharts 改为 dynamic import：`const PieChart = dynamic(() => import('recharts').then(m => ({default: m.PieChart})), {ssr: false})`
- 持仓列表超过20个时使用虚拟滚动或分页
- 排序函数使用 useMemo
- 移动端图表延迟加载（IntersectionObserver）

### Low 修复

#### L15. 导航active状态
- Navigation.tsx: pathname.startsWith('/holdings') 时持仓Tab高亮
- pathname.startsWith('/trading') 时做T Tab高亮
- 桌面侧栏底部增加"设置"入口（预留）

#### L16. 国际化/主题/多用户预留
- i18n: 所有中文文案抽到 `lib/i18n/zh.ts`，结构支持未来加 `en.ts`
- 主题: tailwind.config.ts 增加 lightMode 配置预留
- 多用户: 数据模型预留 `userId` 字段，localStorage按userId隔离

### 实施要求
1. 按优先级实施：C1-C5 → H6-H10 → M11-M14 → L15-L16
2. 修改完成后运行 `npx next build` 确认构建通过
3. 确保所有页面可正常访问
4. 确保移动端和桌面端都正常
