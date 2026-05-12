"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/', label: '总览', icon: '📊' },
  { href: '/holdings', label: '持仓', icon: '🎯' },
  { href: '/trading', label: '做T', icon: '⚡' },
  { href: '/macro', label: '宏观', icon: '🌍' },
  { href: '/logs', label: '日志', icon: '📋' },
];

export default function Navigation() {
  const pathname = usePathname();

  // Check if a path should be active (supports nested routes)
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${
                  active
                    ? 'text-gold bg-gold/10'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar navigation */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-background/95 backdrop-blur-sm border-r border-border flex-col z-50">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-gold">InvestScope 投资看板</h1>
          <p className="text-xs text-slate-500 mt-1">内部代号：帝国操盘室</p>
        </div>
        <div className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'text-gold bg-gold/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <span className="text-2xl mr-3">{item.icon}</span>
                <span className="text-lg">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-3 border-t border-border">
          <Link
            href="/settings"
            className="flex items-center px-4 py-3 rounded-lg transition-colors text-gray-400 hover:text-gray-200 hover:bg-white/5"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <span className="text-lg">设置</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
