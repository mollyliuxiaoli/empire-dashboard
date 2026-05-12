/**
 * Portfolio Context - v4.0
 * React Context + Hook for portfolio state management
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { portfolioReducer, PortfolioState, PortfolioAction } from './portfolio-reducer';
import { loadPortfolio, savePortfolio } from './localStorage';
import { initialPortfolioData } from './initial-data';

interface PortfolioContextValue {
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialPortfolioData);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = loadPortfolio();
    if (savedData) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: savedData });
    }
  }, []);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      savePortfolio(state);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
