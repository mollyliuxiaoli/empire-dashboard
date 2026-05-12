"use client";

import { portfolioData } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';

export default function MacroPage() {
  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-up' : 'text-down';
  };

  const getSignalIcon = (signal: string) => {
    if (signal.includes('不宜') || signal.includes('震荡')) return '⚠️';
    if (signal.includes('新高')) return '🔥';
    return '📌';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">🌍 宏观雷达</h1>
        <p className="text-gray-400 text-sm">全球市场 · 大宗商品 · 汇率波动</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 美股传导分析 */}
        <DashboardCard title="美股市场" icon="🇺🇸">
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">道琼斯</div>
                <div className={`text-sm ${getChangeColor(portfolioData.macro.usStocks.dowJones.change)}`}>
                  {portfolioData.macro.usStocks.dowJones.change >= 0 ? '+' : ''}{portfolioData.macro.usStocks.dowJones.change}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {portfolioData.macro.usStocks.dowJones.value.toLocaleString()}
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">纳斯达克</div>
                <div className={`text-sm ${getChangeColor(portfolioData.macro.usStocks.nasdaq.change)}`}>
                  {portfolioData.macro.usStocks.nasdaq.change >= 0 ? '+' : ''}{portfolioData.macro.usStocks.nasdaq.change}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {portfolioData.macro.usStocks.nasdaq.value.toLocaleString()}
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">标普500</div>
                <div className={`text-sm ${getChangeColor(portfolioData.macro.usStocks.sp500.change)}`}>
                  {portfolioData.macro.usStocks.sp500.change >= 0 ? '+' : ''}{portfolioData.macro.usStocks.sp500.change}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {portfolioData.macro.usStocks.sp500.value.toLocaleString()}
              </div>
            </div>

            <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
              <div className="text-sm text-gold">📊 {portfolioData.macro.usStocks.note}</div>
              <div className="text-xs text-gray-400 mt-1">美股创新高对QDII基金有积极影响</div>
            </div>
          </div>
        </DashboardCard>

        {/* 汇率 */}
        <DashboardCard title="汇率市场" icon="💱">
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <div className="text-sm text-gray-400 mb-2">美元/人民币</div>
              <div className="text-4xl font-bold text-white mb-2">
                {portfolioData.gold.exchangeRate.toFixed(3)}
              </div>
              <div className="text-sm text-gray-400">
                影响: QDII基金汇率成本
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">💡 汇率分析</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 美元升值 → QDII基金汇损增加</li>
                <li>• 美元贬值 → QDII基金汇益增加</li>
                <li>• 当前汇率处于相对稳定区间</li>
              </ul>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* 大宗商品 */}
      <DashboardCard title="大宗商品" icon="🪙">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* 黄金 */}
          <div className="bg-background/50 rounded-lg p-4 border border-border hover:border-gold/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🥇</div>
              <div className={`text-sm ${getChangeColor(portfolioData.macro.commodities.gold.change)}`}>
                {portfolioData.macro.commodities.gold.change >= 0 ? '+' : ''}{portfolioData.macro.commodities.gold.change}%
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-1">黄金</div>
            <div className="text-xl font-bold text-white">
              ${portfolioData.macro.commodities.gold.price.toLocaleString()}
            </div>
            <div className="text-xs text-gold mt-2">
              {getSignalIcon(portfolioData.macro.commodities.gold.signal)} {portfolioData.macro.commodities.gold.signal}
            </div>
          </div>

          {/* 白银 */}
          <div className="bg-background/50 rounded-lg p-4 border border-border hover:border-gold/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🥈</div>
              <div className={`text-sm ${getChangeColor(portfolioData.macro.commodities.silver.change)}`}>
                {portfolioData.macro.commodities.silver.change >= 0 ? '+' : ''}{portfolioData.macro.commodities.silver.change}%
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-1">白银</div>
            <div className="text-xl font-bold text-white">
              ${portfolioData.macro.commodities.silver.price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {getSignalIcon(portfolioData.macro.commodities.silver.signal)} {portfolioData.macro.commodities.silver.signal}
            </div>
          </div>

          {/* 铜 */}
          <div className="bg-background/50 rounded-lg p-4 border border-border hover:border-gold/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🔧</div>
              <div className={`text-sm ${getChangeColor(portfolioData.macro.commodities.copper.change)}`}>
                {portfolioData.macro.commodities.copper.change >= 0 ? '+' : ''}{portfolioData.macro.commodities.copper.change}%
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-1">铜</div>
            <div className="text-xl font-bold text-white">
              ${portfolioData.macro.commodities.copper.price}/lb
            </div>
            <div className="text-xs text-up mt-2">
              {getSignalIcon(portfolioData.macro.commodities.copper.signal)} {portfolioData.macro.commodities.copper.signal}
            </div>
          </div>

          {/* 原油 */}
          <div className="bg-background/50 rounded-lg p-4 border border-border hover:border-gold/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🛢️</div>
              <div className={`text-sm ${getChangeColor(portfolioData.macro.commodities.oil.change)}`}>
                {portfolioData.macro.commodities.oil.change >= 0 ? '+' : ''}{portfolioData.macro.commodities.oil.change}%
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-1">原油</div>
            <div className="text-xl font-bold text-white">
              ${portfolioData.macro.commodities.oil.price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {getSignalIcon(portfolioData.macro.commodities.oil.signal)} {portfolioData.macro.commodities.oil.signal}
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-semibold mb-2">📊 大宗商品分析</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 黄金处于历史高位，不宜追高，持有为主</li>
            <li>• 白银跟随黄金走势，波动较大</li>
            <li>• 铜价创新高反映全球经济复苏预期</li>
            <li>• 原油高位震荡，关注地缘政治影响</li>
          </ul>
        </div>
      </DashboardCard>
    </div>
  );
}
