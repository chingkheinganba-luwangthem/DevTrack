'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Project, STATUS_COLORS, ProjectStatus } from '@/types';
import { FolderKanban } from 'lucide-react';

interface ProjectStatusDonutProps {
  projects: Project[];
}

export const ProjectStatusDonut: React.FC<ProjectStatusDonutProps> = ({ projects }) => {
  const activeProjects = projects.filter((p) => !p.archived);
  const total = activeProjects.length;

  const counts: Record<ProjectStatus, number> = {
    completed: 0,
    ongoing: 0,
    pending: 0,
    upcoming: 0,
    on_hold: 0,
  };

  activeProjects.forEach((p) => {
    if (counts[p.status] !== undefined) {
      counts[p.status]++;
    }
  });

  const data = (Object.keys(counts) as ProjectStatus[])
    .map((status) => ({
      name: STATUS_COLORS[status].label,
      value: counts[status],
      color: STATUS_COLORS[status].main,
      status,
    }))
    .filter((item) => item.value > 0);

  if (total === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">Project Status</h3>
          <p className="text-xs text-muted-foreground">Status distribution</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <FolderKanban className="w-6 h-6" />
          </div>
          <p className="text-xs font-medium text-foreground">No projects yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Add projects to visualize status breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col h-full">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-foreground">Project Status</h3>
        <p className="text-xs text-muted-foreground">Active projects distribution</p>
      </div>

      <div className="relative w-full h-56 flex items-center justify-center my-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} projects`, name]}
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
            PROJECTS
          </span>
          <span className="text-2xl font-bold text-foreground font-sans">{total}</span>
          <span className="text-[11px] text-muted-foreground font-medium">Total</span>
        </div>
      </div>

      {/* Dynamic legend showing only statuses with >0 projects */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-border/60">
        {data.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="text-muted-foreground font-mono">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
