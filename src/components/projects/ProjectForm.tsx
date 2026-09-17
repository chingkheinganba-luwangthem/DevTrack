'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, BillingType, STATUS_COLORS } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderKanban } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProject?: Project | null;
  existingProjects: Project[];
  onSave: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<{ success: boolean; error?: string }>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onOpenChange,
  initialProject,
  existingProjects,
  onSave,
}) => {
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ongoing');
  const [billingType, setBillingType] = useState<BillingType>('billable');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialProject) {
      setProjectId(initialProject.projectId);
      setProjectName(initialProject.projectName);
      setDescription(initialProject.description || '');
      setClient(initialProject.client || '');
      setStatus(initialProject.status);
      setBillingType(initialProject.billingType);
      setStartDate(initialProject.startDate || '');
      setDeadline(initialProject.deadline || '');
      setProgress(initialProject.progress || 0);
      setErrors({});
    } else {
      setProjectId('');
      setProjectName('');
      setDescription('');
      setClient('');
      setStatus('ongoing');
      setBillingType('billable');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDeadline('');
      setProgress(0);
      setErrors({});
    }
  }, [initialProject, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectId.trim()) {
      newErrors.projectId = 'Project ID is required';
    } else if (
      !initialProject &&
      existingProjects.some(
        (p) => p.projectId.toLowerCase() === projectId.trim().toLowerCase()
      )
    ) {
      newErrors.projectId = `Project ID "${projectId}" is already taken`;
    }

    if (!projectName.trim()) {
      newErrors.projectName = 'Project Name is required';
    }

    if (progress < 0 || progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await onSave({
      projectId: projectId.trim().toUpperCase(),
      projectName: projectName.trim(),
      description: description.trim(),
      client: client.trim(),
      status,
      billingType,
      startDate,
      deadline,
      progress: Number(progress),
    });

    if (!result.success) {
      setErrors({ form: result.error || 'Failed to save project' });
      return;
    }

    toast.success(initialProject ? 'Project updated successfully' : 'Project created successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-1 pb-2 border-b border-border/60">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            {initialProject ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter project details. Project ID will be used for daily work tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errors.form && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project ID */}
            <div className="space-y-1.5">
              <Label htmlFor="proj-id" className="text-xs font-semibold text-foreground">
                Project ID *
              </Label>
              <Input
                id="proj-id"
                placeholder="e.g. PS26INH093"
                value={projectId}
                disabled={!!initialProject} // Project ID is immutable once created
                onChange={(e) => setProjectId(e.target.value)}
                className="rounded-xl font-mono uppercase h-10 text-sm"
              />
              {errors.projectId && <p className="text-xs text-destructive">{errors.projectId}</p>}
            </div>

            {/* Client */}
            <div className="space-y-1.5">
              <Label htmlFor="proj-client" className="text-xs font-semibold text-foreground">
                Client
              </Label>
              <Input
                id="proj-client"
                placeholder="e.g. MTDC, Globizs..."
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="rounded-xl h-10 text-sm"
              />
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-name" className="text-xs font-semibold text-foreground">
              Project Name *
            </Label>
            <Input
              id="proj-name"
              placeholder="e.g. Online Contractor Enlistment System"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="rounded-xl h-10 text-sm"
            />
            {errors.projectName && <p className="text-xs text-destructive">{errors.projectName}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc" className="text-xs font-semibold text-foreground">
              Description
            </Label>
            <Textarea
              id="proj-desc"
              rows={2}
              placeholder="Brief summary of project scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl text-sm resize-none"
            />
          </div>

          {/* Status & Billing Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Status *</Label>
              <Select value={status} onValueChange={(val) => setStatus((val as ProjectStatus) || 'ongoing')}>
                <SelectTrigger className="rounded-xl h-10 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(Object.keys(STATUS_COLORS) as ProjectStatus[]).map((st) => (
                    <SelectItem key={st} value={st} className="text-xs">
                      {STATUS_COLORS[st].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Billing Type *</Label>
              <Select value={billingType} onValueChange={(val) => setBillingType((val as BillingType) || 'billable')}>
                <SelectTrigger className="rounded-xl h-10 text-xs">
                  <SelectValue placeholder="Select billing" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="billable" className="text-xs">Billable</SelectItem>
                  <SelectItem value="non_billable" className="text-xs">Non-Billable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-start" className="text-xs font-semibold text-foreground">
                Start Date
              </Label>
              <Input
                id="proj-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-due" className="text-xs font-semibold text-foreground">
                Deadline
              </Label>
              <Input
                id="proj-due"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>
          </div>

          {/* Progress % */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <Label htmlFor="proj-progress" className="font-semibold text-foreground">
                Progress
              </Label>
              <span className="font-mono font-bold text-primary">{progress}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                id="proj-progress"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="rounded-xl h-10 text-sm w-24 text-center font-mono"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="flex-1 accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>
            {errors.progress && <p className="text-xs text-destructive">{errors.progress}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-10 px-5 text-xs font-semibold shadow-xs"
            >
              {initialProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
