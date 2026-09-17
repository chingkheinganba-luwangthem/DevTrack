'use client';

import React from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { History, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkLog, Project } from '@/types';
import { BillingBadge } from '@/components/shared/BillingBadge';

interface RecentWorkProps {
  logs: WorkLog[];
  projects: Project[];
}

export const RecentWork: React.FC<RecentWorkProps> = ({ logs, projects }) => {
  // Sort descending by date and time, take top 5
  const recentLogs = [...logs]
    .sort((a, b) => {
      const cmp = b.date.localeCompare(a.date);
      if (cmp !== 0) return cmp;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 5);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Recent Work
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest logged activities
          </p>
        </div>

        <Link
          href="/daily-log"
          className="inline-flex items-center gap-1 rounded-xl h-8 px-3 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-muted/50 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentLogs.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No work logs recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {recentLogs.map((log) => {
            const project = projects.find((p) => p.projectId === log.projectId);
            let formattedDate = log.date;
            try {
              formattedDate = format(parseISO(log.date), 'dd MMM');
            } catch {
              // fallback
            }

            return (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-muted/20 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-14 text-center px-2 py-1 rounded-lg bg-muted/60 text-xs font-semibold text-muted-foreground shrink-0">
                    {formattedDate}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary">
                        {log.projectId}
                      </span>
                      <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                        {project?.projectName || log.projectId}
                      </span>
                      <BillingBadge type={log.workType} className="text-[10px] px-1.5 py-0" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {log.workDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="font-mono font-bold text-sm text-foreground">
                    {log.totalHours}h
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
