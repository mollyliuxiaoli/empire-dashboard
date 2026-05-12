/**
 * API统一数据结构定义
 *
 * 确保API端点与前端期望的响应结构完全一致，避免隐式数据转换
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface MacroAsset {
  id: string;
  name: string;
  symbol: string;
  category: MacroSector;
  country: string;
  currentPrice: number;
  change24h: number;
  volume24h: number;
  lastUpdate: string;
}

export type MacroSector =
  | 'crypto'
  | 'index'
  | 'forex'
  | 'commodity'
  | 'bond';

export interface MacroRotation {
  id: string;
  cycle: string;
  cycleStart: string;
  currentPhase: RotationPhase;
  phases: Phase[];
  narratives: Narrative[];
  lastUpdate: string;
}

export type RotationPhase =
  | 'risk-on'
  | 'risk-off'
  | 'inflation-hedge'
  | 'growth'
  | 'defensive';

export interface Phase {
  name: string;
  trigger: string;
  overweight: MacroSector[];
  underweight: MacroSector[];
  startDate?: string;
  endDate?: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface Narrative {
  title: string;
  description: string;
  drivers: string[];
  assets: string[];
  startDate?: string;
  status: 'active' | 'fading' | 'expired';
}

export interface TradingPosition {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openDate: string;
  status: 'open' | 'closed';
  notes?: string;
}

export interface HoldingAsset {
  id: string;
  symbol: string;
  name: string;
  assetType: 'crypto' | 'stock' | 'forex' | 'commodity';
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  lastUpdate: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: {
    page?: string;
    action?: string;
    userId?: string;
  };
}
