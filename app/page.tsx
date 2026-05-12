"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import DashboardCard from '@/components/DashboardCard';
import { usePortfolio } from '@/lib/store/portfolio-context';
import { calculatePortfolioSummary, calculateHoldingMetrics } from '@/lib/calculator';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaderboardTab, setLeaderboardTab] = useState<'amount' | 'percentage'>('percentage');
  const router = useRouter();
  const { state } = usePortfolio();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRefreshTime = () => {
    const refreshTime = new Date(currentTime.getTime() - 60000);
    return refreshTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate portfolio metrics
  const holdingsWithMetrics = state.holdings.map(h => calculateHoldingMetrics(h));
  const summary = calculatePortfolioSummary(holdingsWithMetrics, state.gold, state.cash);

  // 资产配比数据
  const assetDistribution = [
    { name: 'QDII', value: holdingsWithMetrics.filter(h => h.productType === 'qdii_fund').reduce((sum, h) => sum + h.marketValue, 0) },
    { name: 'A股', value: holdingsWithMetrics.filter(h => h.productType === 'open_end_fund' && h.tags.includes('A股')).reduce((sum, h) => sum + h.marketValue, 0) },
    { name: '债券/固收', value: holdingsWithMetrics.filter(h => h.tags.includes('债券') || h.tags.includes('固收')).reduce((sum, h) => sum + h.marketValue, 0) },
    { name: '黄金', value: state.gold.units * state.gold.quote.price },
    { name: '现金', value: state.cash },
  ];

  const COLORS = ['#D4AF37', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6'];

  // 涨跌排行
  const sortedByPercent = [...holdingsWithMetrics].sort((a, b) => b.dailyPnlPercent - a.dailyPnlPercent);
  const sortedByAmount = [...holdingsWithMetrics].sort((a, b) => b.dailyPnlAmount - a.dailyPnlAmount);
  const topGainers = leaderboardTab === 'percentage' ? sortedByPercent.slice(0, 3) : sortedByAmount.slice(0, 3);
  const topLosers = leaderboardTab === 'percentage' ? sortedByPercent.slice(-3).reverse() : sortedByAmount.slice(-3).reverse();

  // 模拟收益曲线数据
  const mockPerformanceData = [
    { date: '5/6', value: 339800 },
    { date: '5/7', value: 340500 },
    { date: '5/8', value: 341200 },
    { date: '5/9', value: 340900 },
    { date: '5/10', value: 342100 },
    { date: '5/11', value: 342744 },
    { date: '5/12', value: summary.totalAssets },
  ];

  // 今日决策建议
  const getTodayDecisions = () => {
    const decisions = [];
    const highRisk = holdingsWithMetrics.filter(h => h.riskLevel === 'red');
    const yellowRisk = holdingsWithMetrics.filter(h => h.riskLevel === 'yellow' && h.unrealizedPnlAmount < 0);
    const nearBreakEven = holdingsWithMetrics.filter(h => h.triggerPrice && Math.abs(h.quote.price - h.triggerPrice) / h.triggerPrice < 0.05);

    if (highRisk.length > 0) {
      decisions.push({
        type: 'warning',
        title: `🚨 清仓${highRisk[0].name}`,
        desc: '风险评级D，建议减仓',
        priority: 'high'
      });
    }

    if (yellowRisk.length > 0) {
      decisions.push({
        type: 'caution',
        title: `⚠️ ${yellowRisk[0].name} 浮亏${yellowRisk[0].unrealizedPnlPercent.toFixed(1)}%`,
        desc: '风险预警，控制仓位',
        priority: 'medium'
      });
    }

    if (nearBreakEven.length > 0) {
      decisions.push({
        type: 'info',
        title: `📊 ${nearBreakEven[0].name} 接近回本价${nearBreakEven[0].triggerPrice}`,
        desc: '关注反弹机会',
        priority: 'low'
      });
    }

    return decisions;
  };

  const todayDecisions = getTodayDecisions();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">InvestScope 投资看板</h1>
          <p className="text-gray-400 text-sm">投资组合总览 · {getRefreshTime()} 刷新</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>数据更新: {getRefreshTime()}</div>
          {state.macro.isMock && <div className="text-amber-400 mt-1">📊 演示数据</div>}
        </div>
      </div>

      {/* 资产总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="text-gray-400 text-sm mb-1">总市值</div>
          <div className="text-3xl font-bold text-white">¥{summary.totalAssets.toLocaleString()}</div>
        </div>
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6 relative group">
          <div className="absolute top-4 right-4 text-gray-400 cursor-help" title="基于昨日收盘市值 vs 当前市值计算">
            ❓
          </div>
          <div className="text-gray-400 text-sm mb-1">今日盈亏</div>
          <div className={`text-3xl font-bold ${summary.todayPnlAmount >= 0 ? 'text-up' : 'text-down'}`}>
            {summary.todayPnlAmount >= 0 ? '+' : ''}{summary.todayPnlAmount.toLocaleString()} ({summary.todayPnlPercent >= 0 ? '+' : ''}{summary.todayPnlPercent.toFixed(2)}%)
          </div>
        </div>
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="text-gray-400 text-sm mb-1">总盈亏</div>
          <div className={`text-3xl font-bold ${summary.totalPnlAmount >= 0 ? 'text-up' : 'text-down'}`}>
            {summary.totalPnlAmount >= 0 ? '+' : ''}{summary.totalPnlAmount.toLocaleString()} ({summary.totalPnlPercent >= 0 ? '+' : ''}{summary.totalPnlPercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* 今日决策 */}
      {todayDecisions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gold mb-3">📋 今日决策</h2>
          <div className="space-y-2">
            {todayDecisions.map((decision, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
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

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 资产配比 */}
        <DashboardCard title="持仓配比">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={assetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* 今日排行 */}
        <DashboardCard title="今日排行">
          <div className="flex mb-4 space-x-2">
            <button
              onClick={() => setLeaderboardTab('percentage')}
              className={`px-3 py-1 rounded-lg text-sm ${leaderboardTab === 'percentage' ? 'bg-gold text-black' : 'bg-gray-700 text-gray-300'}`}
            >
              按百分比
            </button>
            <button
              onClick={() => setLeaderboardTab('amount')}
              className={`px-3 py-1 rounded-lg text-sm ${leaderboardTab === 'amount' ? 'bg-gold text-black' : 'bg-gray-700 text-gray-300'}`}
            >
              按金额
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-2">领涨</div>
              {topGainers.map((h, idx) => (
                <div key={idx} onClick={() => router.push(`/holdings/${h.code}`)} className="flex justify-between items-center py-2 border-b border-gray-700 hover:bg-white/5 cursor-pointer rounded px-1">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white block truncate">{h.name}</span>
                    <span className="text-xs text-gray-400">持仓 ¥{h.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="text-right ml-2">
                    <span className={`text-sm font-medium block ${h.dailyPnlPercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {leaderboardTab === 'percentage'
                        ? `${h.dailyPnlPercent >= 0 ? '+' : ''}${h.dailyPnlPercent.toFixed(2)}%`
                        : `${h.dailyPnlAmount >= 0 ? '+' : ''}¥${h.dailyPnlAmount.toLocaleString()}`}
                    </span>
                    <span className={`text-xs block ${h.unrealizedPnlAmount >= 0 ? 'text-up' : 'text-down'}`}>
                      累计 {h.unrealizedPnlAmount >= 0 ? '+' : ''}¥{h.unrealizedPnlAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">领跌</div>
              {topLosers.map((h, idx) => (
                <div key={idx} onClick={() => router.push(`/holdings/${h.code}`)} className="flex justify-between items-center py-2 border-b border-gray-700 hover:bg-white/5 cursor-pointer rounded px-1">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white block truncate">{h.name}</span>
                    <span className="text-xs text-gray-400">持仓 ¥{h.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="text-right ml-2">
                    <span className={`text-sm font-medium block ${h.dailyPnlPercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {leaderboardTab === 'percentage'
                        ? `${h.dailyPnlPercent >= 0 ? '+' : ''}${h.dailyPnlPercent.toFixed(2)}%`
                        : `${h.dailyPnlAmount >= 0 ? '+' : ''}¥${h.dailyPnlAmount.toLocaleString()}`}
                    </span>
                    <span className={`text-xs block ${h.unrealizedPnlAmount >= 0 ? 'text-up' : 'text-down'}`}>
                      累计 {h.unrealizedPnlAmount >= 0 ? '+' : ''}¥{h.unrealizedPnlAmount.toLocaleString()}
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
        <p className="text-xs text-gray-500 mt-2 text-center">📊 演示数据 - 实际使用中可接入真实历史数据</p>
      </DashboardCard>
    </div>
  );
}
