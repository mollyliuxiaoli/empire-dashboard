"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import DashboardCard from '@/components/DashboardCard';
import { portfolioData } from '@/data/portfolio';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaderboardTab, setLeaderboardTab] = useState<'amount' | 'percentage'>('percentage');
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRefreshTime = () => {
    const refreshTime = new Date(currentTime.getTime() - 60000); // 模拟1分钟前刷新
    return refreshTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 资产配比数据
  const assetDistribution = [
    { name: 'QDII', value: portfolioData.funds.filter(f => f.type.includes('QDII')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'A股', value: portfolioData.funds.filter(f => f.type.includes('A股')).reduce((sum, f) => sum + f.amount, 0) },
    { name: '债券/固收', value: portfolioData.funds.filter(f => f.type.includes('债券') || f.type.includes('固收')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'ETF', value: portfolioData.etfStocks.reduce((sum, e) => sum + e.amount, 0) },
    { name: '黄金', value: portfolioData.gold.value },
  ];

  const COLORS = ['#D4AF37', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6'];

  // 涨跌排行
  const sortedFundsByPercent = [...portfolioData.funds].sort((a, b) => b.dailyChange - a.dailyChange);
  const sortedFundsByAmount = [...portfolioData.funds].sort((a, b) => (b.dailyChange * b.amount / 100) - (a.dailyChange * a.amount / 100));
  const topGainers = leaderboardTab === 'percentage' ? sortedFundsByPercent.slice(0, 3) : sortedFundsByAmount.slice(0, 3);
  const topLosers = leaderboardTab === 'percentage' ? sortedFundsByPercent.slice(-3).reverse() : sortedFundsByAmount.slice(-3).reverse();

  // 模拟收益曲线数据
  const mockPerformanceData = [
    { date: '5/6', value: 339800 },
    { date: '5/7', value: 340500 },
    { date: '5/8', value: 341200 },
    { date: '5/9', value: 340900 },
    { date: '5/10', value: 342100 },
    { date: '5/11', value: 342744 },
    { date: '5/12', value: 342417 },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">👑 帝国操盘室</h1>
          <p className="text-gray-400 text-sm">持仓总览 · {getRefreshTime()} 刷新</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>数据更新: {getRefreshTime()}</div>
        </div>
      </div>

      {/* 资产全景卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6">
          <div className="text-gray-400 text-sm mb-1">总市值</div>
          <div className="text-3xl font-bold text-white">¥{portfolioData.totalAssets.toLocaleString()}</div>
        </div>
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6 relative group">
          <div className="absolute top-4 right-4 text-gray-400 cursor-help" title="基于昨日收盘市值 vs 当前市值计算">
            ❓
          </div>
          <div className="text-gray-400 text-sm mb-1">今日盈亏</div>
          <div className={`text-3xl font-bold ${portfolioData.todayChange >= 0 ? 'text-up' : 'text-down'}`}>
            {portfolioData.todayChange >= 0 ? '+' : ''}{portfolioData.todayChange.toLocaleString()}
            <span className="text-lg ml-2">({portfolioData.todayChangePercent >= 0 ? '+' : ''}{portfolioData.todayChangePercent.toFixed(2)}%)</span>
          </div>
        </div>
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-6 relative group">
          <div className="absolute top-4 right-4 text-gray-400 cursor-help" title="基于上周五收盘市值 vs 当前市值计算">
            ❓
          </div>
          <div className="text-gray-400 text-sm mb-1">本周收益</div>
          <div className="text-3xl font-bold text-gold">+1,234 <span className="text-lg">(+0.36%)</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 资产配比饼图 */}
        <DashboardCard title="资产配比" icon="🥧">
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
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                formatter={(value: number) => `¥${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* 涨跌排行 */}
        <DashboardCard title="今日排行" icon="📈">
          <div className="mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setLeaderboardTab('percentage')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  leaderboardTab === 'percentage'
                    ? 'bg-gold text-black'
                    : 'bg-background text-gray-400 hover:text-white'
                }`}
              >
                按涨跌幅
              </button>
              <button
                onClick={() => setLeaderboardTab('amount')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  leaderboardTab === 'amount'
                    ? 'bg-gold text-black'
                    : 'bg-background text-gray-400 hover:text-white'
                }`}
              >
                按涨跌金额
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-2">🔥 最佳表现 Top3</div>
              {topGainers.map((fund, index) => (
                <div
                  key={fund.code}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0 cursor-pointer hover:bg-white/5 px-2 rounded"
                  onClick={() => router.push(`/holdings/${fund.code}`)}
                >
                  <div>
                    <div className="font-medium text-white">{fund.name}</div>
                    <div className="text-xs text-gray-400">{fund.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-up font-semibold">+{fund.dailyChange.toFixed(2)}%</div>
                    <div className="text-xs text-gray-400">¥{fund.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">💧 表现较弱 Top3</div>
              {topLosers.map((fund, index) => (
                <div
                  key={fund.code}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0 cursor-pointer hover:bg-white/5 px-2 rounded"
                  onClick={() => router.push(`/holdings/${fund.code}`)}
                >
                  <div>
                    <div className="font-medium text-white">{fund.name}</div>
                    <div className="text-xs text-gray-400">{fund.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-down font-semibold">{fund.dailyChange.toFixed(2)}%</div>
                    <div className="text-xs text-gray-400">¥{fund.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 迷你收益曲线 */}
        <div className="lg:col-span-2">
          <DashboardCard title="近期走势" icon="📊">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888888" />
                <YAxis
                  stroke="#888888"
                  domain={['dataMin - 5000', 'dataMax + 5000']}
                  tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  formatter={(value: number) => `¥${value.toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </DashboardCard>
        </div>

        {/* 信号看板 */}
        <DashboardCard title="信号看板" icon="🚨">
          <div className="space-y-3">
            {portfolioData.pendingActions.slice(0, 3).map((action, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${
                  action.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                  action.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-gray-500/10 border-gray-500/30'
                }`}
                onClick={() => router.push(`/holdings/${action.code}`)}
              >
                <div className="text-sm font-medium text-white mb-1">{action.action}</div>
                <div className="text-xs text-gray-400">{action.trigger}</div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
