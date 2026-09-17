'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BillingBadge } from '@/components/shared/BillingBadge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  totalHours,
  billableHours,
  nonBillableHours,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div className="space-y-3">
        {/* Header: Project ID & Action buttons */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              {project.projectId}
            </span>
            <StatusBadge status={project.status} className="text-[10px] px-2 py-0.5" />
            <BillingBadge type={project.billingType} className="text-[10px] px-2 py-0.5" />
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(project)}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="sr-only">Edit project</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(project)}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="sr-only">Delete project</span>
            </Button>
          </div>
        </div>

        {/* Project Name and Client */}
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1"
          >
            <span>{project.projectName}</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          {project.client && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Client: <span className="font-medium text-foreground">{project.client}</span>
            </p>
          )}
        </div>

        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-mono">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>
      </div>

      {/* Footer: Hours & Dates */}
      <div className="pt-4 mt-4 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Total:</span>
            <span className="font-mono font-bold text-foreground">{totalHours}h</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            <span className="text-blue-600 dark:text-blue-400 font-medium">{billableHours}h billable</span>
          </div>
        </div>

        {(project.startDate || project.deadline) && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground/80" />
              <span>Start: {project.startDate || '—'}</span>
            </div>
            <span>Due: {project.deadline || '—'}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
