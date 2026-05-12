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

  // 模拟A股板块数据
  const aShareSectors = [
    { name: '科技', change: 2.35, flow: 15.8, hotness: '🔥🔥🔥', trend: '连续3日净流入' },
    { name: '半导体', change: 3.12, flow: 8.5, hotness: '🔥🔥🔥', trend: '强势突破' },
    { name: 'AI软件', change: 1.89, flow: 5.2, hotness: '🔥🔥', trend: '震荡上行' },
    { name: '消费', change: -0.45, flow: -3.2, hotness: '❄️', trend: '资金流出' },
    { name: '医药', change: 0.78, flow: 2.1, hotness: '🌤️', trend: '温和反弹' },
    { name: '新能源', change: -1.23, flow: -6.8, hotness: '❄️❄️', trend: '持续调整' },
    { name: '军工', change: 1.56, flow: 4.3, hotness: '🔥🔥', trend: '政策利好' },
    { name: '金融', change: 0.23, flow: 1.5, hotness: '🌤️', trend: '低位盘整' },
    { name: '地产', change: -0.89, flow: -4.5, hotness: '❄️', trend: '承压下行' },
    { name: '红利', change: 0.67, flow: 3.8, hotness: '🌤️', trend: '稳健表现' }
  ];

  // 模拟港股板块数据
  const hkSectors = [
    { name: '恒生科技', change: 1.45, flow: 8.5, trend: '南向资金净流入' },
    { name: '港股互联网', change: 2.12, flow: 6.2, trend: '强势反弹' },
    { name: '港股医药', change: -0.34, flow: -1.5, trend: '弱势震荡' },
    { name: '港股金融', change: 0.56, flow: 2.8, trend: '低位企稳' }
  ];

  // 模拟美股板块数据
  const usSectors = [
    { name: '科技', change: 1.89, rotation: '轮动信号: 强势延续' },
    { name: '消费', change: 0.67, rotation: '轮动信号: 温和跟进' },
    { name: '金融', change: -0.23, rotation: '轮动信号: 资金流出' },
    { name: '能源', change: 1.12, rotation: '轮动信号: 地缘提振' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">🌍 宏观雷达</h1>
        <p className="text-gray-400 text-sm">全球市场 · 板块轮动 · 资金流向</p>
      </div>

      {/* 板块轮动分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <DashboardCard title="热门板块 Top3" icon="🔥">
          <div className="space-y-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">半导体</span>
                <span className="text-red-400 font-bold">+3.12%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">资金净流入 ¥8.5亿</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">科技</span>
                <span className="text-red-400 font-bold">+2.35%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">资金净流入 ¥15.8亿</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">港股互联网</span>
                <span className="text-red-400 font-bold">+2.12%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">南向资金净流入 ¥6.2亿</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="冷门板块 Top3" icon="❄️">
          <div className="space-y-3">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">新能源</span>
                <span className="text-green-400 font-bold">-1.23%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">资金净流出 ¥6.8亿</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">地产</span>
                <span className="text-green-400 font-bold">-0.89%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">资金净流出 ¥4.5亿</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">消费</span>
                <span className="text-green-400 font-bold">-0.45%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">资金净流出 ¥3.2亿</div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="轮动信号" icon="🔄">
          <div className="space-y-3">
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
              <div className="text-gold font-semibold mb-1">🚀 激进信号</div>
              <div className="text-sm text-gray-300">半导体板块连续3日资金净流入，关注相关ETF机会</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-400 font-semibold mb-1">📈 趋势信号</div>
              <div className="text-sm text-gray-300">港股互联网强势反弹，可适度参与</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-yellow-400 font-semibold mb-1">⚠️ 谨慎信号</div>
              <div className="text-sm text-gray-300">新能源持续调整，建议观望等待企稳</div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* A股板块 */}
        <div className="lg:col-span-2">
          <DashboardCard title="A股板块" icon="🇨🇳">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">板块</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">涨跌幅</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">资金净流入</th>
                    <th className="text-center py-3 px-2 text-sm text-gray-400 font-medium">热度</th>
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {aShareSectors.map((sector, index) => (
                    <tr key={index} className="border-b border-border hover:bg-white/5">
                      <td className="py-3 px-2 text-sm font-medium text-white">{sector.name}</td>
                      <td className={`py-3 px-2 text-sm text-right ${getChangeColor(sector.change)}`}>
                        {sector.change >= 0 ? '+' : ''}{sector.change}%
                      </td>
                      <td className={`py-3 px-2 text-sm text-right ${sector.flow >= 0 ? 'text-up' : 'text-down'}`}>
                        {sector.flow >= 0 ? '+' : ''}{sector.flow}亿
                      </td>
                      <td className="py-3 px-2 text-sm text-center">{sector.hotness}</td>
                      <td className="py-3 px-2 text-sm text-gray-300">{sector.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* 美股市场 */}
        <div>
          <DashboardCard title="美股板块" icon="🇺🇸">
            <div className="space-y-4 mb-6">
              <div className="bg-background/50 rounded-lg p-3 border border-border">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-400">道琼斯</div>
                  <div className={`text-xs ${getChangeColor(portfolioData.macro.usStocks.dowJones.change)}`}>
                    {portfolioData.macro.usStocks.dowJones.change >= 0 ? '+' : ''}{portfolioData.macro.usStocks.dowJones.change}%
                  </div>
                </div>
                <div className="text-lg font-bold text-white">
                  {portfolioData.macro.usStocks.dowJones.value.toLocaleString()}
                </div>
              </div>

              <div className="bg-background/50 rounded-lg p-3 border border-border">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-400">纳斯达克</div>
                  <div className={`text-xs ${getChangeColor(portfolioData.macro.usStocks.nasdaq.change)}`}>
                    {portfolioData.macro.usStocks.nasdaq.change >= 0 ? '+' : ''}{portfolioData.macro.usStocks.nasdaq.change}%
                  </div>
                </div>
                <div className="text-lg font-bold text-white">
                  {portfolioData.macro.usStocks.nasdaq.value.toLocaleString()}
                </div>
              </div>

              <div className="bg-background/50 rounded-lg p-3 border border-border">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-400">标普500</div>
                  <div className={`text-xs ${getChangeColor(portfolioData.macro.usStocks.sp500.change)}`}>
                    {portfolioData.macro.usStocks.sp500.change >= 0 ? '+' : ''}{portfolioData.macro.usStocks.sp500.change}%
                  </div>
                </div>
                <div className="text-lg font-bold text-white">
                  {portfolioData.macro.usStocks.sp500.value.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="text-sm text-gray-400 mb-3">板块轮动</div>
              {usSectors.map((sector, index) => (
                <div key={index} className="mb-3 pb-3 border-b border-border last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white">{sector.name}</span>
                    <span className={`text-xs ${getChangeColor(sector.change)}`}>
                      {sector.change >= 0 ? '+' : ''}{sector.change}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{sector.rotation}</div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 港股板块 */}
        <DashboardCard title="港股板块" icon="🇭🇰">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">板块</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">涨跌幅</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">南向资金</th>
                  <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">趋势</th>
                </tr>
              </thead>
              <tbody>
                {hkSectors.map((sector, index) => (
                  <tr key={index} className="border-b border-border hover:bg-white/5">
                    <td className="py-3 px-2 text-sm font-medium text-white">{sector.name}</td>
                    <td className={`py-3 px-2 text-sm text-right ${getChangeColor(sector.change)}`}>
                      {sector.change >= 0 ? '+' : ''}{sector.change}%
                    </td>
                    <td className={`py-3 px-2 text-sm text-right ${sector.flow >= 0 ? 'text-up' : 'text-down'}`}>
                      {sector.flow >= 0 ? '+' : ''}{sector.flow}亿
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-300">{sector.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* 汇率市场 */}
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
            <li>• 黄金处于历史高位，不宜追高，持有为主，关注美联储政策变化</li>
            <li>• 白银跟随黄金走势，波动较大，工业需求支撑价格</li>
            <li>• 铜价创新高反映全球经济复苏预期，但需警惕回调风险</li>
            <li>• 原油高位震荡，关注地缘政治和OPEC+产量政策</li>
          </ul>
        </div>
      </DashboardCard>
    </div>
  );
}
