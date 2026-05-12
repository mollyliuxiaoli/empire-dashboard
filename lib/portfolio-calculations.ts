/**
 * Portfolio Calculation Functions - v3.0
 * Centralized calculation logic for portfolio data
 */

import { Holding, PortfolioSummary, Gold } from '@/types/portfolio';

/**
 * Calculate portfolio summary from holdings and cash balance
 */
export function calculatePortfolioSummary(
  holdings: Holding[],
  gold: Gold,
  cashBalance: number
): PortfolioSummary {
  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0) + gold.value;
  const totalCost = holdings.reduce((sum, h) => sum + h.costAmount, 0) + (gold.holding * gold.yuanPerGram);
  const todayChangeAmount = holdings.reduce((sum, h) => sum + h.dailyChangeAmount, 0);

  const totalAssets = totalMarketValue + cashBalance;
  const totalProfit = totalMarketValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const todayChangePercent = totalAssets > 0 ? (todayChangeAmount / totalAssets) * 100 : 0;

  return {
    totalAssets,
    cashBalance,
    todayChange: todayChangeAmount,
    todayChangePercent,
    totalCost,
    totalMarketValue,
    totalProfit,
    totalProfitPercent,
    asOf: new Date().toISOString()
  };
}

/**
 * Calculate statistics for a specific asset category
 */
export function calculateHoldingStats(
  holdings: Holding[],
  category: 'fund' | 'etf' | 'gold' | 'hk_stock' | 'us_stock'
): {
  count: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  todayChange: number;
} {
  const categoryHoldings = holdings.filter(h => h.assetCategory === category);

  const totalValue = categoryHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCost = categoryHoldings.reduce((sum, h) => sum + h.costAmount, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const todayChange = categoryHoldings.reduce((sum, h) => sum + h.dailyChangeAmount, 0);

  return {
    count: categoryHoldings.length,
    totalValue,
    totalCost,
    totalProfit,
    totalProfitPercent,
    todayChange
  };
}

/**
 * Calculate T0 trading signal
 */
export function calculateT0Signal(target: {
  price: number;
  dailyChange: number;
  amplitude: number;
}): {
  score: number;
  status: string;
  signal: string;
} {
  let score = 0;
  const { price, dailyChange, amplitude } = target;

  // Score based on amplitude (higher is better for T0)
  if (amplitude > 2) score += 4;
  else if (amplitude > 1.5) score += 3;
  else if (amplitude > 1) score += 2;
  else if (amplitude > 0.5) score += 1;

  // Score based on daily change (moderate changes are better)
  const absChange = Math.abs(dailyChange);
  if (absChange > 1 && absChange < 3) score += 2;
  else if (absChange >= 0.5 && absChange <= 1) score += 1;

  let status = '观望';
  let signal = '波动较小，暂不适合做T';

  if (score >= 5) {
    status = '强烈关注';
    signal = '振幅很大，适合做T';
  } else if (score >= 3) {
    status = '关注';
    signal = '振幅较大，可考虑做T';
  } else if (score >= 2) {
    status = '一般';
    signal = '有一定波动，可谨慎做T';
  }

  return { score, status, signal };
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, decimals: number = 0): string {
  if (Math.abs(amount) >= 10000) {
    return `${(amount / 10000).toFixed(decimals)}万`;
  }
  return amount.toFixed(decimals);
}

/**
 * Format percentage for display
 */
export function formatPercent(percent: number, sign: boolean = true): string {
  const formatted = percent.toFixed(2);
  if (sign && percent > 0) return `+${formatted}%`;
  return `${formatted}%`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Calculate T0 trading profit with fees
 */
export interface T0CalculationResult {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  buyAmount: number;
  sellAmount: number;
  grossProfit: number;
  buyCommission: number;
  sellCommission: number;
  stampDuty: number;
  transferFee: number;
  totalFees: number;
  netProfit: number;
  breakEvenPrice: number;
  profitPercent: number;
}

export function calculateT0Profit(
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  assetType: 'etf' | 'stock' | 'fund',
  commissionRate: number = 0.00025 // 默认万2.5
): T0CalculationResult {
  const buyAmount = buyPrice * quantity;
  const sellAmount = sellPrice * quantity;

  // Buy side fees
  const buyCommission = Math.max(buyAmount * commissionRate, 5); // 最低5元

  // Sell side fees
  const sellCommission = Math.max(sellAmount * commissionRate, 5); // 最低5元
  let stampDuty = 0;
  let transferFee = 0;

  if (assetType === 'stock') {
    stampDuty = sellAmount * 0.0005; // 印花税 0.05%（仅卖出）
    transferFee = sellAmount * 0.00001; // 过户费 0.001%
  } else if (assetType === 'etf') {
    // ETF免印花税，有过户费
    transferFee = sellAmount * 0.00001; // 过户费 0.001%
  }
  // 基金（场外）没有这些费用

  const totalFees = buyCommission + sellCommission + stampDuty + transferFee;
  const grossProfit = sellAmount - buyAmount;
  const netProfit = grossProfit - totalFees;

  // Break-even price: sellPrice such that netProfit = 0
  // sellPrice * quantity - buyPrice * quantity - totalFees = 0
  // sellPrice = (buyPrice * quantity + totalFees based on sellPrice) / quantity
  // Simplified approximation:
  const breakEvenPrice = buyPrice + (totalFees / quantity) * 0.5; // Rough estimate

  const profitPercent = buyAmount > 0 ? (netProfit / buyAmount) * 100 : 0;

  return {
    buyPrice,
    sellPrice,
    quantity,
    buyAmount,
    sellAmount,
    grossProfit,
    buyCommission,
    sellCommission,
    stampDuty,
    transferFee,
    totalFees,
    netProfit,
    breakEvenPrice,
    profitPercent
  };
}
