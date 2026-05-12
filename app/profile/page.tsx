"use client";

import { useState } from 'react';
import DashboardCard from '@/components/DashboardCard';

type TabKey = 'logs' | 'settings' | 'about';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('logs');

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'logs', label: '系统日志', icon: '📋' },
    { key: 'settings', label: '设置', icon: '⚙️' },
    { key: 'about', label: '关于', icon: 'ℹ️' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">👤 我的</h1>
        <p className="text-gray-400 text-sm">日志管理 · 系统设置 · 关于</p>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'logs' && <LogsTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'about' && <AboutTab />}
    </div>
  );
}

function LogsTab() {
  const [logs, setLogs] = useState<Array<{id: string; level: string; source: string; message: string; timestamp: string}>>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('systemLogs') || '[]');
      } catch { return []; }
    }
    return [];
  });

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('systemLogs');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <DashboardCard title="系统日志" icon="📋">
      {logs.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button onClick={clearLogs} className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
            🗑️ 清空
          </button>
        </div>
      )}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-3xl mb-2">📭</div>
            <div>暂无日志记录</div>
          </div>
        ) : (
          logs.slice(0, 50).map((log) => (
            <div key={log.id} className="bg-background/50 border border-border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-medium ${getLevelColor(log.level)}`}>{log.level}</span>
                <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString('zh-CN')}</span>
              </div>
              <div className="text-sm text-white mt-1">{log.message}</div>
              <div className="text-xs text-gray-400 mt-1">来源: {log.source}</div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-4">
      <DashboardCard title="数据管理" icon="💾">
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-background/50 border border-border rounded-lg hover:border-gold/50 transition-colors">
            <div className="text-sm text-white font-medium">📤 导出数据</div>
            <div className="text-xs text-gray-400 mt-1">导出所有持仓和交易记录为JSON</div>
          </button>
          <button className="w-full text-left p-3 bg-background/50 border border-border rounded-lg hover:border-gold/50 transition-colors">
            <div className="text-sm text-white font-medium">📥 导入数据</div>
            <div className="text-xs text-gray-400 mt-1">从JSON文件导入持仓数据</div>
          </button>
          <button className="w-full text-left p-3 bg-background/50 border border-border rounded-lg hover:border-gold/50 transition-colors">
            <div className="text-sm text-white font-medium">🔄 重置数据</div>
            <div className="text-xs text-gray-400 mt-1">恢复为默认演示数据</div>
          </button>
        </div>
      </DashboardCard>

      <DashboardCard title="风控参数" icon="🛡️">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-background/50 border border-border rounded-lg">
            <div>
              <div className="text-sm text-white font-medium">T+0 止损线</div>
              <div className="text-xs text-gray-400">单笔最大亏损</div>
            </div>
            <span className="text-red-400 font-bold">-1.5%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-background/50 border border-border rounded-lg">
            <div>
              <div className="text-sm text-white font-medium">T+0 止盈线</div>
              <div className="text-xs text-gray-400">单笔目标收益</div>
            </div>
            <span className="text-green-400 font-bold">+2.0%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-background/50 border border-border rounded-lg">
            <div>
              <div className="text-sm text-white font-medium">单笔上限</div>
              <div className="text-xs text-gray-400">单次做T最大金额</div>
            </div>
            <span className="text-gold font-bold">¥5,000</span>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

function AboutTab() {
  return (
    <DashboardCard title="关于 InvestScope" icon="ℹ️">
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-2xl font-bold text-gold mb-1">InvestScope 投资看板</h2>
          <p className="text-gray-400 text-sm">v4.0 · 个人投资决策助手</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">功能特性</h3>
            <ul className="space-y-1 text-gray-300">
              <li>📊 多资产组合管理（基金/ETF/股票/黄金）</li>
              <li>⚡ T+0 日内交易信号与计算器</li>
              <li>📈 实时行情与盘中估值</li>
              <li>🎯 策略执行与操作记录</li>
              <li>🌍 宏观市场轮动监控</li>
              <li>💾 本地数据持久化</li>
            </ul>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-medium mb-2">⚠️ 免责声明</h3>
            <p className="text-xs text-gray-300">
              本应用仅供个人投资参考，不构成任何投资建议。投资有风险，入市需谨慎。
              所有数据均来自公开市场信息，准确性不做保证。
            </p>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2">
            Built with Next.js + Tailwind CSS + shadcn/ui
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
