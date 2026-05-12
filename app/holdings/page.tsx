"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { portfolioData, Fund, ETFStock, usStocks, hkStocks, USStock, HKStock } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';
import { holdingsAPI } from '@/lib/api/holdings-api';
import { HoldingAsset } from '@/lib/api/api-structure';

type TabType = 'funds' | 'etf' | 'us' | 'hk' | 'gold';
type SortType = 'amount' | 'change' | 'profit';

interface OperationRecord {
  id: string;
  assetCode: string;
  assetName: string;
  operationType: string;
  price: number;
  amount: number;
  fee?: number;
  note?: string;
  timestamp: number;
}

export default function HoldingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('funds');
  const [sortBy, setSortBy] = useState<SortType>('amount');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Fund | ETFStock | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRefreshTime = () => {
    const refreshTime = new Date(currentTime.getTime() - 60000);
    return refreshTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  // 排序逻辑
  const sortData = <T extends Fund | ETFStock>(data: T[]): T[] => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'change':
          return b.dailyChange - a.dailyChange;
        case 'profit':
          const profitA = 'profitPercent' in a ? a.profitPercent : a.profit;
          const profitB = 'profitPercent' in b ? b.profitPercent : b.profit;
          return profitB - profitA;
        default:
          return 0;
      }
    });
  };

  const sortedFunds = sortData(portfolioData.funds);
  const sortedETFs = sortData(portfolioData.etfStocks);

  // 计算各Tab的统计数据
  const getFundsStats = () => {
    const totalAmount = portfolioData.funds.reduce((sum, f) => sum + f.amount, 0);
    const totalProfit = portfolioData.funds.reduce((sum, f) => sum + (f.profit * f.amount / 100), 0);
    const profitPercent = (totalProfit / totalAmount) * 100;
    const todayChange = portfolioData.funds.reduce((sum, f) => sum + (f.dailyChange * f.amount / 100), 0) / totalAmount * 100;

    return {
      count: portfolioData.funds.length,
      totalAmount,
      totalProfit,
      profitPercent,
      todayChange
    };
  };

  const getETFStats = () => {
    const totalAmount = portfolioData.etfStocks.reduce((sum, e) => sum + e.amount, 0);
    const totalProfit = portfolioData.etfStocks.reduce((sum, e) => sum + e.profit, 0);
    const profitPercent = (totalProfit / totalAmount) * 100;
    const todayChange = portfolioData.etfStocks.reduce((sum, e) => sum + (e.dailyChange * e.amount / 100), 0) / totalAmount * 100;

    return {
      count: portfolioData.etfStocks.length,
      totalAmount,
      totalProfit,
      profitPercent,
      todayChange
    };
  };

  const getGoldStats = () => {
    return {
      count: 1,
      totalAmount: portfolioData.gold.value,
      totalProfit: portfolioData.gold.profit,
      profitPercent: portfolioData.gold.profitPercent,
      todayChange: 0.05
    };
  };

  const stats = activeTab === 'funds' ? getFundsStats() : activeTab === 'etf' ? getETFStats() : getGoldStats();

  const handleFeedback = (asset: Fund | ETFStock) => {
    setSelectedAsset(asset);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    const operationType = (document.getElementById('operationType') as HTMLSelectElement).value;
    const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);
    const amount = parseFloat((document.getElementById('amount') as HTMLInputElement).value);
    const fee = parseFloat((document.getElementById('fee') as HTMLInputElement).value) || 0;
    const note = (document.getElementById('note') as HTMLTextAreaElement).value;

    try {
      let result;
      if (operationType.includes('买入')) {
        result = await holdingsAPI.addHolding({
          symbol: selectedAsset!.code,
          name: selectedAsset!.name,
          assetType: 'stock',
          quantity: amount,
          averageCost: price
        });
      }

      // 保存操作记录
      const formData = {
        assetCode: selectedAsset!.code,
        assetName: selectedAsset!.name,
        operationType,
        price,
        amount,
        fee,
        note,
        timestamp: Date.now()
      };

      const existingRecords = JSON.parse(localStorage.getItem('operationRecords') || '[]');
      existingRecords.push(formData);
      localStorage.setItem('operationRecords', JSON.stringify(existingRecords));

      setShowFeedbackModal(false);
      setSelectedAsset(null);
      alert('操作反馈已保存');
    } catch (error) {
      console.error('Failed to save operation:', error);
      alert('保存失败，请重试');
    }
  };

  const handleAddPosition = () => {
    // 手动添加持仓
    const code = (document.getElementById('newAssetCode') as HTMLInputElement).value;
    const name = (document.getElementById('newAssetName') as HTMLInputElement).value;
    const amount = parseFloat((document.getElementById('newAssetAmount') as HTMLInputElement).value);
    const cost = parseFloat((document.getElementById('newAssetCost') as HTMLInputElement).value);

    if (code && name && amount && cost) {
      alert(`添加成功: ${name} (${code})`);
      setShowAddModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">🎯 标的详情</h1>
          <p className="text-gray-400 text-sm">持仓管理 · {getRefreshTime()} 刷新</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gold text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold/90 transition-colors"
        >
          ➕ 新增持仓
        </button>
      </div>

      {/* Tab切换 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('funds')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'funds'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            基金 ({portfolioData.funds.length}只)
          </button>
          <button
            onClick={() => setActiveTab('etf')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'etf'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            ETF ({portfolioData.etfStocks.length}只)
          </button>
          <button
            onClick={() => setActiveTab('us')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'us'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            🇺🇸 美股 ({usStocks.length}只)
          </button>
          <button
            onClick={() => setActiveTab('hk')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'hk'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            🇭🇰 港股 ({hkStocks.length}只)
          </button>
          <button
            onClick={() => setActiveTab('gold')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'gold'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            黄金
          </button>
        </div>

        {/* 统计概览 */}
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">持仓数量</div>
              <div className="text-lg font-bold text-white">{stats.count} 只</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">总金额</div>
              <div className="text-lg font-bold text-white">¥{stats.totalAmount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">累计盈亏</div>
              <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-up' : 'text-down'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}{stats.profitPercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">今日盈亏</div>
              <div className={`text-lg font-bold ${stats.todayChange >= 0 ? 'text-up' : 'text-down'}`}>
                {stats.todayChange >= 0 ? '+' : ''}{stats.todayChange.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* 排序按钮 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setSortBy('amount')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'amount'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            按金额
          </button>
          <button
            onClick={() => setSortBy('change')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'change'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            按涨跌
          </button>
          <button
            onClick={() => setSortBy('profit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'profit'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            按盈亏
          </button>
        </div>
      </div>

      {/* 基金列表 */}
      {activeTab === 'funds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFunds.map((fund) => (
            <DashboardCard
              key={fund.code}
              className="cursor-pointer hover:border-gold/50 transition-colors"
              onClick={() => router.push(`/holdings/${fund.code}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white truncate">{fund.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                      fund.profit >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'
                    }`}>
                      {fund.profit >= 0 ? '+' : ''}{fund.profit.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="mr-2">{fund.code}</span>
                    <span>{fund.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${fund.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                    {fund.dailyChange >= 0 ? '+' : ''}{fund.dailyChange.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-gold/20 text-gold">{fund.rating}级</span>
                  <span>{getRiskIcon(fund.riskLevel)}</span>
                </div>
                <div className="text-gray-400">¥{fund.amount.toLocaleString()}</div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <div className="text-xs text-gray-400">{getRefreshTime()} 刷新</div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeedback(fund);
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    📝 反馈
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/holdings/${fund.code}`);
                    }}
                    className="text-xs text-gold hover:underline"
                  >
                    详情 →
                  </button>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {/* ETF列表 */}
      {activeTab === 'etf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedETFs.map((etf) => (
            <DashboardCard
              key={etf.code}
              className="cursor-pointer hover:border-gold/50 transition-colors"
              onClick={() => router.push(`/holdings/${etf.code}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white truncate">{etf.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                      etf.profitPercent >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'
                    }`}>
                      {etf.profitPercent >= 0 ? '+' : ''}{etf.profitPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="mr-2">{etf.code}</span>
                    <span>{etf.exchange.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${etf.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                    {etf.dailyChange >= 0 ? '+' : ''}{etf.dailyChange.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <div className="text-gray-400">持仓</div>
                  <div className="text-white font-medium">{etf.shares.toLocaleString()}股</div>
                </div>
                <div>
                  <div className="text-gray-400">金额</div>
                  <div className="text-white font-medium">¥{etf.amount.toLocaleString()}</div>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <div className="text-xs text-gray-400">{getRefreshTime()} 刷新</div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeedback(etf);
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    📝 反馈
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/holdings/${etf.code}`);
                    }}
                    className="text-xs text-gold hover:underline"
                  >
                    详情 →
                  </button>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {/* 黄金持仓 */}
      {activeTab === 'gold' && (
        <DashboardCard>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-xl font-semibold text-white mb-2">黄金现货</div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-gray-400 mb-1">国际金价</div>
              <div className="text-sm font-medium text-white">${portfolioData.gold.internationalPrice.toFixed(1)}/oz</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">汇率</div>
              <div className="text-sm font-medium text-white">{portfolioData.gold.exchangeRate.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">国内价格</div>
              <div className="text-sm font-medium text-white">¥{portfolioData.gold.yuanPerGram.toFixed(1)}/g</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">刷新时间</div>
              <div className="text-sm font-medium text-gray-400">{getRefreshTime()}</div>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* 美股持仓 (Tiger账户) */}
      {activeTab === 'us' && (
        <div className="space-y-4">
          <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">持仓数量</div>
                <div className="text-lg font-bold text-white">{usStocks.length} 只</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">总市值</div>
                <div className="text-lg font-bold text-white">${usStocks.reduce((s, u) => s + u.marketValue, 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">总盈亏</div>
                <div className={`text-lg font-bold ${usStocks.reduce((s, u) => s + u.pnl, 0) >= 0 ? 'text-up' : 'text-down'}`}>
                  ${usStocks.reduce((s, u) => s + u.pnl, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">账户</div>
                <div className="text-sm font-medium text-gold">🐅 Tiger</div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm text-gray-400">名称</th>
                  <th className="text-left py-3 px-2 text-sm text-gray-400">代码</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">现价</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">成本</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">持仓</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">市值</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">盈亏</th>
                </tr>
              </thead>
              <tbody>
                {usStocks.map((stock) => (
                  <tr key={stock.code} className="border-b border-border hover:bg-white/5">
                    <td className="py-3 px-2 text-sm text-white">{stock.name}</td>
                    <td className="py-3 px-2 text-sm text-gray-400">{stock.code}</td>
                    <td className="py-3 px-2 text-sm text-right text-white">${stock.price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm text-right text-gray-400">${stock.costPrice.toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm text-right text-white">{stock.shares}</td>
                    <td className="py-3 px-2 text-sm text-right text-white">${stock.marketValue.toLocaleString()}</td>
                    <td className={`py-3 px-2 text-sm text-right font-medium ${stock.pnl >= 0 ? 'text-up' : 'text-down'}`}>
                      {stock.pnl >= 0 ? '+' : ''}${stock.pnl.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 港股持仓 (Tiger账户) */}
      {activeTab === 'hk' && (
        <div className="space-y-4">
          <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">持仓数量</div>
                <div className="text-lg font-bold text-white">{hkStocks.length} 只</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">总市值</div>
                <div className="text-lg font-bold text-white">HK${hkStocks.reduce((s, h) => s + h.marketValue, 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">总盈亏</div>
                <div className={`text-lg font-bold ${hkStocks.reduce((s, h) => s + h.pnl, 0) >= 0 ? 'text-up' : 'text-down'}`}>
                  HK${hkStocks.reduce((s, h) => s + h.pnl, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">账户</div>
                <div className="text-sm font-medium text-gold">🐅 Tiger</div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm text-gray-400">名称</th>
                  <th className="text-left py-3 px-2 text-sm text-gray-400">代码</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">现价</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">成本</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">持仓</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">市值</th>
                  <th className="text-right py-3 px-2 text-sm text-gray-400">盈亏</th>
                </tr>
              </thead>
              <tbody>
                {hkStocks.map((stock) => (
                  <tr key={stock.code} className="border-b border-border hover:bg-white/5">
                    <td className="py-3 px-2 text-sm text-white">{stock.name}</td>
                    <td className="py-3 px-2 text-sm text-gray-400">{stock.code}</td>
                    <td className="py-3 px-2 text-sm text-right text-white">HK${stock.price.toFixed(3)}</td>
                    <td className="py-3 px-2 text-sm text-right text-gray-400">HK${stock.costPrice.toFixed(3)}</td>
                    <td className="py-3 px-2 text-sm text-right text-white">{stock.shares}</td>
                    <td className="py-3 px-2 text-sm text-right text-white">HK${stock.marketValue.toLocaleString()}</td>
                    <td className={`py-3 px-2 text-sm text-right font-medium ${stock.pnl >= 0 ? 'text-up' : 'text-down'}`}>
                      {stock.pnl >= 0 ? '+' : ''}HK${stock.pnl.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 反馈模态框 */}
      {showFeedbackModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">📝 操作反馈 - {selectedAsset.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">操作类型</label>
                <select id="operationType" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white">
                  <option>买入建仓</option>
                  <option>卖出减仓</option>
                  <option>做T买入</option>
                  <option>做T卖出</option>
                  <option>定投调整</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">成交价格</label>
                <input id="price" type="number" step="0.001" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="¥0.000" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">成交数量/金额</label>
                <input id="amount" type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="数量或金额" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">手续费（可选）</label>
                <input id="fee" type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="¥0.00" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">备注（可选）</label>
                <textarea id="note" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" rows={3} placeholder="操作备注..." />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedAsset(null);
                  }}
                  className="flex-1 px-4 py-2 bg-background text-white rounded-lg hover:bg-white/10"
                >
                  取消
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="flex-1 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold/90"
                >
                  提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新增持仓模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">➕ 新增持仓</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">基金代码/名称</label>
                <input id="newAssetCode" type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white mb-2" placeholder="代码" />
                <input id="newAssetName" type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="名称" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">持仓金额</label>
                <input id="newAssetAmount" type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="¥0.00" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">成本价</label>
                <input id="newAssetCost" type="number" step="0.0001" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="¥0.0000" />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <div className="text-sm text-gray-400 mb-3">图片识别（即将上线）</div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-sm text-gray-400">拖拽或点击上传持仓截图</div>
                  <div className="text-xs text-gold mt-2">🚧 AI自动识别功能即将上线</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-background text-white rounded-lg hover:bg-white/10"
                >
                  取消
                </button>
                <button
                  onClick={handleAddPosition}
                  className="flex-1 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold/90"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
