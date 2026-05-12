/**
 * Validation Utilities - v4.0
 * Validate portfolio data consistency and integrity
 */

import { Holding, PortfolioSummary, GoldHolding } from '@/types/portfolio';
import { Transaction } from '@/types/transaction';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validate holding consistency
 * Checks that calculated fields match their formulas
 */
export function validateHoldingConsistency(holding: Holding): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check book cost calculation
  const expectedBookCost = holding.units * holding.avgCostPrice;
  if (Math.abs(holding.bookCostAmount - expectedBookCost) > 0.01) {
    errors.push({
      field: 'bookCostAmount',
      message: `Book cost mismatch: expected ${expectedBookCost.toFixed(2)}, got ${holding.bookCostAmount.toFixed(2)}`,
      severity: 'error',
    });
  }

  // Check positive units
  if (holding.units < 0) {
    errors.push({
      field: 'units',
      message: `Units cannot be negative: ${holding.units}`,
      severity: 'error',
    });
  }

  // Check positive cost
  if (holding.avgCostPrice < 0) {
    errors.push({
      field: 'avgCostPrice',
      message: `Average cost price cannot be negative: ${holding.avgCostPrice}`,
      severity: 'error',
    });
  }

  // Check quote data
  if (holding.quote.price < 0) {
    errors.push({
      field: 'quote.price',
      message: `Quote price cannot be negative: ${holding.quote.price}`,
      severity: 'error',
    });
  }

  // Check price change consistency
  const expectedChange = holding.quote.prevClose > 0
    ? ((holding.quote.price - holding.quote.prevClose) / holding.quote.prevClose) * 100
    : 0;
  if (Math.abs(holding.quote.change - expectedChange) > 0.01) {
    errors.push({
      field: 'quote.change',
      message: `Change percent mismatch: expected ${expectedChange.toFixed(2)}%, got ${holding.quote.change.toFixed(2)}%`,
      severity: 'warning',
    });
  }

  // Check valid rating
  if (!['A', 'B', 'C', 'D'].includes(holding.rating)) {
    errors.push({
      field: 'rating',
      message: `Invalid rating: ${holding.rating}`,
      severity: 'error',
    });
  }

  // Check valid risk level
  if (!['green', 'yellow', 'red'].includes(holding.riskLevel)) {
    errors.push({
      field: 'riskLevel',
      message: `Invalid risk level: ${holding.riskLevel}`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validate transaction data
 */
export function validateTransactions(transactions: Transaction[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const tx of transactions) {
    // Check required fields
    if (!tx.id) {
      errors.push({
        field: 'transaction.id',
        message: `Transaction missing ID`,
        severity: 'error',
      });
    }

    if (!tx.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
      errors.push({
        field: 'transaction.date',
        message: `Invalid date format: ${tx.date} (expected YYYY-MM-DD)`,
        severity: 'error',
      });
    }

    if (!tx.code) {
      errors.push({
        field: 'transaction.code',
        message: `Transaction missing code`,
        severity: 'error',
      });
    }

    // Check positive values
    if (tx.units < 0) {
      errors.push({
        field: 'transaction.units',
        message: `Transaction units cannot be negative: ${tx.units}`,
        severity: 'error',
      });
    }

    if (tx.price < 0) {
      errors.push({
        field: 'transaction.price',
        message: `Transaction price cannot be negative: ${tx.price}`,
        severity: 'error',
      });
    }

    if (tx.amount < 0) {
      errors.push({
        field: 'transaction.amount',
        message: `Transaction amount cannot be negative: ${tx.amount}`,
        severity: 'error',
      });
    }

    if (tx.fee < 0) {
      errors.push({
        field: 'transaction.fee',
        message: `Transaction fee cannot be negative: ${tx.fee}`,
        severity: 'error',
      });
    }

    // Check amount calculation
    const expectedAmount = tx.units * tx.price;
    if (Math.abs(tx.amount - expectedAmount) > 0.01) {
      errors.push({
        field: 'transaction.amount',
        message: `Amount mismatch: expected ${expectedAmount.toFixed(2)}, got ${tx.amount.toFixed(2)}`,
        severity: 'warning',
      });
    }

    // Check valid type
    const validTypes = ['buy', 'sell', 'buy_t0', 'sell_t0', 'dividend', 'reinvest', 'fee', 'dca', 'transfer_in', 'transfer_out', 'split', 'adjust'];
    if (!validTypes.includes(tx.type)) {
      errors.push({
        field: 'transaction.type',
        message: `Invalid transaction type: ${tx.type}`,
        severity: 'error',
      });
    }
  }

  return errors;
}

/**
 * Validate portfolio summary balance
 */
export function validatePortfolioBalance(summary: PortfolioSummary): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check total assets calculation
  const expectedTotalAssets = summary.totalMarketValue + summary.cashBalance;
  if (Math.abs(summary.totalAssets - expectedTotalAssets) > 0.01) {
    errors.push({
      field: 'totalAssets',
      message: `Total assets mismatch: expected ${expectedTotalAssets.toFixed(2)}, got ${summary.totalAssets.toFixed(2)}`,
      severity: 'error',
    });
  }

  // Check positive values
  if (summary.totalAssets < 0) {
    errors.push({
      field: 'totalAssets',
      message: `Total assets cannot be negative: ${summary.totalAssets}`,
      severity: 'error',
    });
  }

  if (summary.cashBalance < 0) {
    errors.push({
      field: 'cashBalance',
      message: `Cash balance cannot be negative: ${summary.cashBalance}`,
      severity: 'error',
    });
  }

  // Check holdings count consistency
  if (summary.profitableCount + summary.losingCount > summary.holdingsCount) {
    errors.push({
      field: 'holdingsCount',
      message: `Holdings count inconsistency: profitable (${summary.profitableCount}) + losing (${summary.losingCount}) > total (${summary.holdingsCount})`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validate gold holding
 */
export function validateGoldHolding(gold: GoldHolding): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check positive values
  if (gold.units < 0) {
    errors.push({
      field: 'gold.units',
      message: `Gold units cannot be negative: ${gold.units}`,
      severity: 'error',
    });
  }

  if (gold.avgCostPrice < 0) {
    errors.push({
      field: 'gold.avgCostPrice',
      message: `Gold average cost price cannot be negative: ${gold.avgCostPrice}`,
      severity: 'error',
    });
  }

  // Check book cost calculation
  const expectedBookCost = gold.units * gold.avgCostPrice;
  if (Math.abs(gold.bookCostAmount - expectedBookCost) > 0.01) {
    errors.push({
      field: 'gold.bookCostAmount',
      message: `Gold book cost mismatch: expected ${expectedBookCost.toFixed(2)}, got ${gold.bookCostAmount.toFixed(2)}`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Run all validations and return combined results
 */
export function validatePortfolio(
  holdings: Holding[],
  transactions: Transaction[],
  summary: PortfolioSummary,
  gold: GoldHolding
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate holdings
  for (const holding of holdings) {
    errors.push(...validateHoldingConsistency(holding));
  }

  // Validate transactions
  errors.push(...validateTransactions(transactions));

  // Validate summary
  errors.push(...validatePortfolioBalance(summary));

  // Validate gold
  errors.push(...validateGoldHolding(gold));

  return errors;
}
