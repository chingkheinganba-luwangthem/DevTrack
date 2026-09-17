'use client';

import React from 'react';
import { Clock, CalendarDays, DollarSign, Coffee, FolderKanban } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { DashboardStats } from '@/types';

interface StatsGridProps {
  stats: DashboardStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const diffFromYesterday = stats.todayHours - stats.yesterdayHours;
  const yesterdaySubtext =
    stats.yesterdayHours > 0
      ? `${diffFromYesterday >= 0 ? '+' : ''}${diffFromYesterday.toFixed(1)} hrs from yesterday`
      : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        label="Today's Hours"
        value={`${stats.todayHours.toFixed(1)}h`}
        subtext={yesterdaySubtext}
        icon={Clock}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBg="bg-blue-50 dark:bg-blue-950/50"
      />

      <StatCard
        label="This Week"
        value={`${stats.weekHours.toFixed(1)}h`}
        subtext="Mon – Sun total"
        icon={CalendarDays}
        iconColor="text-indigo-600 dark:text-indigo-400"
        iconBg="bg-indigo-50 dark:bg-indigo-950/50"
      />

      <StatCard
        label="Billable Hours"
        value={`${stats.billableHours.toFixed(1)}h`}
        subtext="Week billable total"
        icon={DollarSign}
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-50 dark:bg-emerald-950/50"
      />

      <StatCard
        label="Non-Billable"
        value={`${stats.nonBillableHours.toFixed(1)}h`}
        subtext="Internal & product time"
        icon={Coffee}
        iconColor="text-slate-600 dark:text-slate-400"
        iconBg="bg-slate-100 dark:bg-slate-800/50"
      />

      <StatCard
        label="Active Projects"
        value={stats.activeProjects}
        subtext="Ongoing status"
        icon={FolderKanban}
        iconColor="text-amber-600 dark:text-amber-400"
        iconBg="bg-amber-50 dark:bg-amber-950/50"
      />
    </div>
  );
};
