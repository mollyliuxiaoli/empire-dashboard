"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import DashboardCard from '@/components/DashboardCard';
import { portfolioData, t0Targets } from '@/data/portfolio';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaderboardTab, setLeaderboardTab] = useState<'amount' | 'percentage'>('percentage');
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRefreshTime = () => {
    const refreshTime = new Date(currentTime.getTime() - 60000);
    return refreshTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 从真实数据构建排行榜
  const allItems = [
    ...portfolioData.funds.map(f => ({
      code: f.code, name: f.name, type: 'fund' as const,
      marketValue: f.amount, dailyChange: f.dailyChange,
      dailyPnlAmount: f.amount * f.dailyChange / 100,
      unrealizedPnlAmount: f.amount * f.profit / 100,
      unrealizedPnlPercent: f.profit,
    })),
    ...portfolioData.etfStocks.map(e => ({
      code: e.code, name: e.name, type: 'etf' as const,
      marketValue: e.amount, dailyChange: e.dailyChange,
      dailyPnlAmount: e.amount * e.dailyChange / 100,
      unrealizedPnlAmount: e.profit,
      unrealizedPnlPercent: e.profitPercent,
    })),
  ];

  const totalAssets = portfolioData.totalAssets;
  const todayChange = portfolioData.todayChange;
  const todayChangePercent = portfolioData.todayChangePercent;

  // 总盈亏 = 所有标的盈亏之和
  const totalPnl = allItems.reduce((sum, item) => sum + item.unrealizedPnlAmount, 0);
  const totalPnlPercent = allItems.reduce((sum, item) => sum + item.marketValue, 0);
  const totalPnlPct = totalPnlPercent > 0 ? (totalPnl / totalPnlPercent) * 100 : 0;

  // 资产配比
  const qdiiValue = portfolioData.funds.filter(f => f.type.includes('QDII')).reduce((s, f) => s + f.amount, 0);
  const aValue = portfolioData.funds.filter(f => !f.type.includes('QDII') && !f.type.includes('债券')).reduce((s, f) => s + f.amount, 0);
  const bondValue = portfolioData.funds.filter(f => f.type.includes('债券') || f.type.includes('红利')).reduce((s, f) => s + f.amount, 0);
  const etfValue = portfolioData.etfStocks.reduce((s, e) => s + e.amount, 0);
  const goldValue = portfolioData.gold.value;
  const cashValue = portfolioData.cashBalance || 15112;

  const assetDistribution = [
    { name: 'QDII海外', value: qdiiValue },
    { name: 'A股基金', value: aValue },
    { name: '固收/红利', value: bondValue },
    { name: 'ETF', value: etfValue },
    { name: '黄金', value: goldValue },
    { name: '现金', value: cashValue },
  ].filter(d => d.value > 0);

  const COLORS = ['#D4AF37', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

  // 排行
  const sortedByPercent = [...allItems].sort((a, b) => b.dailyChange - a.dailyChange);
  const sortedByAmount = [...allItems].sort((a, b) => b.dailyPnlAmount - a.dailyPnlAmount);
  const topGainers = leaderboardTab === 'percentage' ? sortedByPercent.slice(0, 5) : sortedByAmount.slice(0, 5);
  const topLosers = leaderboardTab === 'percentage' ? sortedByPercent.slice(-5).reverse() : sortedByAmount.slice(-5).reverse();

  // 今日决策
  const getTodayDecisions = () => {
    const decisions: Array<{type: string; title: string; desc: string; priority: string; code: string}> = [];
    const pendingActions = portfolioData.pendingActions || [];

    pendingActions.forEach(action => {
      if (action.priority === 'high') {
        decisions.push({
          type: 'warning', title: `🚨 ${action.action}`,
          desc: action.trigger, priority: 'high', code: action.code
        });
      }
    });

    const bigLosers = allItems.filter(i => i.unrealizedPnlPercent < -10);
    if (bigLosers.length > 0) {
      decisions.push({
        type: 'caution', title: `⚠️ ${bigLosers[0].name} 浮亏${bigLosers[0].unrealizedPnlPercent.toFixed(1)}%`,
        desc: '风险预警，关注减仓时机', priority: 'medium', code: bigLosers[0].code
      });
    }

    return decisions;
  };
  const todayDecisions = getTodayDecisions();

  // 走势数据（模拟）
  const mockPerformanceData = [
    { date: '5/6', value: 339800 }, { date: '5/7', value: 340500 },
    { date: '5/8', value: 341200 }, { date: '5/9', value: 340900 },
    { date: '5/10', value: 342100 }, { date: '5/11', value: 342744 },
    { date: '5/12', value: totalAssets },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">InvestScope 投资看板</h1>
          <p className="text-gray-400 text-sm">投资组合总览 · {getRefreshTime()} 刷新</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>数据更新: {getRefreshTime()}</div>
          <div className="text-amber-400 mt-1">📊 演示数据</div>
        </div>
      </div>

      {/* 资产总览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="text-gray-400 text-sm mb-1">总市值</div>
          <div className="text-3xl font-bold text-white">¥{totalAssets.toLocaleString()}</div>
        </div>
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="text-gray-400 text-sm mb-1">今日盈亏</div>
          <div className={`text-3xl font-bold ${todayChange >= 0 ? 'text-up' : 'text-down'}`}>
            {todayChange >= 0 ? '+' : ''}¥{todayChange.toLocaleString()} ({todayChangePercent >= 0 ? '+' : ''}{todayChangePercent.toFixed(2)}%)
          </div>
        </div>
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="text-gray-400 text-sm mb-1">总盈亏</div>
          <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-up' : 'text-down'}`}>
            {totalPnl >= 0 ? '+' : ''}¥{totalPnl.toLocaleString()} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* 今日决策 */}
      {todayDecisions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gold mb-3">📋 今日决策</h2>
          <div className="space-y-2">
            {todayDecisions.map((decision, idx) => (
              <div key={idx} onClick={() => router.push(`/holdings/${decision.code}`)} className={`p-4 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${
                decision.priority === 'high' ? 'bg-red-900/20 border-red-700/50' :
                decision.priority === 'medium' ? 'bg-amber-900/20 border-amber-700/50' :
                'bg-blue-900/20 border-blue-700/50'
              }`}>
                <div className="font-medium text-white">{decision.title}</div>
                <div className="text-sm text-gray-400 mt-1">{decision.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardCard title="持仓配比">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={assetDistribution} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80} fill="#8884d8" dataKey="value">
                {assetDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="今日排行">
          <div className="flex mb-4 space-x-2">
            <button onClick={() => setLeaderboardTab('percentage')}
              className={`px-3 py-1 rounded-lg text-sm ${leaderboardTab === 'percentage' ? 'bg-gold text-black' : 'bg-gray-700 text-gray-300'}`}>
              按百分比
            </button>
            <button onClick={() => setLeaderboardTab('amount')}
              className={`px-3 py-1 rounded-lg text-sm ${leaderboardTab === 'amount' ? 'bg-gold text-black' : 'bg-gray-700 text-gray-300'}`}>
              按金额
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-2">领涨</div>
              {topGainers.map((h, idx) => (
                <div key={idx} onClick={() => router.push(`/holdings/${h.code}`)}
                  className="flex justify-between items-center py-2 border-b border-gray-700 hover:bg-white/5 cursor-pointer rounded px-1">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white block truncate">{h.name}</span>
                    <span className="text-xs text-gray-400">持仓 ¥{h.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="text-right ml-2">
                    <span className={`text-sm font-medium block ${h.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                      {leaderboardTab === 'percentage'
                        ? `${h.dailyChange >= 0 ? '+' : ''}${h.dailyChange.toFixed(2)}%`
                        : `${h.dailyPnlAmount >= 0 ? '+' : ''}¥${h.dailyPnlAmount.toFixed(0)}`}
                    </span>
                    <span className={`text-xs block ${h.unrealizedPnlAmount >= 0 ? 'text-up' : 'text-down'}`}>
                      累计 {h.unrealizedPnlAmount >= 0 ? '+' : ''}¥{h.unrealizedPnlAmount.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">领跌</div>
              {topLosers.map((h, idx) => (
                <div key={idx} onClick={() => router.push(`/holdings/${h.code}`)}
                  className="flex justify-between items-center py-2 border-b border-gray-700 hover:bg-white/5 cursor-pointer rounded px-1">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white block truncate">{h.name}</span>
                    <span className="text-xs text-gray-400">持仓 ¥{h.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="text-right ml-2">
                    <span className={`text-sm font-medium block ${h.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                      {leaderboardTab === 'percentage'
                        ? `${h.dailyChange >= 0 ? '+' : ''}${h.dailyChange.toFixed(2)}%`
                        : `${h.dailyPnlAmount >= 0 ? '+' : ''}¥${h.dailyPnlAmount.toFixed(0)}`}
                    </span>
                    <span className={`text-xs block ${h.unrealizedPnlAmount >= 0 ? 'text-up' : 'text-down'}`}>
                      累计 {h.unrealizedPnlAmount >= 0 ? '+' : ''}¥{h.unrealizedPnlAmount.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* 近期走势 */}
      <DashboardCard title="近期走势（演示）">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37' }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-2 text-center">📊 演示数据</p>
      </DashboardCard>
    </div>
  );
}
