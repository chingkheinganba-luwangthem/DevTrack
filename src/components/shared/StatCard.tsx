'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  trend,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-card text-card-foreground rounded-2xl p-5 border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-sans">
              {value}
            </h3>
          </div>
          {subtext && (
            <p className="text-xs text-muted-foreground pt-0.5">{subtext}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium pt-0.5 flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
};
