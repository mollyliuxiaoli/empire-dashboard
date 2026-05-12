"use client";

import { useState, useEffect } from 'react';

export default function T0Calculator() {
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const takeProfitPrice = buyPrice ? parseFloat(buyPrice) * 1.02 : 0;
  const stopLossPrice = buyPrice ? parseFloat(buyPrice) * 0.985 : 0;
  const expectedProfit = buyPrice && quantity ? (parseFloat(buyPrice) * 0.02 - parseFloat(buyPrice) * 0.015) * parseFloat(quantity) : 0;
  const commission = buyPrice && quantity ? parseFloat(buyPrice) * parseFloat(quantity) * 0.00015 * 2 : 0; // 万1.5，买卖各一次

  return (
    <div className="space-y-4">
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
          <label className="block text-sm text-gray-400 mb-1">数量 (股/份)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-gold focus:outline-none"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background/50 rounded-lg p-3 border border-border">
          <div className="text-xs text-gray-400 mb-1">止盈价 (+2%)</div>
          <div className="text-xl font-semibold text-up">{takeProfitPrice.toFixed(3)}</div>
        </div>
        <div className="bg-background/50 rounded-lg p-3 border border-border">
          <div className="text-xs text-gray-400 mb-1">止损价 (-1.5%)</div>
          <div className="text-xl font-semibold text-down">{stopLossPrice.toFixed(3)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background/50 rounded-lg p-3 border border-border">
          <div className="text-xs text-gray-400 mb-1">预期收益</div>
          <div className="text-xl font-semibold text-gold">{expectedProfit.toFixed(2)} 元</div>
        </div>
        <div className="bg-background/50 rounded-lg p-3 border border-border">
          <div className="text-xs text-gray-400 mb-1">手续费 (万1.5×2)</div>
          <div className="text-xl font-semibold text-gray-300">{commission.toFixed(2)} 元</div>
        </div>
      </div>

      <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
        <h4 className="text-gold font-semibold mb-2">⚠️ 纪律提示</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 单次做T金额 ≤ 5,000元</li>
          <li>• T+0标的止损 -1.5%</li>
          <li>• T+0标的止盈 +2%</li>
          <li>• 严格纪律，切勿贪心</li>
        </ul>
      </div>
    </div>
  );
}
