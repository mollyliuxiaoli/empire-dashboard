/**
 * P&L Calculator - v4.0
 * Calculate daily and unrealized P&L
 */

import { Holding } from '@/types/portfolio';
import { Transaction } from '@/types/transaction';

/**
 * Calculate daily P&L for a holding
 * Returns the P&L amount based on price change from previous close
 */
export function calculateDailyPnl(holding: Holding): number {
  return holding.units * (holding.quote.price - holding.quote.prevClose);
}

/**
 * Calculate daily P&L percentage
 */
export function calculateDailyPnlPercent(holding: Holding): number {
  if (holding.quote.prevClose === 0) return 0;
  const priceChange = holding.quote.price - holding.quote.prevClose;
  return (priceChange / holding.quote.prevClose) * 100;
}

/**
 * Calculate unrealized P&L for a holding
 * Returns the difference between current market value and book cost
 */
export function calculateUnrealizedPnl(holding: Holding): number {
  const marketValue = holding.units * holding.quote.price;
  return marketValue - holding.bookCostAmount;
}

/**
 * Calculate unrealized P&L percentage
 */
export function calculateUnrealizedPnlPercent(holding: Holding): number {
  if (holding.bookCostAmount === 0) return 0;
  const marketValue = holding.units * holding.quote.price;
  return ((marketValue - holding.bookCostAmount) / holding.bookCostAmount) * 100;
}

/**
 * Calculate realized P&L from completed transactions
 * Sums up all sell proceeds minus cost basis
 */
export function calculateRealizedPnl(transactions: Transaction[]): number {
  let realizedPnl = 0;
  const costBasis = new Map<string, number>();

  // Sort by date
  const sorted = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const tx of sorted) {
    const key = tx.code;
    const currentCost = costBasis.get(key) || 0;

    switch (tx.type) {
      case 'buy':
      case 'buy_t0':
      case 'dca':
      case 'reinvest':
        costBasis.set(key, currentCost + tx.amount + tx.fee);
        break;

      case 'sell':
      case 'sell_t0':
        // Calculate cost basis for sold units
        const avgCost = currentCost / (currentCost / (tx.price * tx.units)); // Approximate
        const soldCost = avgCost * tx.units;
        const proceeds = tx.amount - tx.fee;
        realizedPnl += proceeds - soldCost;
        costBasis.set(key, currentCost - soldCost);
        break;

      case 'dividend':
        realizedPnl += tx.amount;
        break;

      case 'fee':
        realizedPnl -= tx.amount;
        break;

      case 'transfer_in':
      case 'transfer_out':
      case 'split':
      case 'adjust':
        // These don't affect realized P&L directly
        break;
    }
  }

  return realizedPnl;
}

/**
 * Calculate total return for a holding
 * Includes unrealized P&L, realized P&L, and dividends
 */
export function calculateTotalReturn(
  holding: Holding,
  transactions: Transaction[]
): number {
  const unrealized = calculateUnrealizedPnl(holding);
  const realized = transactions
    .filter(tx => tx.code === holding.code && (tx.type === 'sell' || tx.type === 'sell_t0' || tx.type === 'dividend'))
    .reduce((sum, tx) => {
      if (tx.type === 'dividend') return sum + tx.amount;
      return sum + (tx.amount - tx.fee);
    }, 0);

  return unrealized + realized;
}
