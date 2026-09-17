'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ProjectHoursData } from '@/types';
import { BarChart3 } from 'lucide-react';

interface HoursBarChartProps {
  data: ProjectHoursData[];
}

export const HoursBarChart: React.FC<HoursBarChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">Hours by Project</h3>
          <p className="text-xs text-muted-foreground">Cumulative logged hours</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-xs font-medium text-foreground">No hours logged yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Project totals will appear here</p>
        </div>
      </div>
    );
  }

  // Limit to top 7 projects for optimal vertical layout
  const chartData = data.slice(0, 7);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Hours by Project</h3>
          <p className="text-xs text-muted-foreground">Ranked by total hours logged</p>
        </div>
        <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60">
          Top {chartData.length}
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              unit="h"
            />
            <YAxis
              dataKey="projectId"
              type="category"
              tickLine={false}
              axisLine={false}
              width={85}
              tick={{ fontSize: 11, fill: 'var(--foreground)', fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ProjectHoursData;
                  return (
                    <div className="bg-card text-card-foreground p-3 rounded-xl border border-border shadow-lg text-xs space-y-1.5 min-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                          {item.projectId}
                        </span>
                        <span className="font-semibold truncate max-w-[140px] text-foreground">
                          {item.projectName}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-border/60 space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Total Hours:</span>
                          <span className="font-bold text-foreground font-mono">{item.totalHours} hrs</span>
                        </div>
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span>Billable:</span>
                          <span className="font-semibold font-mono">{item.billableHours} hrs</span>
                        </div>
                        <div className="flex justify-between">
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
            <Bar
              dataKey="totalHours"
              radius={[0, 8, 8, 0]}
              animationDuration={800}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#2563EB' : '#3B82F6'}
                  opacity={1 - index * 0.08}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
