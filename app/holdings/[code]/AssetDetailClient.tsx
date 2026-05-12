"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardCard from '@/components/DashboardCard';
import { portfolioData, Fund, ETFStock } from '@/data/portfolio';

// Note: For better performance, these could be dynamically imported with:
// const PieChart = dynamic(() => import('recharts').then(m => ({ default: m.PieChart })), { ssr: false });

export default function AssetDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const code = params.code as string;

  // 查找标的
  const fund = portfolioData.funds.find(f => f.code === code);
  const etf = portfolioData.etfStocks.find(e => e.code === code);
  const asset = fund || etf;

  if (!asset) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-20">
          <h1 className="text-2xl text-gray-400 mb-4">未找到标的</h1>
          <button
            onClick={() => router.push('/holdings')}
            className="text-gold hover:underline"
          >
            返回持仓列表
          </button>
        </div>
      </div>
    );
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  const getRefreshTime = () => {
    const refreshTime = new Date(currentTime.getTime() - 60000);
    return refreshTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 模拟持仓占比饼图数据
  const pieData = [
    { name: '当前标的', value: fund ? fund.amount : etf!.amount },
    { name: '其他资产', value: portfolioData.totalAssets - (fund ? fund.amount : etf!.amount) }
  ];

  const COLORS = ['#D4AF37', '#333333'];

  // 模拟走势数据
  const mockTrendData = [
    { date: '5/8', value: (fund ? fund.amount : etf!.amount) * 0.98 },
    { date: '5/9', value: (fund ? fund.amount : etf!.amount) * 0.99 },
    { date: '5/10', value: (fund ? fund.amount : etf!.amount) * 1.01 },
    { date: '5/11', value: (fund ? fund.amount : etf!.amount) * 0.995 },
    { date: '5/12', value: fund ? fund.amount : etf!.amount }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/holdings')}
          className="text-gold text-sm mb-4 hover:underline"
        >
          ← 返回持仓列表
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">{fund ? fund.name : etf!.name}</h1>
            <p className="text-gray-400 text-sm">
              代码: {code} · {fund ? fund.type : 'ETF'} · {getRefreshTime()} 刷新
            </p>
          </div>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="text-sm bg-gold/20 text-gold px-4 py-2 rounded-lg hover:bg-gold/30 transition-colors"
          >
            📝 反馈
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 基本信息 */}
        <DashboardCard title="基本信息" icon="📋">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">持仓金额</div>
                <div className="text-xl font-bold text-white">¥{fund ? fund.amount.toLocaleString() : etf!.amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">持有份额</div>
                <div className="text-xl font-bold text-white">
                  {fund ? ((fund.amount / fund.current).toFixed(0)) : etf!.shares.toLocaleString()} 股
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">盈亏比例</div>
                <div className={`text-xl font-bold ${fund ? (fund.profit >= 0 ? 'text-up' : 'text-down') : (etf!.profitPercent >= 0 ? 'text-up' : 'text-down')}`}>
                  {fund ? (fund.profit >= 0 ? '+' : '') : (etf!.profitPercent >= 0 ? '+' : '')}
                  {fund ? fund.profit.toFixed(1) : etf!.profitPercent.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">今日涨跌</div>
                <div className={`text-xl font-bold ${fund ? (fund.dailyChange >= 0 ? 'text-up' : 'text-down') : (etf!.dailyChange >= 0 ? 'text-up' : 'text-down')}`}>
                  {fund ? (fund.dailyChange >= 0 ? '+' : '') : (etf!.dailyChange >= 0 ? '+' : '')}
                  {fund ? fund.dailyChange.toFixed(2) : etf!.dailyChange.toFixed(2)}%
                </div>
              </div>
            </div>

            {fund && (
              <>
                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">成本价</div>
                    <div className="text-sm font-medium text-white">¥{fund.cost.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">现价</div>
                    <div className="text-sm font-medium text-white">¥{fund.current.toFixed(4)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    fund.profit >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'
                  }`}>
                    {fund.profit >= 0 ? '盈利' : '亏损'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gold/20 text-gold">
                    {fund.type}
                  </span>
                  {fund.autoInvest > 0 && (
                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                      定投中
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </DashboardCard>

        {/* 评级与风险 */}
        <DashboardCard title="评级与风险" icon="⭐">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gold/10 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">策略评级</div>
                <div className="text-3xl font-bold text-gold">{fund ? fund.rating : 'B'}</div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">风险等级</div>
                <div className="text-3xl">{fund ? getRiskIcon(fund.riskLevel) : '🟢'}</div>
              </div>
            </div>

            {fund && (
              <div className="bg-background/50 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-2">定投状态</div>
                <div className={`text-lg font-semibold ${fund.autoInvest > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                  {fund.autoInvest > 0 ? `¥${fund.autoInvest}/日` : '已暂停'}
                </div>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* 操作策略 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardCard title="操作策略" icon="🎯">
          <div className="space-y-4">
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-xs text-gray-400 mb-2">当前建议</div>
              <div className="text-lg font-semibold text-white">
                {fund ? fund.strategy : '持有观望，适时做T'}
              </div>
            </div>

            {fund && fund.triggerPrice && (
              <div className="bg-gold/10 border border-gold/30 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">触发价格</div>
                <div className="text-xl font-bold text-gold">¥{fund.triggerPrice.toFixed(3)}</div>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <div className="text-xs text-gray-400 mb-2">适合做T</div>
              <div className="text-sm text-white">
                {etf ? '✅ 是，可进行日内T+0交易' : '❌ 否，仅支持长期持有'}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* 持仓占比 */}
        <DashboardCard title="持仓占比" icon="🥧">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                formatter={(value: number) => `¥${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      {/* 分析面板 */}
      <DashboardCard title="分析面板" icon="📊">
        <div className="space-y-6">
          <div>
            <h4 className="text-gold font-semibold mb-3">宏观环境</h4>
            <div className="bg-background/50 p-4 rounded-lg text-sm text-gray-300">
              {fund && fund.type.includes('QDII') ? '当前海外市场整体走强，科技板块表现优异，利好QDII基金短期表现。' : '国内市场震荡整理，政策面保持稳健，关注板块轮动机会。'}
            </div>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-3">技术指标</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">MA5/MA20趋势</div>
                <div className="text-sm font-medium text-white">MA5上穿MA20，金叉形成</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">支撑位/压力位</div>
                <div className="text-sm font-medium text-white">
                  支撑: ¥{((fund ? fund.current : etf!.price) * 0.95).toFixed(3)} / 压力: ¥{((fund ? fund.current : etf!.price) * 1.05).toFixed(3)}
                </div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">RSI指标</div>
                <div className="text-sm font-medium text-white">RSI(14) = 56，中性偏强</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-3">近期走势</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888888" />
                <YAxis
                  stroke="#888888"
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                  tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  formatter={(value: number) => `¥${value.toLocaleString()}`}
                />
                <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashboardCard>

      {/* 反馈模态框 */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">📝 操作反馈</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">操作类型</label>
                <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white">
                  <option>买入建仓</option>
                  <option>卖出减仓</option>
                  <option>做T买入</option>
                  <option>做T卖出</option>
                  <option>定投调整</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">成交价格</label>
                <input type="number" step="0.001" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="¥0.000" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">成交数量/金额</label>
                <input type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="数量或金额" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">备注（可选）</label>
                <textarea className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" rows={3} placeholder="操作备注..." />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 bg-background text-white rounded-lg hover:bg-white/10"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // 保存到localStorage
                    setShowFeedbackModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold/90"
                >
                  提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
