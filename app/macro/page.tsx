"use client";

import { useState, useEffect } from 'react';
import { macroAPI } from '@/lib/api/macro-api';
import { MacroAsset, MacroRotation } from '@/lib/api/api-structure';
import DashboardCard from '@/components/DashboardCard';

export default function MacroPage() {
  const [assets, setAssets] = useState<MacroAsset[]>([]);
  const [rotation, setRotation] = useState<MacroRotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsData, rotationData] = await Promise.all([
        macroAPI.getAssets(),
        macroAPI.getRotationCycle()
      ]);
      setAssets(assetsData);
      setRotation(rotationData);
    } catch (error) {
      console.error('Failed to load macro data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-up' : 'text-down';
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'risk-on': 'bg-green-500/10 border-green-500/30',
      'risk-off': 'bg-red-500/10 border-red-500/30',
      'inflation-hedge': 'bg-yellow-500/10 border-yellow-500/30',
      'growth': 'bg-blue-500/10 border-blue-500/30',
      'defensive': 'bg-purple-500/10 border-purple-500/30',
    };
    return colors[phase] || 'bg-gray-500/10 border-gray-500/30';
  };

  const getNarrativeStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'text-green-400',
      'fading': 'text-yellow-400',
      'expired': 'text-gray-400',
    };
    return colors[status] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">🌍 宏观雷达</h1>
        <p className="text-gray-400 text-sm">全球市场 · 板块轮动 · 资金流向</p>
      </div>

      {/* 轮动周期概览 */}
      {rotation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DashboardCard title={`当前周期: ${rotation.cycle}`} icon="🔄">
            <div className="space-y-4">
              {/* 当前阶段 */}
              <div className={`${getPhaseColor(rotation.currentPhase)} border rounded-lg p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">当前阶段</div>
                  <div className="text-xs text-gray-400">
                    起始: {new Date(rotation.cycleStart).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xl font-bold text-white mb-2">
                  {rotation.phases.find(p => p.status === 'active')?.name || rotation.currentPhase}
                </div>
                <div className="text-sm text-gray-300">
                  {rotation.phases.find(p => p.status === 'active')?.trigger}
                </div>
              </div>

              {/* 阶段列表 */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-2">轮动阶段</div>
                {rotation.phases.map((phase, index) => (
                  <div
                    key={index}
                    className={`bg-background/50 border rounded-lg p-3 ${
                      phase.status === 'active' ? 'border-gold/50' : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-white">{phase.name}</span>
                      <span className={`text-xs ${
                        phase.status === 'active' ? 'text-gold' :
                        phase.status === 'upcoming' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {phase.status === 'active' ? '进行中' :
                         phase.status === 'upcoming' ? '即将到来' : '已结束'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{phase.trigger}</div>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* 市场叙事 */}
          <DashboardCard title="市场叙事" icon="📖">
            <div className="space-y-3">
              {rotation.narratives.map((narrative, index) => (
                <div
                  key={index}
                  className={`bg-background/50 border rounded-lg p-3 ${
                    narrative.status === 'active' ? 'border-gold/50' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-semibold text-white">{narrative.title}</h4>
                    <span className={`text-xs ${getNarrativeStatusColor(narrative.status)}`}>
                      {narrative.status === 'active' ? '活跃' :
                       narrative.status === 'fading' ? '减弱' : '过期'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">{narrative.description}</p>
                  <div className="text-xs text-gray-400">
                    <strong>驱动因素:</strong> {narrative.drivers.join(', ')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    <strong>相关资产:</strong> {narrative.assets.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* 资产监控 */}
      <DashboardCard title="资产监控" icon="📊">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-background/50 rounded-lg p-4 border border-border hover:border-gold/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm text-gray-400">{asset.name}</div>
                  <div className="text-lg font-bold text-white">{asset.symbol}</div>
                </div>
                <div className={`text-sm ${getChangeColor(asset.change24h)}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold text-white">
                  {asset.currentPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">{asset.category}</div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                24h交易量: {asset.volume24h.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
