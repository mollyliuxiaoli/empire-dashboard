/**
 * LocalStorage Adapter - v4.0
 * Save/load portfolio data with version migration
 */

import { PortfolioState } from './portfolio-reducer';

const STORAGE_KEY = 'investscope_portfolio';
const STORAGE_VERSION = 4;

/**
 * Load portfolio from localStorage
 */
export function loadPortfolio(): PortfolioState | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);

    // Version migration
    if (parsed.version !== STORAGE_VERSION) {
      return migratePortfolio(parsed);
    }

    return parsed.state;
  } catch (error) {
    console.error('Failed to load portfolio from localStorage:', error);
    return null;
  }
}

/**
 * Save portfolio to localStorage
 */
export function savePortfolio(state: PortfolioState): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      version: STORAGE_VERSION,
      state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save portfolio to localStorage:', error);
  }
}

/**
 * Migrate portfolio from older versions
 */
function migratePortfolio(data: any): PortfolioState | null {
  // Handle migrations from v1, v2, v3 to v4
  // This is a placeholder - implement based on actual schema changes

  if (!data.state) {
    console.warn('Invalid portfolio data structure');
    return null;
  }

  // For now, just return the state as-is if it exists
  // In production, you'd want to transform the data structure
  return data.state as PortfolioState;
}

/**
 * Clear portfolio from localStorage
 */
export function clearPortfolio(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear portfolio from localStorage:', error);
  }
}

/**
 * Export portfolio data as JSON
 */
export function exportPortfolioData(): string {
  const data = loadPortfolio();
  if (!data) {
    throw new Error('No portfolio data to export');
  }
  return JSON.stringify(data, null, 2);
}

/**
 * Import portfolio data from JSON
 */
export function importPortfolioData(jsonData: string): PortfolioState {
  try {
    const data = JSON.parse(jsonData);

    // Basic validation
    if (!data.holdings || !Array.isArray(data.holdings)) {
      throw new Error('Invalid portfolio data: missing holdings array');
    }

    return data as PortfolioState;
  } catch (error) {
    console.error('Failed to import portfolio data:', error);
    throw error;
  }
}
