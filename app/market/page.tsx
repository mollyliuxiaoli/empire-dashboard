"use client";

import { portfolioData } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';

export default function MarketPage() {
  const { macro, gold } = portfolioData;

  const getChangeColor = (change: number) => change >= 0 ? 'text-up' : 'text-down';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">🌍 市场雷达</h1>
        <p className="text-gray-400 text-sm">全球市场 · 大宗商品 · 黄金</p>
      </div>

      {/* 美股 */}
      <DashboardCard title="美股市场" icon="🇺🇸" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">道琼斯</span>
              <span className={`text-sm font-medium ${getChangeColor(macro.usStocks.dowJones.change)}`}>
                {macro.usStocks.dowJones.change >= 0 ? '+' : ''}{macro.usStocks.dowJones.change.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{macro.usStocks.dowJones.value.toLocaleString()}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">纳斯达克</span>
              <span className={`text-sm font-medium ${getChangeColor(macro.usStocks.nasdaq.change)}`}>
                {macro.usStocks.nasdaq.change >= 0 ? '+' : ''}{macro.usStocks.nasdaq.change.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{macro.usStocks.nasdaq.value.toLocaleString()}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">标普500</span>
              <span className={`text-sm font-medium ${getChangeColor(macro.usStocks.sp500.change)}`}>
                {macro.usStocks.sp500.change >= 0 ? '+' : ''}{macro.usStocks.sp500.change.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{macro.usStocks.sp500.value.toLocaleString()}</div>
          </div>
        </div>
        {macro.usStocks.note && (
          <div className="mt-3 text-xs text-gray-400">📌 {macro.usStocks.note}</div>
        )}
      </DashboardCard>

      {/* 大宗商品 */}
      <DashboardCard title="大宗商品" icon="⛏️" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(macro.commodities).map(([key, commodity]: [string, any]) => (
            <div key={key} className="bg-background/50 rounded-lg p-4 border border-border hover:border-gold/50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  {key === 'gold' ? '🥇 黄金' : key === 'silver' ? '🥈 白银' : key === 'copper' ? '🟤 铜' : '🛢️ 原油'}
                </span>
                <span className={`text-sm font-medium ${getChangeColor(commodity.change)}`}>
                  {commodity.change >= 0 ? '+' : ''}{commodity.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-1">
                {key === 'gold' ? `$${commodity.price.toLocaleString()}` : `$${commodity.price}`}
              </div>
              <div className={`text-xs px-2 py-0.5 rounded inline-block ${
                commodity.signal === '强势' || commodity.signal === '上涨' ? 'bg-up/20 text-up' :
                commodity.signal === '弱势' || commodity.signal === '下跌' ? 'bg-down/20 text-down' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {commodity.signal}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* 黄金持仓 */}
      <DashboardCard title="黄金持仓" icon="🪙" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="text-xs text-gray-400 mb-1">国际金价</div>
            <div className="text-2xl font-bold text-white">${gold.internationalPrice.toLocaleString()}/oz</div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="text-xs text-gray-400 mb-1">国内金价</div>
            <div className="text-2xl font-bold text-white">¥{gold.yuanPerGram.toFixed(1)}/克</div>
            <div className="text-xs text-gray-400 mt-1">汇率: {gold.exchangeRate}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="text-xs text-gray-400 mb-1">我的黄金</div>
            <div className="text-2xl font-bold text-white">{gold.holding}克</div>
            <div className={`text-sm font-medium ${gold.profit >= 0 ? 'text-up' : 'text-down'}`}>
              价值 ¥{gold.value.toLocaleString()} · {gold.profit >= 0 ? '+' : ''}¥{gold.profit}({gold.profitPercent}%)
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* 免责 */}
      <div className="text-center text-xs text-gray-500 py-4">
        ⚠️ 数据仅供参考，不构成投资建议。{macro.isMock && '📊 当前为演示数据。'}
        {macro.asOf && `更新时间: ${new Date(macro.asOf).toLocaleString('zh-CN')}`}
      </div>
    </div>
  );
}
