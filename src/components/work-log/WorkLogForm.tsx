'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Project, WorkLog, BillingType } from '@/types';
import { calculateHoursFromTime } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectSelect } from '@/components/shared/ProjectSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CheckCircle2, Clock } from 'lucide-react';

interface WorkLogFormProps {
  projects: Project[];
  defaultDate: string;
  initialData?: WorkLog | null;
  onSave: (data: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export const WorkLogForm: React.FC<WorkLogFormProps> = ({
  projects,
  defaultDate,
  initialData,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(defaultDate);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [description, setDescription] = useState('');
  const [workType, setWorkType] = useState<BillingType>('billable');
  const [isManualHours, setIsManualHours] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState<number>(0);
  const [manualHours, setManualHours] = useState('8');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setSelectedProjectId(initialData.projectId);
      const proj = projects.find((p) => p.projectId === initialData.projectId) || null;
      setSelectedProject(proj);
      setDescription(initialData.workDescription);
      setWorkType(initialData.workType);
      setIsManualHours(initialData.isManualHours);
      setStartTime(initialData.startTime || '09:00');
      setEndTime(initialData.endTime || '17:00');
      setBreakMinutes(initialData.breakMinutes || 0);
      setManualHours(String(initialData.totalHours || 8));
    } else {
      setDate(defaultDate);
      setSelectedProjectId('');
      setSelectedProject(null);
      setDescription('');
      setWorkType('billable');
      setIsManualHours(false);
      setStartTime('09:00');
      setEndTime('17:00');
      setBreakMinutes(0);
      setManualHours('8');
    }
  }, [initialData, defaultDate, projects]);

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.projectId);
    setSelectedProject(project);
    setWorkType(project.billingType);
    if (errors.projectId) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.projectId;
        return next;
      });
    }
  };

  const calculatedHours = isManualHours
    ? parseFloat(manualHours) || 0
    : calculateHoursFromTime(startTime, endTime, breakMinutes);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = 'Date is required';
    if (!selectedProjectId) newErrors.projectId = 'Please select a project';
    if (!description.trim()) newErrors.description = 'Work description is required';

    if (isManualHours) {
      const h = parseFloat(manualHours);
      if (isNaN(h) || h <= 0) {
        newErrors.hours = 'Hours must be greater than 0';
      } else if (h > 24) {
        newErrors.hours = 'Hours cannot exceed 24 in a day';
      }
    } else {
      if (!startTime) newErrors.startTime = 'Start time is required';
      if (!endTime) newErrors.endTime = 'End time is required';
      if (calculatedHours <= 0) {
        newErrors.time = 'Total hours must be greater than 0 after break';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      date,
      projectId: selectedProjectId,
      workDescription: description.trim(),
      workType,
      startTime: isManualHours ? '' : startTime,
      endTime: isManualHours ? '' : endTime,
      breakMinutes: isManualHours ? 0 : breakMinutes,
      totalHours: calculatedHours,
      isManualHours,
    });

    toast.success(initialData ? 'Work log updated!' : 'Work log added!');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          {initialData ? 'Edit Work Log' : 'Add Daily Work Entry'}
        </h3>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-xs h-8">
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Date *</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl h-10 text-sm"
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        {/* Project Dropdown */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Project *</Label>
          <ProjectSelect
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={handleSelectProject}
          />
          {errors.projectId && <p className="text-xs text-destructive">{errors.projectId}</p>}
        </div>
      </div>

      {/* Auto-populated details card */}
      {selectedProject && (
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-semibold text-foreground">{selectedProject.projectName}</span>
            {selectedProject.client && (
              <span className="text-muted-foreground ml-2">({selectedProject.client})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={selectedProject.status} className="text-[10px] px-2 py-0.5" />
            <span className="text-muted-foreground font-mono">Progress: {selectedProject.progress}%</span>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">Work Description *</Label>
        <Textarea
          rows={3}
          placeholder="What did you work on today? (e.g. Fixed responsive layout issues, developed API integration...)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl text-sm resize-none"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      {/* Work Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">Work Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWorkType('billable')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
              workType === 'billable'
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500 shadow-xs'
                : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/40'
            }`}
          >
            Billable
          </button>
          <button
            type="button"
            onClick={() => setWorkType('non_billable')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
              workType === 'non_billable'
                ? 'bg-slate-100 border-slate-500 text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-500 shadow-xs'
                : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/40'
            }`}
          >
            Non-Billable
          </button>
        </div>
      </div>

      {/* Time Mode Switch */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-muted-foreground">Time Mode</span>
        <button
          type="button"
          onClick={() => setIsManualHours(!isManualHours)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {isManualHours ? 'Use Start/End Time' : 'Use Manual Hours'}
        </button>
      </div>

      {/* Time Range vs Manual */}
      {!isManualHours ? (
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-lg h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">End Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-lg h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Break (min)</Label>
            <Input
              type="number"
              min="0"
              step="5"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
              className="rounded-lg h-9 text-xs"
            />
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
          <Label className="text-[11px] text-muted-foreground">Total Hours Worked</Label>
          <Input
            type="number"
            min="0.25"
            max="24"
            step="0.25"
            value={manualHours}
            onChange={(e) => setManualHours(e.target.value)}
            className="rounded-lg h-9 text-sm"
          />
        </div>
      )}

      {errors.hours && <p className="text-xs text-destructive">{errors.hours}</p>}
      {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}

      {/* Calculated banner & Submit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-xs font-semibold text-primary">Calculated Hours:</span>
          <span className="text-base font-bold text-primary font-mono">{calculatedHours} hrs</span>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-10 flex-1 sm:flex-none text-xs">
              Cancel
            </Button>
          )}
          <Button type="submit" className="rounded-xl h-10 px-6 font-semibold text-xs gap-1.5 flex-1 sm:flex-none shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
            {initialData ? 'Update Entry' : 'Save Work Entry'}
          </Button>
        </div>
      </div>
    </form>
  );
};
