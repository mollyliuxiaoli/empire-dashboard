"use client";

import { useState, useEffect } from 'react';
import { SystemLog } from '@/lib/api/api-structure';
import DashboardCard from '@/components/DashboardCard';

export default function LogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    // 从localStorage读取日志
    const storedLogs = localStorage.getItem('systemLogs');
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs);
        setLogs(parsedLogs);
      } catch (error) {
        console.error('Failed to parse logs:', error);
      }
    }
  };

  const addLog = (level: SystemLog['level'], source: string, message: string, details?: any) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      level,
      source,
      message,
      details,
      timestamp: new Date().toISOString(),
      context: {
        page: 'logs',
      }
    };

    const updatedLogs = [newLog, ...logs].slice(0, 100); // 只保留最近100条
    setLogs(updatedLogs);
    localStorage.setItem('systemLogs', JSON.stringify(updatedLogs));
  };

  const getLevelIcon = (level: SystemLog['level']) => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📌';
    }
  };

  const getLevelColor = (level: SystemLog['level']) => {
    switch (level) {
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
    return true;
  });

  const sources = Array.from(new Set(logs.map(log => log.source)));

  const clearLogs = () => {
    if (confirm('确定要清空所有日志吗？')) {
      setLogs([]);
      localStorage.removeItem('systemLogs');
      addLog('info', 'system', '日志已清空');
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    addLog('info', 'system', '日志已导出');
  };

  const getStats = () => {
    return {
      total: logs.length,
      errors: logs.filter(l => l.level === 'error').length,
      warnings: logs.filter(l => l.level === 'warning').length,
      success: logs.filter(l => l.level === 'success').length,
    };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">📋 操作日志</h1>
          <p className="text-gray-400 text-sm">系统操作记录 · {stats.total} 条日志</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportLogs}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            📤 导出
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            🗑️ 清空
          </button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard className="text-center">
          <div className="text-3xl font-bold text-gold mb-1">{stats.total}</div>
          <div className="text-sm text-gray-400">总日志</div>
        </DashboardCard>
        <DashboardCard className="text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">{stats.errors}</div>
          <div className="text-sm text-gray-400">错误</div>
        </DashboardCard>
        <DashboardCard className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.warnings}</div>
          <div className="text-sm text-gray-400">警告</div>
        </DashboardCard>
        <DashboardCard className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{stats.success}</div>
          <div className="text-sm text-gray-400">成功</div>
        </DashboardCard>
      </div>

      {/* 过滤器 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gold text-black'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            错误
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'warning'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            警告
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'success'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            成功
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'info'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-card text-gray-400 hover:text-white border border-border'
            }`}
          >
            信息
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-card text-white border border-border rounded-lg px-4 py-2 text-sm"
          >
            <option value="all">所有来源</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 日志列表 */}
      <DashboardCard title="日志记录" icon="📜">
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="text-4xl mb-2">📭</div>
              <div>暂无日志记录</div>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border ${getLevelColor(log.level)} hover:opacity-80 transition-opacity`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLevelIcon(log.level)}</span>
                    <span className="text-sm font-medium text-white">{log.source}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div className="text-base text-white mb-1">{log.message}</div>
                {log.details && (
                  <div className="text-sm text-gray-400 mt-1">
                    <details>
                      <summary className="cursor-pointer hover:text-white">详细信息</summary>
                      <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                {log.context && (
                  <div className="text-xs text-gray-400 mt-1">
                    {log.context.page && `页面: ${log.context.page}`}
                    {log.context.action && ` · 操作: ${log.context.action}`}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
