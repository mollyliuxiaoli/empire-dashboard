/**
 * Market Data API Layer - v3.0
 * Abstraction layer for market data sources
 * Currently returns mock data with isMock flags
 * Future: Replace with real API calls
 */

import { MarketData } from '@/types/portfolio';

/**
 * Get fund NAV (Net Asset Value)
 */
export async function getFundNav(code: string): Promise<MarketData> {
  // TODO: Replace with real API call
  // Mock data for now
  return {
    data: {
      code,
      nav: 1.2345,
      changePercent: 0.5,
      asOf: new Date().toISOString()
    },
    asOf: new Date().toISOString(),
    source: '天天基金估值',
    isMock: true
  };
}

/**
 * Get ETF real-time quote
 */
export async function getETFRealtime(code: string): Promise<MarketData> {
  // TODO: Replace with real API call
  return {
    data: {
      code,
      price: 1.234,
      changePercent: 0.3,
      asOf: new Date().toISOString()
    },
    asOf: new Date().toISOString(),
    source: '实时行情',
    isMock: true
  };
}

/**
 * Get gold price
 */
export async function getGoldPrice(): Promise<MarketData> {
  // TODO: Replace with real API call
  return {
    data: {
      internationalPrice: 4739.3,
      exchangeRate: 6.794,
      yuanPerGram: 1035.2,
      changePercent: 0.5
    },
    asOf: new Date().toISOString(),
    source: '上海黄金交易所',
    isMock: true
  };
}

/**
 * Get exchange rate
 */
export async function getExchangeRate(): Promise<MarketData> {
  // TODO: Replace with real API call
  return {
    data: {
      usdToCny: 6.794,
      eurToCny: 7.123,
      jpyToCny: 0.045
    },
    asOf: new Date().toISOString(),
    source: '中国外汇交易中心',
    isMock: true
  };
}

/**
 * Get sector rotation/money flow data
 */
export async function getSectorData(): Promise<MarketData> {
  // TODO: Replace with real API call
  return {
    data: {
      sectors: [
        { name: '科技', flow: 1500000000, change: 2.3 },
        { name: '金融', flow: -500000000, change: -0.8 },
        { name: '医药', flow: 800000000, change: 1.5 }
      ]
    },
    asOf: new Date().toISOString(),
    source: '模拟数据',
    isMock: true
  };
}

/**
 * Get US market indices
 */
export async function getUSMarketData(): Promise<MarketData> {
  // TODO: Replace with real API call
  return {
    data: {
      dowJones: { value: 49704.47, change: 0.19 },
      nasdaq: { value: 26274.13, change: 0.10 },
      sp500: { value: 7412.84, change: 0.19 }
    },
    asOf: new Date().toISOString(),
    source: '模拟数据',
    isMock: true
  };
}

/**
 * Get commodity prices
 */
export async function getCommodityData(): Promise<MarketData> {
  // TODO: Replace with real API call
  return {
    data: {
      gold: { price: 4739.3, change: 0.5, signal: '高位，不宜追' },
      silver: { price: 86.88, change: 0.92, signal: '跟随黄金' },
      copper: { price: 6.44, change: 0, signal: '历史新高' },
      oil: { price: 98.06, change: 0, signal: '高位震荡' }
    },
    asOf: new Date().toISOString(),
    source: '模拟数据',
    isMock: true
  };
}
