/**
 * EmptyState Component - v3.0
 * Displayed when there's no data to show
 */

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  title = "暂无数据",
  message = "点击右上角新增持仓开始使用",
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 mb-6 text-slate-600">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-center mb-6 max-w-md">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
