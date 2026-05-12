"use client";

import { portfolioData } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';

export default function LogsPage() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'bg-gray-500/10 border-gray-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 紧急';
      case 'medium': return '🟡 中等';
      case 'low': return '⚪ 低';
      default: return '⚪ 低';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'done' ? '✅' : '⏳';
  };

  const getStatusColor = (status: string) => {
    return status === 'done' ? 'text-green-400' : 'text-yellow-400';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">📋 操作日志</h1>
        <p className="text-gray-400 text-sm">待执行任务 · 历史操作记录</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 待执行操作 */}
        <div>
          <DashboardCard title="待执行操作" icon="⚠️">
            <div className="space-y-3">
              {portfolioData.pendingActions.map((action, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getPriorityColor(action.priority)} hover:opacity-80 transition-opacity`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-semibold text-white">
                      {getPriorityLabel(action.priority)}
                    </div>
                    <div className="text-xs text-gray-400">{action.code}</div>
                  </div>
                  <div className="text-base text-white mb-2">{action.action}</div>
                  <div className="text-sm text-gray-400">
                    触发条件: <span className="text-gold">{action.trigger}</span>
                  </div>
                </div>
              ))}

              {portfolioData.pendingActions.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <div>暂无待执行操作</div>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* 历史操作记录 */}
        <div>
          <DashboardCard title="历史操作记录" icon="📜">
            <div className="space-y-4">
              {portfolioData.history.map((record, index) => (
                <div key={index} className="relative pl-6 pb-6 last:pb-0">
                  {/* 时间线 */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border last:hidden"></div>
                  <div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full ${
                    record.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>

                  <div className="bg-background/50 rounded-lg p-3 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-gray-400">{record.date}</div>
                      <div className={`text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)} {record.status === 'done' ? '已完成' : '待执行'}
                      </div>
                    </div>
                    <div className="text-base font-medium text-white mb-1">{record.action}</div>
                    <div className="text-sm text-gray-400">{record.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard className="text-center">
          <div className="text-3xl font-bold text-gold mb-1">
            {portfolioData.pendingActions.length}
          </div>
          <div className="text-sm text-gray-400">待执行操作</div>
        </DashboardCard>

        <DashboardCard className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {portfolioData.history.filter(h => h.status === 'done').length}
          </div>
          <div className="text-sm text-gray-400">已完成操作</div>
        </DashboardCard>

        <DashboardCard className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {portfolioData.history.filter(h => h.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-400">进行中操作</div>
        </DashboardCard>
      </div>
    </div>
  );
}
