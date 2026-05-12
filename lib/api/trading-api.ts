/**
 * 交易模块API
 */

import { apiClient } from './api-client';
import { TradingPosition } from './api-structure';

export class TradingAPI {
  async getPositions(): Promise<TradingPosition[]> {
    const response = await apiClient.get<TradingPosition[]>('/trading/positions');

    if (!response.success || !response.data) {
      console.error('Failed to fetch trading positions:', response.error);
      return [];
    }

    return response.data;
  }

  async openPosition(params: {
    symbol: string;
    type: 'long' | 'short';
    quantity: number;
    entryPrice: number;
    notes?: string;
  }): Promise<TradingPosition | null> {
    const response = await apiClient.post<TradingPosition>('/trading/positions', params);

    if (!response.success || !response.data) {
      console.error('Failed to open position:', response.error);
      return null;
    }

    return response.data;
  }

  async closePosition(positionId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/trading/positions/${positionId}`);

    if (!response.success) {
      console.error('Failed to close position:', response.error);
      return false;
    }

    return response.data?.success ?? false;
  }
}

export const tradingAPI = new TradingAPI();
