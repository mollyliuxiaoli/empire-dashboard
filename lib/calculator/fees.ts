/**
 * Fee Calculator - v4.0
 * Calculate T+0 trading costs and break-even prices
 */

export interface T0CalculationResult {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  buyAmount: number;
  sellAmount: number;
  buyCommission: number;
  sellCommission: number;
  stampDuty: number;
  transferFee: number;
  totalFees: number;
  grossProfit: number;
  netProfit: number;
  profitPercent: number;
  breakEvenPrice: number;
  assetType: 'etf' | 'stock' | 'fund';
}

/**
 * Calculate T+0 trading profit after fees
 */
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
    buyCommission,
    sellCommission,
    stampDuty,
    transferFee,
    totalFees,
    grossProfit,
    netProfit,
    profitPercent,
    breakEvenPrice,
    assetType,
  };
}

/**
 * Calculate break-even price for T+0 trading
 * More accurate calculation using iterative method
 */
export function calculateBreakEvenPrice(
  buyPrice: number,
  quantity: number,
  assetType: 'etf' | 'stock' | 'fund',
  commissionRate: number = 0.00025
): number {
  const buyAmount = buyPrice * quantity;
  const buyCommission = Math.max(buyAmount * commissionRate, 5);

  // For stocks, we have stampDuty and transferFee on sell
  // For ETF, only transferFee
  // For funds, no additional fees

  let sellPrice = buyPrice;
  let iteration = 0;
  const maxIterations = 10;
  const tolerance = 0.001;

  while (iteration < maxIterations) {
    const sellAmount = sellPrice * quantity;
    const sellCommission = Math.max(sellAmount * commissionRate, 5);

    let stampDuty = 0;
    let transferFee = 0;

    if (assetType === 'stock') {
      stampDuty = sellAmount * 0.0005;
      transferFee = sellAmount * 0.00001;
    } else if (assetType === 'etf') {
      transferFee = sellAmount * 0.00001;
    }

    const totalFees = buyCommission + sellCommission + stampDuty + transferFee;
    const grossProfit = sellAmount - buyAmount;
    const netProfit = grossProfit - totalFees;

    if (Math.abs(netProfit) < tolerance) {
      break;
    }

    // Adjust sell price based on netProfit
    sellPrice = buyPrice + (totalFees / quantity);
    iteration++;
  }

  return sellPrice;
}

/**
 * Calculate minimum spread needed for profitable T+0 trade
 */
export function calculateMinSpread(
  price: number,
  quantity: number,
  assetType: 'etf' | 'stock' | 'fund',
  commissionRate: number = 0.00025
): number {
  const breakEvenPrice = calculateBreakEvenPrice(price, quantity, assetType, commissionRate);
  return breakEvenPrice - price;
}
