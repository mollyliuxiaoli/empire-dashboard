"use client";

import { useState } from 'react';
import { portfolioData, Fund } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';

export default function HoldingsPage() {
  const [expandedFund, setExpandedFund] = useState<string | null>(null);

  const toggleExpand = (code: string) => {
    setExpandedFund(expandedFund === code ? null : code);
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">🎯 标的详情</h1>
        <p className="text-gray-400 text-sm">持仓标的 · 基金{portfolioData.funds.length}只 · ETF{portfolioData.etfStocks.length}只</p>
      </div>

      {/* 基金列表 */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">基金持仓</h2>
        {portfolioData.funds.map((fund) => (
          <DashboardCard key={fund.code} className="cursor-pointer hover:border-gold/50" onClick={() => toggleExpand(fund.code)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">{fund.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    fund.profit >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'
                  }`}>
                    {fund.profit >= 0 ? '+' : ''}{fund.profit.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="mr-4">代码: {fund.code}</span>
                  <span className="mr-4">类型: {fund.type}</span>
                  <span>持仓: ¥{fund.amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${fund.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                  {fund.dailyChange >= 0 ? '+' : ''}{fund.dailyChange.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-400">今日</div>
              </div>
            </div>

            {expandedFund === fund.code && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">成本价</div>
                    <div className="text-sm font-medium text-white">¥{fund.cost.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">现价</div>
                    <div className="text-sm font-medium text-white">¥{fund.current.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">太后评级</div>
                    <div className="text-sm font-medium text-gold">{fund.rating}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">风险等级</div>
                    <div className="text-sm font-medium">{getRiskIcon(fund.riskLevel)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">操作策略</div>
                  <div className="text-sm text-white bg-background/50 p-2 rounded">{fund.strategy}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">定投状态</div>
                  <div className={`text-sm font-medium ${fund.autoInvest > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {fund.autoInvest > 0 ? `¥${fund.autoInvest}/日` : '已暂停'}
                  </div>
                </div>

                {fund.triggerPrice && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">触发价格</div>
                    <div className="text-sm text-gold">¥{fund.triggerPrice.toFixed(3)}</div>
                  </div>
                )}
              </div>
            )}
          </DashboardCard>
        ))}
      </div>

      {/* ETF列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">ETF持仓</h2>
        {portfolioData.etfStocks.map((etf) => (
          <DashboardCard key={etf.code}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">{etf.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    etf.profitPercent >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'
                  }`}>
                    {etf.profitPercent >= 0 ? '+' : ''}{etf.profitPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="mr-4">代码: {etf.code}</span>
                  <span className="mr-4">交易所: {etf.exchange.toUpperCase()}</span>
                  <span>持仓: {etf.shares.toLocaleString()}股</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">¥{etf.amount.toLocaleString()}</div>
                <div className={`text-sm ${etf.profit >= 0 ? 'text-up' : 'text-down'}`}>
                  {etf.profit >= 0 ? '+' : ''}¥{etf.profit.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">成本价</div>
                <div className="text-sm font-medium text-white">¥{etf.cost.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">现价</div>
                <div className="text-sm font-medium text-white">¥{etf.price.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">今日涨跌</div>
                <div className={`text-sm font-medium ${etf.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                  {etf.dailyChange >= 0 ? '+' : ''}{etf.dailyChange.toFixed(2)}%
                </div>
              </div>
            </div>
          </DashboardCard>
        ))}
      </div>

      {/* 黄金持仓 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">黄金持仓</h2>
        <DashboardCard>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-white mb-2">黄金现货</div>
              <div className="text-sm text-gray-400">持有: {portfolioData.gold.holding.toFixed(2)}克</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gold">¥{portfolioData.gold.value.toLocaleString()}</div>
              <div className={`text-sm ${portfolioData.gold.profit >= 0 ? 'text-up' : 'text-down'}`}>
                {portfolioData.gold.profit >= 0 ? '+' : ''}¥{portfolioData.gold.profit.toLocaleString()}
                <span className="ml-2">({portfolioData.gold.profitPercent >= 0 ? '+' : ''}{portfolioData.gold.profitPercent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
