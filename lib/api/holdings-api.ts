/**
 * 持仓模块API
 */

import { apiClient } from './api-client';
import { HoldingAsset } from './api-structure';

export class HoldingsAPI {
  async getHoldings(): Promise<HoldingAsset[]> {
    const response = await apiClient.get<HoldingAsset[]>('/holdings');

    if (!response.success || !response.data) {
      console.error('Failed to fetch holdings:', response.error);
      return [];
    }

    return response.data;
  }

  async addHolding(params: {
    symbol: string;
    name: string;
    assetType: 'crypto' | 'stock' | 'forex' | 'commodity';
    quantity: number;
    averageCost: number;
  }): Promise<HoldingAsset | null> {
    const response = await apiClient.post<HoldingAsset>('/holdings', params);

    if (!response.success || !response.data) {
      console.error('Failed to add holding:', response.error);
      return null;
    }

    return response.data;
  }

  async updateHolding(holdingId: string, params: Partial<HoldingAsset>): Promise<HoldingAsset | null> {
    const response = await apiClient.put<HoldingAsset>(`/holdings/${holdingId}`, params);

    if (!response.success || !response.data) {
      console.error('Failed to update holding:', response.error);
      return null;
    }

    return response.data;
  }

  async deleteHolding(holdingId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/holdings/${holdingId}`);

    if (!response.success) {
      console.error('Failed to delete holding:', response.error);
      return false;
    }

    return response.data?.success ?? false;
  }

  async getPortfolioSummary(): Promise<{
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    assetBreakdown: Record<string, number>;
  }> {
    const response = await apiClient.get<any>('/holdings/summary');

    if (!response.success || !response.data) {
      console.error('Failed to fetch portfolio summary:', response.error);
      return {
        totalValue: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
        assetBreakdown: {},
      };
    }

    return response.data;
  }
}

export const holdingsAPI = new HoldingsAPI();
