"use client";

import { useState, useMemo } from 'react';
import { calculateT0Profit } from '@/lib/portfolio-calculations';

export default function T0Calculator() {
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [assetType, setAssetType] = useState<'etf' | 'stock' | 'fund'>('etf');

  // Calculate results using the proper function
  const result = useMemo(() => {
    if (!buyPrice || !sellPrice || !quantity) return null;
    return calculateT0Profit(
      parseFloat(buyPrice),
      parseFloat(sellPrice),
      parseInt(quantity),
      assetType,
      0.00025 // 万2.5佣金率
    );
  }, [buyPrice, sellPrice, quantity, assetType]);

  const takeProfitPrice = buyPrice ? parseFloat(buyPrice) * 1.02 : 0;
  const stopLossPrice = buyPrice ? parseFloat(buyPrice) * 0.985 : 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">资产类型</label>
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value as 'etf' | 'stock' | 'fund')}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none"
        >
          <option value="etf">ETF</option>
          <option value="stock">股票</option>
          <option value="fund">基金（场外）</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">买入价 (元)</label>
          <input
            type="number"
            step="0.001"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none"
            placeholder="0.000"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">卖出价 (元)</label>
          <input
            type="number"
            step="0.001"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none"
            placeholder="0.000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">数量 (股/份)</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none"
          placeholder="0"
        />
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-400 mb-1">毛收益</div>
              <div className={`text-xl font-semibold ${result.grossProfit >= 0 ? 'text-up' : 'text-down'}`}>
                {result.grossProfit.toFixed(2)} 元
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-400 mb-1">总费用</div>
              <div className="text-xl font-semibold text-gray-300">{result.totalFees.toFixed(2)} 元</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-400 mb-1">净收益</div>
              <div className={`text-xl font-semibold ${result.netProfit >= 0 ? 'text-up' : 'text-down'}`}>
                {result.netProfit.toFixed(2)} 元
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-400 mb-1">收益率</div>
              <div className={`text-xl font-semibold ${result.profitPercent >= 0 ? 'text-up' : 'text-down'}`}>
                {result.profitPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="bg-background/30 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">费用明细</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">买入佣金：</span>
              <span className="text-white">{result.buyCommission.toFixed(2)} 元</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">卖出佣金：</span>
              <span className="text-white">{result.sellCommission.toFixed(2)} 元</span>
            </div>
            {result.stampDuty > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">印花税：</span>
                <span className="text-white">{result.stampDuty.toFixed(2)} 元</span>
              </div>
            )}
            {result.transferFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">过户费：</span>
                <span className="text-white">{result.transferFee.toFixed(2)} 元</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-400 mb-1">盈亏平衡价</div>
              <div className="text-xl font-semibold text-gold">{result.breakEvenPrice.toFixed(3)} 元</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-400 mb-1">建议止盈价 (+2%)</div>
              <div className="text-xl font-semibold text-up">{takeProfitPrice.toFixed(3)} 元</div>
            </div>
          </div>
        </>
      )}

      <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
        <h4 className="text-gold font-semibold mb-2">⚠️ 交易纪律</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 单次做T金额 ≤ 5,000元</li>
          <li>• T+0标的止损 -1.5%</li>
          <li>• T+0标的止盈 +2%</li>
          <li>• 严格纪律，切勿贪心</li>
          {assetType === 'etf' && <li>• ETF免印花税，适合频繁交易</li>}
          {assetType === 'stock' && <li>• 股票有印花税（卖出0.05%），成本更高</li>}
        </ul>
      </div>
    </div>
  );
}
