'use client';

import React, { useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useData } from '@/components/providers/DataProvider';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BillingBadge } from '@/components/shared/BillingBadge';
import { StatCard } from '@/components/shared/StatCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  sumHours,
  sumBillableHours,
  sumNonBillableHours,
  getProjectDaysWorked,
} from '@/lib/calculations';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  Layers,
  FolderKanban,
  Edit2,
} from 'lucide-react';

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { projects, workLogs, isLoaded } = useData();

  const project = useMemo(() => {
    return projects.find((p) => p.id === id || p.projectId === id);
  }, [projects, id]);

  const projectLogs = useMemo(() => {
    if (!project) return [];
    return workLogs
      .filter((l) => l.projectId === project.projectId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [workLogs, project]);

  const totalHours = useMemo(() => sumHours(projectLogs), [projectLogs]);
  const billableHours = useMemo(() => sumBillableHours(projectLogs), [projectLogs]);
  const nonBillableHours = useMemo(() => sumNonBillableHours(projectLogs), [projectLogs]);
  const daysWorked = useMemo(() => {
    if (!project) return 0;
    return getProjectDaysWorked(workLogs, project.projectId);
  }, [workLogs, project]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
          <FolderKanban className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Project Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested project does not exist or has been removed.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
      </div>

      {/* Project Header Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                {project.projectId}
              </span>
              <StatusBadge status={project.status} />
              <BillingBadge type={project.billingType} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {project.projectName}
            </h1>

            {project.client && (
              <p className="text-xs text-muted-foreground">
                Client: <span className="font-medium text-foreground">{project.client}</span>
              </p>
            )}

            {project.description && (
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed pt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Progress and Dates Bar */}
        <div className="pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Overall Completion Progress</span>
              <span className="text-foreground font-mono">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <div className="flex items-center justify-start md:justify-end gap-6 text-xs text-muted-foreground">
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Start Date</span>
              <span className="font-medium text-foreground">{project.startDate || '—'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Target Deadline</span>
              <span className="font-medium text-foreground">{project.deadline || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Logged"
          value={`${totalHours}h`}
          subtext="Cumulative project time"
          icon={Clock}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/50"
        />
        <StatCard
          label="Billable Hours"
          value={`${billableHours}h`}
          subtext="Client billable time"
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Non-Billable"
          value={`${nonBillableHours}h`}
          subtext="Internal effort"
          icon={Layers}
          iconColor="text-slate-600 dark:text-slate-400"
          iconBg="bg-slate-100 dark:bg-slate-800/50"
        />
        <StatCard
          label="Days Worked"
          value={daysWorked}
          subtext="Distinct logged dates"
          icon={Calendar}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/50"
        />
      </div>

      {/* Work History Table */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Work History ({projectLogs.length} entries)
          </h3>
        </div>

        {projectLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No work logs recorded for this project yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground border-b border-border/60">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Time / Break</th>
                  <th className="py-3 px-4 font-semibold text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {projectLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-md">
                      {log.workDescription}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <BillingBadge type={log.workType} className="text-[10px] px-2 py-0.5" />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono whitespace-nowrap">
                      {log.startTime && log.endTime ? (
                        <>
                          {log.startTime} - {log.endTime}
                          {log.breakMinutes > 0 && ` (${log.breakMinutes}m break)`}
                        </>
                      ) : (
                        'Manual entry'
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground text-right whitespace-nowrap">
                      {log.totalHours} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
