'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { Check, ChevronsUpDown, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { StatusBadge } from './StatusBadge';
import { BillingBadge } from './BillingBadge';

interface ProjectSelectProps {
  projects: Project[];
  selectedProjectId: string;
  onSelect: (project: Project) => void;
  disabled?: boolean;
  className?: string;
}

export const ProjectSelect: React.FC<ProjectSelectProps> = ({
  projects,
  selectedProjectId,
  onSelect,
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedProject = projects.find((p) => p.projectId === selectedProjectId);

  const filteredProjects = projects.filter((p) => {
    if (p.archived) return false;
    const query = search.toLowerCase();
    return (
      p.projectId.toLowerCase().includes(query) ||
      p.projectName.toLowerCase().includes(query) ||
      (p.client && p.client.toLowerCase().includes(query))
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={`w-full flex items-center justify-between min-h-11 px-3.5 py-2 rounded-xl text-left font-normal bg-card border border-border/80 shadow-2xs hover:bg-muted/40 transition-colors ${className}`}
      >
        {selectedProject ? (
          <div className="flex items-center gap-2.5 truncate">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
              {selectedProject.projectId}
            </span>
            <span className="text-sm font-medium text-foreground truncate">
              {selectedProject.projectName}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
            Select a project...
          </span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[320px] p-2 rounded-2xl shadow-xl border-border" align="start">
        <div className="mb-2 px-1">
          <Input
            placeholder="Search project ID, name, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs rounded-xl bg-muted/40 border-border/60"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
          {filteredProjects.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No matching projects found.
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isSelected = p.projectId === selectedProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`flex items-start justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-left ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/80 text-foreground">
                        {p.projectId}
                      </span>
                      <span className="text-xs font-medium truncate text-foreground">
                        {p.projectName}
                      </span>
                    </div>
                    {p.client && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        Client: {p.client}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <StatusBadge status={p.status} className="text-[10px] px-1.5 py-0" showDot={false} />
                      <BillingBadge type={p.billingType} className="text-[10px] px-1.5 py-0" />
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
