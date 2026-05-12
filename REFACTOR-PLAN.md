# 帝国操盘室 v4.0 改造计划

> 基于 Codex 两轮 Review（共30+问题）制定
> 目标：达到外部用户可用的产品质量
> 原则：每阶段独立可交付，不跨阶段依赖

---

## Phase 1：数据根基重构（3-5天）
> 🎯 目标：数据口径100%一致，计算可验证

### 1.1 引入Transaction模型
```
Transaction {
  id, date, type(buy/sell/dividend/reinvest/fee/split),
  code, name, units, price, amount, fee,
  note, createdAt
}
```
- 所有持仓数据从Transaction派生
- 支持分红再投资、申购费、赎回费
- 持久化到localStorage，按userId隔离

### 1.2 重构Holding为纯派生模型
```
// 只保留原子输入
Holding {
  code, name, instrumentType, productType
  
  // 持仓原子数据（从Transaction计算）
  units, avgCostPrice, bookCostAmount
  
  // 行情快照（从API来）
  quote: {
    price, quoteType(realtime|estimated_nav|confirmed_nav),
    asOf, source, delayHours, stalenessLevel
  }
  
  // 以下全部由计算层派生，不存储
  // marketValue = units * quote.price
  // unrealizedPnl = marketValue - bookCostAmount
  // dailyPnl = marketValue - (units * prevQuote.price)
}
```

### 1.3 统一计算层
- `lib/calculator/position.ts` — 从Transactions计算持仓
- `lib/calculator/pnl.ts` — 盈亏计算（今日/累计/已实现）
- `lib/calculator/quote.ts` — 行情标准化（区分估值/确认/实时）
- 核心函数只接受原子输入，全部纯函数
- 加 `validateHolding()` invariant校验
- 加单测覆盖

### 1.4 QDII/黄金/ETF行情区分
- QDII：`quoteType`区分估值/确认净值，`fxRate`+`fxAsOf`
- 黄金：`productType`(实物金/纸黄金/ETF)，`costAmount`独立字段
- 人民币克价公式：`xauUsd * usdCny / 31.1035`

**交付标准：**
- [x] 所有持仓的marketValue - bookCostAmount = unrealizedPnlAmount（精确到分）
- [x] 所有持仓的dailyPnl可从quote和prevQuote推导
- [x] 单测覆盖率 > 80%

---

## Phase 2：产品闭环打通（3-5天）
> 🎯 目标：新增持仓→操作反馈→日志记录→持仓更新，完整闭环

### 2.1 统一状态管理
- `PortfolioProvider` + reducer + localStorage adapter
- Actions：ADD_HOLDING / RECORD_TRANSACTION / UPDATE_QUOTE / EXECUTE_STRATEGY
- 页面从Provider消费，不再直接import静态数据

### 2.2 新增持仓闭环
- 受控表单 + zod schema校验
- 提交 → 创建初始Transaction → Provider更新 → 持仓列表刷新
- 基金代码自动查名称（天天基金API）

### 2.3 操作反馈闭环
- 受控表单 + 校验（价格>0、数量>0）
- 提交 → 创建Transaction → 更新份额/成本 → 日志页自动显示
- 详情页反馈同理

### 2.4 日志与操作统一
- 日志页从Transactions读取（不再读静态history）
- 待执行操作与持仓策略关联
- 操作完成后标记strategy状态

**交付标准：**
- [x] 新增持仓后，总览/持仓/日志三页数据联动
- [x] 操作反馈后，份额和成本自动更新
- [x] 页面刷新后数据不丢失（localStorage持久化）

---

## Phase 3：产品体验升级（2-3天）
> 🎯 目标：外部用户打开就懂，信息优先级正确

### 3.1 产品定位统一
- 统一命名："InvestScope 投资看板"
- 去掉"帝国操盘室""内部代号"等内部文案
- 首屏增加30秒引导说明

### 3.2 首屏改为"今日决策台"
```
首屏布局：
┌─────────────────────────────────┐
│ 💰 资产总览 (总市值/今日盈亏)     │
│ 数据截至 14:00 (盘中估值)         │
├─────────────────────────────────┤
│ 🚨 今日待办 (清仓/减仓/策略触发)   │
│ ⚠️ 风险提醒 (亏损预警/集中度)      │
├─────────────────────────────────┤
│ 📊 持仓概览 (配比饼图+排行)       │
│ 📈 近期走势 (真实数据曲线)         │
└─────────────────────────────────┘
```
- 去掉硬编码的"本周收益"
- 信号看板提升优先级
- mock数据标注"演示"

### 3.3 Tab架构优化
```
移动端：总览 | 持仓 | 行动 | 市场 | 我的
桌面端：侧栏同上
```
- "做T"并入"行动"Tab
- "日志"并入"我的"
- 新增 `/settings` 页面（持仓管理/数据导入/关于）
- 移动端设置入口

### 3.4 行情数据展示优化
- 每个价格旁标注类型：实时/估值/确认净值(T+1)
- QDII显示"估值仅供参考，以确认净值为准"
- 黄金显示"实物金/纸黄金"标识

**交付标准：**
- [x] 外部用户无需解释即可理解产品定位
- [x] 首屏无硬编码/mock数据或已明确标注
- [x] 移动端5个Tab全部有内容

---

## Phase 4：行情接入与差异化（5-7天）
> 🎯 目标：真实数据驱动，差异化功能落地

### 4.1 行情API层
- `lib/api/fund-nav.ts` — 天天基金净值/估值
- `lib/api/etf-realtime.ts` — 腾讯/新浪实时行情
- `lib/api/gold-price.ts` — 上海金/XAUUSD
- `lib/api/fx-rate.ts` — 美元人民币汇率
- 统一返回：`{ data, asOf, source, isMock, stale, cacheTtl, error }`
- discriminated union替代`data: any`
- try/catch + 超时 + 重试 + 降级

### 4.2 T0信号升级
- 引入`IntradayQuote`：high/low/open/volume/turnover/bid/ask/spread
- 评分考虑：流动性、盘口价差、可卖数量、交易费用、时间窗口
- 信号分级：强烈关注/关注/观望/不推荐
- 每个信号附带理由和数据依据

### 4.3 策略执行系统
- 每个持仓绑定策略：目标仓位/触发条件/止损止盈/操作计划
- 策略触发自动提醒
- 操作执行后自动更新策略状态
- 历史策略复盘

### 4.4 数据可视化升级
- 收益曲线使用真实历史数据
- 板块轮动接入真实资金流数据
- 持仓对比图（vs基准）
- 风险雷达图（集中度/波动率/最大回撤）

**交付标准：**
- [x] 所有行情数据来自真实API（允许降级到mock）
- [x] mock数据有明确的"演示"标注
- [x] T0信号附带数据依据
- [x] 策略触发有推送通知

---

## Phase 5：外部化与合规（3-5天）
> 🎯 目标：可对外发布，多用户支持

### 5.1 多用户支持
- 登录/注册（先做简单的，如手机号+验证码）
- 数据按userId隔离
- 服务端存储（Supabase/PlanetScale）

### 5.2 合规完善
- 全局免责声明（不可关闭，滚动展示）
- 每个策略/信号页面单独免责
- 数据来源标注
- 非投资建议声明
- 风险评估问卷（首次使用）

### 5.3 质量门禁
- ESLint配置
- 核心计算单测CI
- 数据invariant校验CI
- E2E测试（关键路径）

### 5.4 SEO与分享
- OG meta标签
- 分享卡片（持仓收益截图）
- PWA支持（离线查看）

**交付标准：**
- [x] 新用户注册后可正常使用所有功能
- [x] CI全绿（lint + test + build）
- [x] 合规审查通过

---

## 时间线总览

| Phase | 内容 | 天数 | 可独立交付 |
|-------|------|------|-----------|
| **P1** | 数据根基重构 | 3-5天 | ✅ 口径一致 |
| **P2** | 产品闭环打通 | 3-5天 | ✅ 操作可记录 |
| **P3** | 产品体验升级 | 2-3天 | ✅ 外部可用 |
| **P4** | 行情接入差异化 | 5-7天 | ✅ 真实数据 |
| **P5** | 外部化与合规 | 3-5天 | ✅ 可发布 |
| **合计** | | **16-25天** | |

## 建议执行顺序

**立即开始（本周）：** P1数据根基 → 这是一切的基础
**下周：** P2产品闭环 → 让功能真正work
**第三周：** P3体验升级 → 外部用户可用
**后续：** P4/P5按节奏推进

---

*太后出品 · 2026-05-12*
