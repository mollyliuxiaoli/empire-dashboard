"use client";

import { useState } from 'react';
import { portfolioData } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';
import T0Calculator from '@/components/T0Calculator';

export default function TradingPage() {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const getStarRating = (score: number) => {
    return '⭐'.repeat(score) + '☆'.repeat(5 - score);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '关注': return 'text-gold';
      case '偏弱': return 'text-gray-400';
      case '观望': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">⚡ 做T中心</h1>
        <p className="text-gray-400 text-sm">T+0交易 · 日内操作 · 快进快出</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* T+0标的池 */}
        <div className="lg:col-span-2">
          <DashboardCard title="T+0 标的池" icon="🎯">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">代码</th>
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">名称</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">现价</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">涨跌%</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">振幅%</th>
                    <th className="text-center py-3 px-2 text-sm text-gray-400 font-medium">评分</th>
                    <th className="text-center py-3 px-2 text-sm text-gray-400 font-medium">状态</th>
                    <th className="text-center py-3 px-2 text-sm text-gray-400 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.t0Targets.map((target) => (
                    <>
                      <tr key={target.code} className="border-b border-border hover:bg-white/5">
                        <td className="py-3 px-2 text-sm font-medium text-white">{target.code}</td>
                        <td className="py-3 px-2 text-sm text-white">{target.name}</td>
                        <td className="py-3 px-2 text-sm text-right text-white">{target.price.toFixed(3)}</td>
                        <td className={`py-3 px-2 text-sm text-right ${target.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                          {target.dailyChange >= 0 ? '+' : ''}{target.dailyChange.toFixed(2)}%
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-white">{target.amplitude.toFixed(2)}%</td>
                        <td className="py-3 px-2 text-sm text-center text-gold">{getStarRating(target.t0Score)}</td>
                        <td className={`py-3 px-2 text-sm text-center font-medium ${getStatusColor(target.status)}`}>
                          {target.status}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => setSelectedTarget(selectedTarget === target.code ? null : target.code)}
                            className="text-xs bg-gold/20 text-gold px-3 py-1 rounded hover:bg-gold/30 transition-colors"
                          >
                            {selectedTarget === target.code ? '收起' : '详情'}
                          </button>
                        </td>
                      </tr>
                      {selectedTarget === target.code && (
                        <tr className="bg-gold/5">
                          <td colSpan={8} className="py-4 px-4">
                            <div className="bg-background/80 rounded-lg p-4 border border-gold/20">
                              <h4 className="text-gold font-semibold mb-2">📡 做T信号</h4>
                              <p className="text-white mb-3">{target.signal}</p>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">振幅:</span>
                                  <span className="text-white ml-2">{target.amplitude}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">评分:</span>
                                  <span className="text-gold ml-2">{getStarRating(target.t0Score)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">状态:</span>
                                  <span className={`ml-2 ${getStatusColor(target.status)}`}>{target.status}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* 做T计算器 */}
        <div className="lg:col-span-1">
          <DashboardCard title="做T计算器" icon="🧮">
            <T0Calculator />
          </DashboardCard>
        </div>

        {/* 纪律提示 */}
        <div className="lg:col-span-1">
          <DashboardCard title="纪律铁律" icon="⚠️">
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-2">🚨 严格止损</h4>
                <p className="text-sm text-gray-300">T+0标的必须在 -1.5% 止损，绝不抗单</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">🎯 适时止盈</h4>
                <p className="text-sm text-gray-300">达到 +2% 立即止盈，不要贪心</p>
              </div>

              <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                <h4 className="text-gold font-semibold mb-2">💰 控制仓位</h4>
                <p className="text-sm text-gray-300">单次做T金额 ≤ 5,000元</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">⏰ 把握时机</h4>
                <p className="text-sm text-gray-300">早盘10:00-10:30、午盘14:00-14:30是最佳做T窗口</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">📊 选择标的</h4>
                <p className="text-sm text-gray-300">优先选择振幅大、评分高的标的</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
