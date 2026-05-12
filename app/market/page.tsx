"use client";

import { portfolioData, aStockIndices, hkStockIndices, sectors } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';

export default function MarketPage() {
  const { macro, gold } = portfolioData;
  const getChangeColor = (change: number) => change >= 0 ? 'text-up' : 'text-down';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">🌍 市场雷达</h1>
        <p className="text-gray-400 text-sm">全球市场 · 板块行情 · 大宗商品</p>
      </div>

      {/* A股指数 */}
      <DashboardCard title="🇨🇳 A股指数" className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aStockIndices.map((idx) => (
            <div key={idx.name} className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">{idx.name}</span>
                <span className={`text-sm font-medium ${getChangeColor(idx.change)}`}>
                  {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{idx.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* 港股指数 */}
      <DashboardCard title="🇭🇰 港股指数" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hkStockIndices.map((idx) => (
            <div key={idx.name} className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">{idx.name}</span>
                <span className={`text-sm font-medium ${getChangeColor(idx.change)}`}>
                  {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{idx.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* 板块行情 */}
      <DashboardCard title="📊 板块行情" className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sectors.map((sector) => (
            <div key={sector.name} className="bg-background/50 rounded-lg p-3 border border-border hover:border-gold/50 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white font-medium">{sector.name}</span>
                <span className={`text-sm font-bold ${getChangeColor(sector.change)}`}>
                  {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded inline-block ${
                sector.signal === '偏强' || sector.signal === '反弹' || sector.signal === '稳定' ? 'bg-up/20 text-up' :
                sector.signal === '弱势' || sector.signal === '调整' || sector.signal === '回调' ? 'bg-down/20 text-down' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {sector.signal}
              </span>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* 美股 */}
      <DashboardCard title="🇺🇸 美股市场" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(macro.usStocks).filter(([key]) => key !== 'note').map(([key, data]: [string, any]) => (
            <div key={key} className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">
                  {key === 'dowJones' ? '道琼斯' : key === 'nasdaq' ? '纳斯达克' : '标普500'}
                </span>
                <span className={`text-sm font-medium ${getChangeColor(data.change)}`}>
                  {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{data.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
        {macro.usStocks.note && <div className="mt-3 text-xs text-gray-400">📌 {macro.usStocks.note}</div>}
      </DashboardCard>

      {/* 大宗商品 */}
      <DashboardCard title="⛏️ 大宗商品" className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <span className={`text-xs px-2 py-0.5 rounded inline-block ${
                commodity.signal.includes('强') || commodity.signal.includes('涨') ? 'bg-up/20 text-up' :
                commodity.signal.includes('弱') || commodity.signal.includes('跌') || commodity.signal.includes('调整') ? 'bg-down/20 text-down' :
                'bg-gray-500/20 text-gray-400'
              }`}>{commodity.signal}</span>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* 黄金持仓 */}
      <DashboardCard title="🪙 黄金持仓" className="mb-6">
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
              ¥{gold.value.toLocaleString()} · {gold.profit >= 0 ? '+' : ''}¥{gold.profit}({gold.profitPercent}%)
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* 行情分析 */}
      <DashboardCard title="📝 行情简评" className="mb-6">
        <div className="space-y-3">
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <h4 className="text-gold font-medium mb-2">🇨🇳 A股</h4>
            <p className="text-sm text-gray-300">三大指数小幅调整，创业板领跌。半导体和AI板块回调明显，消费金融相对抗跌。市场观望情绪浓厚，等待政策面催化。</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <h4 className="text-gold font-medium mb-2">🇭🇰 港股</h4>
            <p className="text-sm text-gray-300">恒生指数和恒生科技小幅收跌。互联网板块继续承压，美团、阿里均下跌。南向资金流出，市场情绪偏弱。</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <h4 className="text-gold font-medium mb-2">🇺🇸 美股</h4>
            <p className="text-sm text-gray-300">三大指数齐创历史收盘新高。科技股表现强劲，利好QDII基金。但需警惕高位回调风险。</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <h4 className="text-gold font-medium mb-2">🥇 黄金</h4>
            <p className="text-sm text-gray-300">国际金价高位震荡，$4,700/oz以上运行。地缘政治风险和央行购金支撑金价。短期有调整压力，中期仍看涨。</p>
          </div>
        </div>
      </DashboardCard>

      <div className="text-center text-xs text-gray-500 py-4">
        ⚠️ 数据仅供参考，不构成投资建议。📊 演示数据。
      </div>
    </div>
  );
}
