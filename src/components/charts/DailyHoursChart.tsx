'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DailyChartData } from '@/types';

interface DailyHoursChartProps {
  data: DailyChartData[];
}

export const DailyHoursChart: React.FC<DailyHoursChartProps> = ({ data }) => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Daily Hours</h3>
          <p className="text-xs text-muted-foreground">Current week trend (Mon – Sun)</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Billable</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBillable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.6}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              unit="h"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DailyChartData;
                  return (
                    <div className="bg-card text-card-foreground p-3 rounded-xl border border-border shadow-lg text-xs space-y-1.5">
                      <p className="font-semibold text-foreground">
                        {item.day}, {item.date}
                      </p>
                      <div className="pt-1.5 border-t border-border/60 space-y-1 text-muted-foreground">
                        <div className="flex justify-between gap-4">
                          <span className="font-medium text-foreground">Total Hours:</span>
                          <span className="font-bold font-mono text-primary">{item.totalHours} hrs</span>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                          <span>Billable:</span>
                          <span className="font-semibold font-mono">{item.billableHours} hrs</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Non-Billable:</span>
                          <span className="font-semibold font-mono">{item.nonBillableHours} hrs</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="totalHours"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorTotal)"
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="billableHours"
              stroke="#16A34A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBillable)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
