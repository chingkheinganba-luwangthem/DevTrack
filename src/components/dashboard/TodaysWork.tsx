'use client';

import React from 'react';
import { Plus, Clock, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkLog, Project } from '@/types';
import { BillingBadge } from '@/components/shared/BillingBadge';
import { sumHours, sumBillableHours, sumNonBillableHours } from '@/lib/calculations';

interface TodaysWorkProps {
  logs: WorkLog[];
  projects: Project[];
  onAddClick: () => void;
}

export const TodaysWork: React.FC<TodaysWorkProps> = ({
  logs,
  projects,
  onAddClick,
}) => {
  const totalHours = sumHours(logs);
  const billableHours = sumBillableHours(logs);
  const nonBillableHours = sumNonBillableHours(logs);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-4">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Today&apos;s Work
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged activities for today
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/60 text-xs">
            <span className="text-muted-foreground">Today&apos;s Total:</span>
            <span className="font-bold text-foreground font-mono">{totalHours}h</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-700 dark:text-blue-300">
            <span>Billable:</span>
            <span className="font-bold font-mono">{billableHours}h</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
            <span>Non-Billable:</span>
            <span className="font-bold font-mono">{nonBillableHours}h</span>
          </div>

          <Button
            onClick={onAddClick}
            size="sm"
            className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Work
          </Button>
        </div>
      </div>

      {/* Entries List or Empty State */}
      {logs.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">No work logged today yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mb-4">
            Click &ldquo;+ Add Work&rdquo; to start tracking your time and project progress for today.
          </p>
          <Button
            onClick={onAddClick}
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-primary" /> Log First Task
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {logs.map((log) => {
            const project = projects.find((p) => p.projectId === log.projectId);
            return (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-muted/20 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {log.projectId}
                    </span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {project?.projectName || log.projectId}
                    </span>
                    <BillingBadge type={log.workType} className="text-[10px] px-1.5 py-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-0.5">
                    {log.workDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {log.startTime && log.endTime && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {log.startTime} – {log.endTime}
                    </span>
                  )}
                  <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-muted text-foreground">
                    {log.totalHours} hrs
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
