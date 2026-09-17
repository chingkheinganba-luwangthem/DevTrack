'use client';

import React, { useState } from 'react';
import { WorkLog, Project } from '@/types';
import { BillingBadge } from '@/components/shared/BillingBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface WorkLogTableProps {
  logs: WorkLog[];
  projects: Project[];
  onEdit: (log: WorkLog) => void;
  onDelete: (id: string) => void;
}

export const WorkLogTable: React.FC<WorkLogTableProps> = ({
  logs,
  projects,
  onEdit,
  onDelete,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      toast.success('Work log deleted');
      setDeleteId(null);
    }
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Entries for this Day ({logs.length})
          </h4>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground border-b border-border/60">
                <th className="py-3 px-4 font-semibold">Project ID</th>
                <th className="py-3 px-4 font-semibold">Project Name</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold text-right">Hours</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((log) => {
                const project = projects.find((p) => p.projectId === log.projectId);
                return (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                      {log.projectId}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap max-w-[200px] truncate">
                      {project?.projectName || log.projectId}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[300px]">
                      {log.workDescription}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <BillingBadge type={log.workType} className="text-[10px] px-2 py-0.5" />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono whitespace-nowrap">
                      {log.startTime && log.endTime
                        ? `${log.startTime} - ${log.endTime}`
                        : 'Manual'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground text-right whitespace-nowrap">
                      {log.totalHours} hrs
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(log)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Edit log</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(log.id)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Delete log</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-border/60">
          {logs.map((log) => {
            const project = projects.find((p) => p.projectId === log.projectId);
            return (
              <div key={log.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {log.projectId}
                  </span>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {log.totalHours} hrs
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {project?.projectName || log.projectId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.workDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BillingBadge type={log.workType} className="text-[10px] px-1.5 py-0" />
                    {log.startTime && log.endTime && (
                      <span className="font-mono">{log.startTime}-{log.endTime}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(log)}
                      className="h-7 px-2 text-xs rounded-lg gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(log.id)}
                      className="h-7 px-2 text-xs rounded-lg text-destructive hover:text-destructive gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Work Entry"
        description="Are you sure you want to delete this work log entry? This action cannot be undone."
        confirmLabel="Delete Entry"
        onConfirm={confirmDelete}
      />
    </>
  );
};
