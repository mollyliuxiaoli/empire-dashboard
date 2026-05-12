"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardCard from '@/components/DashboardCard';
import { portfolioData, t0Targets } from '@/data/portfolio';

export default function AssetDetailClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const fromPath = searchParams.get('from') || '/holdings';
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const code = params.code as string;

  // 查找标的（基金/ETF/T0标的）
  const fund = portfolioData.funds.find(f => f.code === code);
  const etf = portfolioData.etfStocks.find(e => e.code === code);
  const t0 = t0Targets.find(t => t.code === code);
  const asset = fund || etf;

  // 统一显示信息
  const displayName = asset ? (fund ? fund.name : etf!.name) : (t0?.name || code);
  const displayType = asset ? (fund ? fund.type : 'ETF') : 'ETF(T+0)';
  const displayAmount = asset ? (fund ? fund.amount : etf!.amount) : 0;
  const displayDailyChange = asset ? (fund ? fund.dailyChange : etf!.dailyChange) : (t0?.dailyChange || 0);
  const currentPrice = asset ? (fund ? fund.current : etf!.price) : (t0?.price || 0);
  const isT0 = !!t0;

  const getRefreshTime = () => {
    const refreshTime = new Date(currentTime.getTime() - 60000);
    return refreshTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!asset && !t0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-20">
          <h1 className="text-2xl text-gray-400 mb-4">未找到标的</h1>
          <button onClick={() => router.push(fromPath)} className="text-gold hover:underline">返回持仓列表</button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: '当前标的', value: displayAmount || (t0 ? t0.price * 1000 : 0) },
    { name: '其他资产', value: portfolioData.totalAssets - (displayAmount || (t0 ? t0.price * 1000 : 0)) }
  ];
  const COLORS = ['#D4AF37', '#333333'];

  const baseValue = displayAmount || (t0 ? t0.price * 1000 : 0);
  const mockTrendData = [
    { date: '5/8', value: baseValue * 0.98 },
    { date: '5/9', value: baseValue * 0.99 },
    { date: '5/10', value: baseValue * 1.01 },
    { date: '5/11', value: baseValue * 0.995 },
    { date: '5/12', value: baseValue }
  ];

  // T0标的专用信号信息
  const t0Signal = t0 ? { score: t0.t0Score, status: t0.status, signal: t0.signal, amplitude: t0.amplitude } : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button onClick={() => router.push(fromPath)} className="text-gold text-sm mb-4 hover:underline">← 返回持仓列表</button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">{displayName}</h1>
            <p className="text-gray-400 text-sm">代码: {code} · {displayType} · {getRefreshTime()} 刷新</p>
          </div>
          <button onClick={() => setShowFeedbackModal(true)} className="text-sm bg-gold/20 text-gold px-4 py-2 rounded-lg hover:bg-gold/30 transition-colors">📝 反馈</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 基本信息 */}
        <DashboardCard title="基本信息" icon="📋">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">持仓金额</div>
                <div className="text-xl font-bold text-white">{displayAmount > 0 ? `¥${displayAmount.toLocaleString()}` : '未持仓/观望'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">现价</div>
                <div className="text-xl font-bold text-white">¥{currentPrice.toFixed(currentPrice < 1 ? 4 : 3)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">今日涨跌</div>
                <div className={`text-xl font-bold ${displayDailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                  {displayDailyChange >= 0 ? '+' : ''}{displayDailyChange.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">盈亏</div>
                <div className="text-xl font-bold text-white">
                  {fund ? (
                    <span className={fund.profit >= 0 ? 'text-up' : 'text-down'}>
                      {fund.profit >= 0 ? '+' : ''}{fund.profit.toFixed(1)}%
                    </span>
                  ) : etf ? (
                    <span className={etf.profitPercent >= 0 ? 'text-up' : 'text-down'}>
                      {etf.profitPercent >= 0 ? '+' : ''}{etf.profitPercent.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">T+0标的</span>
                  )}
                </div>
              </div>
            </div>

            {/* 基金专用：成本/现价/定投 */}
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
                  <span className={`px-2 py-1 rounded text-xs ${fund.profit >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'}`}>
                    {fund.profit >= 0 ? '盈利' : '亏损'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gold/20 text-gold">{fund.type}</span>
                  {fund.autoInvest > 0 && <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">定投中</span>}
                </div>
              </>
            )}

            {/* T0标的专用：信号/振幅/评分 */}
            {t0Signal && (
              <div className="border-t border-border pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gold/10 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">T0评分</div>
                    <div className="text-xl font-bold text-gold">{t0Signal.score}</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">振幅</div>
                    <div className="text-xl font-bold text-white">{t0Signal.amplitude.toFixed(2)}%</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">状态</div>
                    <div className="text-sm font-bold text-gold">{t0Signal.status}</div>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">交易信号</div>
                  <div className="text-sm text-white">{t0Signal.signal}</div>
                </div>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* 评级与风险 */}
        <DashboardCard title="评级与风险" icon="⭐">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gold/10 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">策略评级</div>
                <div className="text-3xl font-bold text-gold">{fund?.rating || 'B'}</div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">风险等级</div>
                <div className="text-3xl">
                  {fund ? (fund.riskLevel === 'green' ? '🟢' : fund.riskLevel === 'yellow' ? '🟡' : '🔴') : '🟡'}
                </div>
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
              <div className="text-lg font-semibold text-white">{fund?.strategy || (t0 ? t0.signal : '持有观望')}</div>
            </div>
            {fund?.triggerPrice && (
              <div className="bg-gold/10 border border-gold/30 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">触发价格</div>
                <div className="text-xl font-bold text-gold">¥{fund.triggerPrice.toFixed(3)}</div>
              </div>
            )}
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <div className="text-xs text-gray-400 mb-2">适合做T</div>
              <div className="text-sm text-white">{isT0 ? '✅ 是，可进行日内T+0交易' : '❌ 否，仅支持长期持有'}</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="持仓占比" icon="🥧">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(1)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} formatter={(value: number) => `¥${value.toLocaleString()}`} />
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
              {fund?.type?.includes('QDII') ? '海外市场整体走强，科技板块表现优异，利好QDII基金短期表现。' : '国内市场震荡整理，政策面保持稳健，关注板块轮动机会。'}
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
                <div className="text-sm font-medium text-white">支撑: ¥{(currentPrice * 0.95).toFixed(3)} / 压力: ¥{(currentPrice * 1.05).toFixed(3)}</div>
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
                <YAxis stroke="#888888" domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} formatter={(value: number) => `¥${value.toLocaleString()}`} />
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
                  <option>买入建仓</option><option>卖出减仓</option><option>做T买入</option><option>做T卖出</option><option>定投调整</option>
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
                <button onClick={() => setShowFeedbackModal(false)} className="flex-1 px-4 py-2 bg-background text-white rounded-lg hover:bg-white/10">取消</button>
                <button onClick={() => setShowFeedbackModal(false)} className="flex-1 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold/90">提交</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
