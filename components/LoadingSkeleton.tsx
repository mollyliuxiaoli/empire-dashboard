/**
 * LoadingSkeleton Component - v3.0
 * Displayed while data is loading
 */

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
            <div className="h-8 bg-slate-700 rounded w-32 mb-1"></div>
            <div className="h-4 bg-slate-700 rounded w-24"></div>
          </div>
        ))}
      </div>

      {/* Holdings List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-5 bg-slate-700 rounded w-48 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-32 mb-3"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
              <div className="h-12 bg-slate-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-32 mb-4"></div>
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    </div>
  );
}

// Compact version for cards
export function CardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
      <div className="h-8 bg-slate-700 rounded w-32 mb-1"></div>
      <div className="h-4 bg-slate-700 rounded w-24"></div>
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-5 bg-slate-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-32 mb-3"></div>
          <div className="flex gap-4">
            <div className="h-4 bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
          </div>
        </div>
        <div className="h-12 bg-slate-700 rounded w-20"></div>
      </div>
    </div>
  );
}
