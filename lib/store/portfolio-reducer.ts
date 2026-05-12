/**
 * Portfolio Reducer - v4.0
 * Pure reducer function for portfolio state management
 */

import { Transaction } from '@/types/transaction';
import { Holding, GoldHolding, T0Target, PendingAction, Macro } from '@/types/portfolio';
import { Quote } from '@/types/quote';
import { buildHoldingsFromTransactions } from '@/lib/calculator';

export interface PortfolioState {
  transactions: Transaction[];
  holdings: Holding[];
  gold: GoldHolding;
  cash: number;
  t0Targets: T0Target[];
  pendingActions: PendingAction[];
  macro: Macro;
}

export type PortfolioAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_QUOTE'; payload: { code: string; quote: Quote } }
  | { type: 'UPDATE_STRATEGY'; payload: { code: string; strategy: Partial<Holding> } }
  | { type: 'REMOVE_HOLDING'; payload: string }
  | { type: 'IMPORT_DATA'; payload: Partial<PortfolioState> }
  | { type: 'LOAD_FROM_STORAGE'; payload: PortfolioState }
  | { type: 'UPDATE_CASH'; payload: number }
  | { type: 'UPDATE_GOLD'; payload: GoldHolding }
  | { type: 'UPDATE_MACRO'; payload: Macro };

const initialState: PortfolioState = {
  transactions: [],
  holdings: [],
  gold: {
    productType: 'physical_gold',
    units: 0,
    avgCostPrice: 0,
    bookCostAmount: 0,
    quote: {
      price: 0,
      prevClose: 0,
      change: 0,
      changeAmount: 0,
      quoteType: 'gold_spot',
      asOf: new Date().toISOString(),
      source: 'mock',
      delayHours: 0,
      staleness: 'unknown',
      isMock: true,
    },
  },
  cash: 0,
  t0Targets: [],
  pendingActions: [],
  macro: {
    usStocks: {
      dowJones: { value: 0, change: 0 },
      nasdaq: { value: 0, change: 0 },
      sp500: { value: 0, change: 0 },
      note: '',
    },
    commodities: {
      gold: { price: 0, change: 0, signal: '' },
      silver: { price: 0, change: 0, signal: '' },
      copper: { price: 0, change: 0, signal: '' },
      oil: { price: 0, change: 0, signal: '' },
    },
    isMock: true,
    asOf: new Date().toISOString(),
    source: 'mock',
  },
};

export function portfolioReducer(
  state: PortfolioState = initialState,
  action: PortfolioAction
): PortfolioState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const newTransactions = [...state.transactions, action.payload];
      const positions = buildHoldingsFromTransactions(newTransactions);

      // Update holdings based on new positions
      const updatedHoldings = state.holdings.map(holding => {
        const position = positions.get(holding.code);
        if (position) {
          return {
            ...holding,
            units: position.units,
            avgCostPrice: position.units > 0 ? position.totalCost / position.units : 0,
            bookCostAmount: position.bookCostAmount,
          };
        }
        return holding;
      });

      return {
        ...state,
        transactions: newTransactions,
        holdings: updatedHoldings,
      };
    }

    case 'UPDATE_QUOTE': {
      const { code, quote } = action.payload;

      const updatedHoldings = state.holdings.map(holding =>
        holding.code === code
          ? { ...holding, quote }
          : holding
      );

      const updatedT0Targets = state.t0Targets.map(target =>
        target.code === code
          ? { ...target, quote }
          : target
      );

      return {
        ...state,
        holdings: updatedHoldings,
        t0Targets: updatedT0Targets,
      };
    }

    case 'UPDATE_STRATEGY': {
      const { code, strategy } = action.payload;

      const updatedHoldings = state.holdings.map(holding =>
        holding.code === code
          ? { ...holding, ...strategy }
          : holding
      );

      return {
        ...state,
        holdings: updatedHoldings,
      };
    }

    case 'REMOVE_HOLDING': {
      const code = action.payload;
      return {
        ...state,
        holdings: state.holdings.filter(h => h.code !== code),
      };
    }

    case 'IMPORT_DATA': {
      return {
        ...state,
        ...action.payload,
      };
    }

    case 'LOAD_FROM_STORAGE': {
      return action.payload;
    }

    case 'UPDATE_CASH': {
      return {
        ...state,
        cash: action.payload,
      };
    }

    case 'UPDATE_GOLD': {
      return {
        ...state,
        gold: action.payload,
      };
    }

    case 'UPDATE_MACRO': {
      return {
        ...state,
        macro: action.payload,
      };
    }

    default:
      return state;
  }
}
