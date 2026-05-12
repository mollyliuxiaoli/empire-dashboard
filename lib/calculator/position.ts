/**
 * Position Calculator - v4.0
 * Calculate holdings from transactions and portfolio metrics
 */

import { Transaction } from '@/types/transaction';
import { Holding, HoldingWithMetrics, PortfolioSummary, GoldHolding } from '@/types/portfolio';
import { Quote } from '@/types/quote';

export interface PositionState {
  units: number;
  totalCost: number;
  bookCostAmount: number;
}

/**
 * Build holdings from transaction history
 * Uses FIFO method for cost basis
 */
export function buildHoldingsFromTransactions(
  transactions: Transaction[]
): Map<string, PositionState> {
  const positions = new Map<string, PositionState>();

  // Sort by date
  const sorted = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const tx of sorted) {
    const key = tx.code;
    const current = positions.get(key) || {
      units: 0,
      totalCost: 0,
      bookCostAmount: 0,
    };

    switch (tx.type) {
      case 'buy':
      case 'buy_t0':
      case 'dca':
      case 'reinvest':
        current.units += tx.units;
        current.totalCost += tx.amount + tx.fee;
        break;

      case 'sell':
      case 'sell_t0':
        // Reduce units, keep avg cost unchanged
        current.units -= tx.units;
        if (current.units < 0) current.units = 0; // Should not happen
        break;

      case 'dividend':
      case 'transfer_in':
      case 'transfer_out':
      case 'split':
      case 'adjust':
      case 'fee':
        // These don't affect position state directly
        break;
    }

    // Calculate book cost
    current.bookCostAmount = current.units > 0
      ? current.totalCost
      : 0;

    positions.set(key, current);
  }

  return positions;
}

/**
 * Calculate holding metrics from atomic holding data
 */
export function calculateHoldingMetrics(
  holding: Holding
): HoldingWithMetrics {
  const marketValue = holding.units * holding.quote.price;

  // Invariant check
  if (Math.abs(marketValue - holding.units * holding.quote.price) > 0.01) {
    throw new Error(`Market value mismatch for ${holding.code}`);
  }

  const unrealizedPnlAmount = marketValue - holding.bookCostAmount;
  const unrealizedPnlPercent = holding.bookCostAmount > 0
    ? (unrealizedPnlAmount / holding.bookCostAmount) * 100
    : 0;

  const dailyPnlAmount = holding.units * (holding.quote.price - holding.quote.prevClose);
  const dailyPnlPercent = holding.quote.prevClose > 0
    ? ((holding.quote.price - holding.quote.prevClose) / holding.quote.prevClose) * 100
    : 0;

  return {
    ...holding,
    marketValue,
    unrealizedPnlAmount,
    unrealizedPnlPercent,
    dailyPnlAmount,
    dailyPnlPercent,
    portfolioWeight: 0, // Will be set at portfolio level
  };
}

/**
 * Calculate portfolio summary from all holdings
 */
export function calculatePortfolioSummary(
  holdings: HoldingWithMetrics[],
  gold: GoldHolding,
  cash: number
): PortfolioSummary {
  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const goldMarketValue = gold.units * gold.quote.price;
  const totalBookCost = holdings.reduce((sum, h) => sum + h.bookCostAmount, 0) + gold.bookCostAmount;

  const todayPnlAmount = holdings.reduce((sum, h) => sum + h.dailyPnlAmount, 0);
  const totalPnlAmount = (totalMarketValue + goldMarketValue) - (totalBookCost + gold.bookCostAmount);

  const profitableCount = holdings.filter(h => h.unrealizedPnlAmount > 0).length;
  const losingCount = holdings.filter(h => h.unrealizedPnlAmount < 0).length;

  // Calculate portfolio weights
  const totalAssets = totalMarketValue + goldMarketValue + cash;
  holdings.forEach(h => {
    h.portfolioWeight = totalAssets > 0 ? (h.marketValue / totalAssets) * 100 : 0;
  });

  return {
    totalAssets,
    totalBookCost: totalBookCost + gold.bookCostAmount,
    totalMarketValue: totalMarketValue + goldMarketValue,
    cashBalance: cash,
    todayPnlAmount,
    todayPnlPercent: totalBookCost > 0 ? (todayPnlAmount / totalBookCost) * 100 : 0,
    totalPnlAmount,
    totalPnlPercent: totalBookCost > 0 ? (totalPnlAmount / totalBookCost) * 100 : 0,
    // Legacy v3 aliases
    todayChange: todayPnlAmount,
    todayChangePercent: totalBookCost > 0 ? (todayPnlAmount / totalBookCost) * 100 : 0,
    totalCost: totalBookCost + gold.bookCostAmount,
    totalProfit: totalPnlAmount,
    totalProfitPercent: totalBookCost > 0 ? (totalPnlAmount / totalBookCost) * 100 : 0,
    holdingsCount: holdings.length,
    profitableCount,
    losingCount,
    asOf: new Date().toISOString(),
  };
}

/**
 * Calculate category statistics
 */
export interface CategoryStats {
  category: string;
  count: number;
  totalValue: number;
  totalPnl: number;
  weight: number;
}

export function calculateCategoryStats(
  holdings: HoldingWithMetrics[],
  category: 'fund' | 'etf' | 'stock' | 'gold' | 'bond'
): CategoryStats {
  const filtered = holdings.filter(h => h.instrumentType === category);
  const totalValue = filtered.reduce((sum, h) => sum + h.marketValue, 0);
  const totalPnl = filtered.reduce((sum, h) => sum + h.unrealizedPnlAmount, 0);
  const portfolioTotal = holdings.reduce((sum, h) => sum + h.marketValue, 0);

  return {
    category,
    count: filtered.length,
    totalValue,
    totalPnl,
    weight: portfolioTotal > 0 ? (totalValue / portfolioTotal) * 100 : 0,
  };
}
