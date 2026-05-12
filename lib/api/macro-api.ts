/**
 * 宏观轮动模块API
 */

import { apiClient } from './api-client';
import { MacroAsset, MacroRotation } from './api-structure';

export class MacroAPI {
  async getAssets(sector?: string): Promise<MacroAsset[]> {
    const response = await apiClient.get<MacroAsset[]>('/macro/assets');

    if (!response.success || !response.data) {
      console.error('Failed to fetch macro assets:', response.error);
      return [];
    }

    if (sector) {
      return response.data.filter(asset => asset.category === sector);
    }

    return response.data;
  }

  async getRotationCycle(): Promise<MacroRotation | null> {
    const response = await apiClient.get<MacroRotation>('/macro/rotation');

    if (!response.success || !response.data) {
      console.error('Failed to fetch rotation cycle:', response.error);
      return null;
    }

    return response.data;
  }

  async getSectorPerformance(): Promise<Record<string, number>> {
    const response = await apiClient.get<Record<string, number>>('/macro/performance');

    if (!response.success || !response.data) {
      console.error('Failed to fetch sector performance:', response.error);
      return {};
    }

    return response.data;
  }
}

export const macroAPI = new MacroAPI();
