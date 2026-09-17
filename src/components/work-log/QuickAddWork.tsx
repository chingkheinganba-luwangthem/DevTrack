'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useData } from '@/components/providers/DataProvider';
import { Project, BillingType } from '@/types';
import { calculateHoursFromTime } from '@/lib/calculations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProjectSelect } from '@/components/shared/ProjectSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const QuickAddWork: React.FC = () => {
  const {
    quickAddOpen,
    setQuickAddOpen,
    projects,
    addWorkLog,
    settings,
  } = useData();

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [description, setDescription] = useState('');
  const [workType, setWorkType] = useState<BillingType>('billable');
  const [isManualHours, setIsManualHours] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState<number>(settings.defaultBreakMinutes || 0);
  const [manualHours, setManualHours] = useState('8');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when opened
  useEffect(() => {
    if (quickAddOpen) {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setBreakMinutes(settings.defaultBreakMinutes || 0);
      setErrors({});
    }
  }, [quickAddOpen, settings.defaultBreakMinutes]);

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

  // Calculated hours
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
        newErrors.hours = 'Hours cannot exceed 24 in a single day';
      }
    } else {
      if (!startTime) newErrors.startTime = 'Start time is required';
      if (!endTime) newErrors.endTime = 'End time is required';
      if (calculatedHours <= 0) {
        newErrors.time = 'Total time must be greater than 0 minutes after break';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    addWorkLog({
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

    toast.success('Work log saved successfully!', {
      description: `${calculatedHours}h logged for ${selectedProjectId}`,
    });

    // Reset and close
    setDescription('');
    setSelectedProjectId('');
    setSelectedProject(null);
    setQuickAddOpen(false);
  };

  return (
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        <DialogHeader className="gap-1 pb-2 border-b border-border/60">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Quick Add Work
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Log your daily hours. Everything calculates automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label htmlFor="work-date" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date *
            </Label>
            <Input
              id="work-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl h-10 text-sm"
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Project ID Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Project *</Label>
            <ProjectSelect
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelect={handleSelectProject}
            />
            {errors.projectId && <p className="text-xs text-destructive">{errors.projectId}</p>}

            {/* Auto-populated Project Info card */}
            {selectedProject && (
              <div className="mt-2 p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">{selectedProject.projectName}</p>
                  {selectedProject.client && (
                    <p className="text-muted-foreground">Client: {selectedProject.client}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={selectedProject.status} className="text-[10px] px-2 py-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Work Description */}
          <div className="space-y-1.5">
            <Label htmlFor="work-desc" className="text-xs font-semibold text-foreground">
              Work Description *
            </Label>
            <Textarea
              id="work-desc"
              rows={3}
              placeholder="What did you work on today? e.g. Fixed responsive layout issues, developed API..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.description;
                    return n;
                  });
                }
              }}
              className="rounded-xl text-sm resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Work Type: Billable / Non-Billable */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Billing Type</Label>
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

          {/* Time mode selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-muted-foreground">Time Input Mode</span>
            <button
              type="button"
              onClick={() => setIsManualHours(!isManualHours)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {isManualHours ? 'Switch to Start/End Time' : 'Switch to Manual Hours'}
            </button>
          </div>

          {/* Start/End Time vs Manual Hours */}
          {!isManualHours ? (
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/30 border border-border/60">
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
            <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
              <Label className="text-[11px] text-muted-foreground">Hours Worked</Label>
              <Input
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                placeholder="e.g. 7.5"
                className="rounded-lg h-9 text-sm"
              />
            </div>
          )}

          {errors.hours && <p className="text-xs text-destructive">{errors.hours}</p>}
          {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}

          {/* Calculated summary pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-xs font-semibold text-primary">Total Calculated:</span>
            <span className="text-base font-bold text-primary font-mono">{calculatedHours} hrs</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button
            variant="outline"
            onClick={() => setQuickAddOpen(false)}
            className="rounded-xl h-10 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl h-10 px-5 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Work Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
