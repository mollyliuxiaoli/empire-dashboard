"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { portfolioData } from '@/data/portfolio';
import DashboardCard from '@/components/DashboardCard';
import T0Calculator from '@/components/T0Calculator';

// Helper function to check if a T0 target is held and get PnL
const getHoldingStatus = (code: string) => {
  const holding = portfolioData.etfStocks.find(e => e.code === code);
  if (holding) {
    return {
      held: true,
      amount: holding.amount,
      profit: holding.profit,
      profitPercent: holding.profitPercent
    };
  }
  return { held: false, amount: 0, profit: 0, profitPercent: 0 };
};

type TabKey = 't0' | 'strategy' | 'log';

export default function ActionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('t0');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<typeof portfolioData.pendingActions[0] | null>(null);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case '关注': return 'text-gold';
      case '偏弱': return 'text-gray-400';
      case '观望': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const handleFeedback = (action: typeof portfolioData.pendingActions[0]) => {
    setSelectedAction(action);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = () => {
    const operationType = (document.getElementById('operationType') as HTMLSelectElement).value;
    const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);
    const amount = parseFloat((document.getElementById('amount') as HTMLInputElement).value);
    const note = (document.getElementById('note') as HTMLTextAreaElement).value;

    // Save feedback to localStorage
    const formData = {
      assetCode: selectedAction!.code,
      assetName: selectedAction!.action,
      operationType,
      price,
      amount,
      note,
      timestamp: Date.now()
    };

    const existingRecords = JSON.parse(localStorage.getItem('operationRecords') || '[]');
    existingRecords.push(formData);
    localStorage.setItem('operationRecords', JSON.stringify(existingRecords));

    setShowFeedbackModal(false);
    setSelectedAction(null);
    alert('操作反馈已保存');
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 't0', label: '做T中心', icon: '⚡' },
    { key: 'strategy', label: '待执行策略', icon: '🎯' },
    { key: 'log', label: '操作记录', icon: '📋' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gold mb-1">⚡ 行动中心</h1>
        <p className="text-gray-400 text-sm">做T交易 · 策略执行 · 操作记录</p>
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

      {/* 做T中心 */}
      {activeTab === 't0' && (
        <div className="space-y-6">
          <DashboardCard title="T+0 标的池" icon="🎯">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">代码</th>
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">名称</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">现价</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">涨跌%</th>
                    <th className="text-right py-3 px-2 text-sm text-gray-400 font-medium">振幅%</th>
                    <th className="text-center py-3 px-2 text-sm text-gray-400 font-medium">状态</th>
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">持仓</th>
                    <th className="text-left py-3 px-2 text-sm text-gray-400 font-medium">信号</th>
                    <th className="text-center py-3 px-2 text-sm text-gray-400 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.t0Targets.map((target) => {
                    const holdingStatus = getHoldingStatus(target.code);
                    return (
                      <tr key={target.code} className="border-b border-border hover:bg-white/5">
                        <td className="py-3 px-2 text-sm font-medium text-white">{target.code}</td>
                        <td className="py-3 px-2 text-sm">
                          <button onClick={() => router.push(`/holdings/${target.code}`)} className="text-white hover:text-gold underline">
                            {target.name}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-white">{target.price.toFixed(3)}</td>
                        <td className={`py-3 px-2 text-sm text-right ${target.dailyChange >= 0 ? 'text-up' : 'text-down'}`}>
                          {target.dailyChange >= 0 ? '+' : ''}{target.dailyChange.toFixed(2)}%
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-white">{target.amplitude.toFixed(2)}%</td>
                        <td className={`py-3 px-2 text-sm text-center font-medium ${getStatusColor(target.status)}`}>{target.status}</td>
                        <td className="py-3 px-2 text-sm">
                          {holdingStatus.held ? (
                            <div className="flex flex-col">
                              <span className="text-green-400">已持仓 ¥{holdingStatus.amount.toLocaleString()}</span>
                              <span className={`text-xs ${holdingStatus.profit >= 0 ? 'text-up' : 'text-down'}`}>
                                {holdingStatus.profit >= 0 ? '+' : ''}¥{holdingStatus.profit.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">未持仓</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-300">{target.signal}</td>
                        <td className="py-3 px-2 text-center">
                          <button onClick={() => router.push(`/holdings/${target.code}`)} className="text-xs bg-gold/20 text-gold px-3 py-1 rounded hover:bg-gold/30 transition-colors">详情</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="做T计算器" icon="🧮">
              <T0Calculator />
            </DashboardCard>
            <DashboardCard title="交易纪律" icon="⚠️">
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <h4 className="text-red-400 font-semibold text-sm mb-1">🚨 严格止损</h4>
                  <p className="text-xs text-gray-300">T+0标的必须在 -1.5% 止损，绝不抗单</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="text-green-400 font-semibold text-sm mb-1">🎯 适时止盈</h4>
                  <p className="text-xs text-gray-300">达到 +2% 立即止盈，不要贪心</p>
                </div>
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
                  <h4 className="text-gold font-semibold text-sm mb-1">💰 控制仓位</h4>
                  <p className="text-xs text-gray-300">单次做T金额 ≤ 5,000元</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="text-blue-400 font-semibold text-sm mb-1">⏰ 把握时机</h4>
                  <p className="text-xs text-gray-300">早盘10:00-10:30、午盘14:00-14:30最佳窗口</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {/* 待执行策略 */}
      {activeTab === 'strategy' && (
        <div className="space-y-4">
          <DashboardCard title="待执行操作" icon="🎯">
            <div className="space-y-3">
              {portfolioData.pendingActions.map((action, i) => (
                <div key={i} className={`bg-background/50 border rounded-lg p-4 ${
                  action.priority === 'high' ? 'border-red-500/30' :
                  action.priority === 'medium' ? 'border-yellow-500/30' : 'border-border'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {action.priority === 'high' ? '🔴 高' : action.priority === 'medium' ? '🟡 中' : '🟢 低'}
                      </span>
                      <span className="text-white font-medium ml-2">{action.action}</span>
                    </div>
                    <span className="text-xs text-gray-400">{action.code}</span>
                  </div>
                  <div className="text-sm text-gray-300">{action.trigger}</div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleFeedback(action)}
                      className="text-xs bg-gold/20 text-gold px-3 py-1.5 rounded hover:bg-gold/30 transition-colors"
                    >
                      📝 反馈
                    </button>
                    <button className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-500/30 transition-colors">
                      ⏰ 设提醒
                    </button>
                  </div>
                </div>
              ))}
              {portfolioData.pendingActions.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-3xl mb-2">✅</div>
                  <div>暂无待执行操作</div>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* 操作记录 */}
      {activeTab === 'log' && (
        <DashboardCard title="操作记录" icon="📋">
          <div className="space-y-3">
            {portfolioData.history.map((item, i) => (
              <div key={i} className="bg-background/50 border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status === 'done' ? '✅ 已完成' : '⏳ 待执行'}
                    </span>
                    <span className="text-white font-medium text-sm">{item.action}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <div className="text-sm text-gray-300">{item.detail}</div>
              </div>
            ))}
            {portfolioData.history.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <div className="text-3xl mb-2">📭</div>
                <div>暂无操作记录</div>
              </div>
            )}
          </div>
        </DashboardCard>
      )}

      {/* 反馈模态框 */}
      {showFeedbackModal && selectedAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">📝 操作反馈 - {selectedAction.action}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">操作类型</label>
                <select id="operationType" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white">
                  <option>买入建仓</option>
                  <option>卖出减仓</option>
                  <option>做T买入</option>
                  <option>做T卖出</option>
                  <option>定投调整</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">成交价格</label>
                <input id="price" type="number" step="0.001" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="¥0.000" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">成交数量/金额</label>
                <input id="amount" type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" placeholder="数量或金额" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">备注（可选）</label>
                <textarea id="note" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" rows={3} placeholder="操作备注..." />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedAction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-background text-white rounded-lg hover:bg-white/10"
                >
                  取消
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="flex-1 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold/90"
                >
                  提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
