"use client";

import { ReactNode } from 'react';

interface DashboardCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: string;
  onClick?: () => void;
}

export default function DashboardCard({ title, children, className = '', icon, onClick }: DashboardCardProps) {
  return (
    <div
      className={`bg-card backdrop-blur-sm rounded-xl border border-border hover:border-gold/30 transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-lg font-semibold text-gold flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
