'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface BillableDonutProps {
  billableHours: number;
  nonBillableHours: number;
}

export const BillableDonut: React.FC<BillableDonutProps> = ({
  billableHours,
  nonBillableHours,
}) => {
  const total = billableHours + nonBillableHours;

  const data = [
    { name: 'Billable', value: billableHours, color: '#2563EB' },
    { name: 'Non-Billable', value: nonBillableHours, color: '#64748B' },
  ].filter((item) => item.value > 0);

  const billablePercent = total > 0 ? Math.round((billableHours / total) * 100) : 0;
  const nonBillablePercent = total > 0 ? Math.round((nonBillableHours / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">Billable vs Non-Billable</h3>
          <p className="text-xs text-muted-foreground">Time split this week</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <PieIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-medium text-foreground">No hours logged this week</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Start logging time to see your distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">Billable vs Non-Billable</h3>
          <p className="text-xs text-muted-foreground">Time breakdown for current week</p>
        </div>
      </div>

      <div className="relative w-full h-56 flex items-center justify-center my-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any) => [`${Number(value || 0).toFixed(1)} hrs`, 'Hours']}
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Pie
              data={data}
              innerRadius={68}
              outerRadius={92}
              paddingAngle={4}
              dataKey="value"
              animationDuration={800}
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            TOTAL
          </span>
          <span className="text-2xl font-bold text-foreground font-sans">
            {total.toFixed(1)}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">hrs</span>
        </div>
      </div>

      {/* Legend with hours and percentage */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
          <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Billable</p>
            <p className="text-[11px] text-muted-foreground">
              {billableHours}h ({billablePercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/30">
          <div className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Non-Billable</p>
            <p className="text-[11px] text-muted-foreground">
              {nonBillableHours}h ({nonBillablePercent}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
