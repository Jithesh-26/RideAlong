import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'mint' | 'slate' | 'amber' | 'emerald' | 'rose' | 'indigo';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    teal: 'bg-teal-50 text-teal-800 border border-teal-200/80 font-medium',
    mint: 'bg-[#D1FAE5] text-[#065F46] border border-emerald-200/60 font-medium',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200 font-normal',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200 font-medium',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200 font-medium',
    indigo: 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
