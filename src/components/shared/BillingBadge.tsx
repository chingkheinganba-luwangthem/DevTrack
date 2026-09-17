import React from 'react';
import { BillingType } from '@/types';

interface BillingBadgeProps {
  type: BillingType;
  className?: string;
}

export const BillingBadge: React.FC<BillingBadgeProps> = ({ type, className = '' }) => {
  const isBillable = type === 'billable';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
        isBillable
          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700'
      } ${className}`}
    >
      {isBillable ? 'Billable' : 'Non-Billable'}
    </span>
  );
};
