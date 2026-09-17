'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { useData } from '@/components/providers/DataProvider';
import { WorkLog } from '@/types';
import { sumHours, sumBillableHours, sumNonBillableHours, formatDateStr } from '@/lib/calculations';
import { WorkLogForm } from '@/components/work-log/WorkLogForm';
import { WorkLogTable } from '@/components/work-log/WorkLogTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  RotateCcw,
  CalendarCheck2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DailyLogPage() {
  const {
    projects,
    workLogs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    getLastWorkLog,
    isLoaded,
  } = useData();

  const [selectedDate, setSelectedDate] = useState<string>(formatDateStr(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);

  // Parse date object
  const dateObj = useMemo(() => {
    try {
      return parseISO(selectedDate);
    } catch {
      return new Date();
    }
  }, [selectedDate]);

  // Current day's logs
  const dayLogs = useMemo(() => {
    return workLogs.filter((l) => l.date === selectedDate);
  }, [workLogs, selectedDate]);

  // Daily statistics
  const totalHours = useMemo(() => sumHours(dayLogs), [dayLogs]);
  const billableHours = useMemo(() => sumBillableHours(dayLogs), [dayLogs]);
  const nonBillableHours = useMemo(() => sumNonBillableHours(dayLogs), [dayLogs]);

  // Navigation handlers
  const handlePrevDay = () => {
    setSelectedDate(formatDateStr(subDays(dateObj, 1)));
  };

  const handleNextDay = () => {
    setSelectedDate(formatDateStr(addDays(dateObj, 1)));
  };

  const handleToday = () => {
    setSelectedDate(formatDateStr(new Date()));
  };

  // Feature: Copy Yesterday
  const handleCopyYesterday = () => {
    const yesterdayStr = formatDateStr(subDays(dateObj, 1));
    const yesterdayLogs = workLogs.filter((l) => l.date === yesterdayStr);

    if (yesterdayLogs.length === 0) {
      toast.error('No work logs found for yesterday to copy.', {
        description: `No entries recorded on ${format(subDays(dateObj, 1), 'dd MMM yyyy')}`,
      });
      return;
    }

    // Copy the first log or open in form for confirmation
    const primary = yesterdayLogs[0];
    setEditingLog({
      ...primary,
      id: '', // New entry
      date: selectedDate, // Set to currently selected date
    });
    setShowForm(true);

    toast.info(`Copied ${yesterdayLogs.length} entry/entries from yesterday`, {
      description: 'Review and confirm your hours before saving.',
    });
  };

  // Feature: Repeat Last Work
  const handleRepeatLast = () => {
    const lastLog = getLastWorkLog();
    if (!lastLog) {
      toast.error('No previous work logs found.');
      return;
    }

    setEditingLog({
      ...lastLog,
      id: '',
      date: selectedDate,
    });
    setShowForm(true);

    toast.info(`Repeated last work on ${lastLog.projectId}`, {
      description: 'Review details and save.',
    });
  };

  const handleSaveLog = (data: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingLog && editingLog.id) {
      updateWorkLog(editingLog.id, data);
    } else {
      addWorkLog(data);
    }
    setShowForm(false);
    setEditingLog(null);
  };

  const handleStartEdit = (log: WorkLog) => {
    setEditingLog(log);
    setShowForm(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarCheck2 className="w-7 h-7 text-primary" />
            Daily Work Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log your daily project tasks and track exact hours.
          </p>
        </div>

        {/* Productivity Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyYesterday}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5 hover:bg-muted/80"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Copy Yesterday
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRepeatLast}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5 hover:bg-muted/80"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Repeat Last Work
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingLog(null);
              setShowForm(!showForm);
            }}
            className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Close Form' : 'Add Work'}
          </Button>
        </div>
      </div>

      {/* Date Navigation Toolbar & Day Statistics Bar */}
      <div className="bg-card rounded-2xl p-4 border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-xl overflow-hidden shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              className="h-9 w-9 rounded-none hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Previous Day</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-9 px-3 text-xs font-semibold border-x border-border rounded-none hover:bg-muted"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              className="h-9 w-9 rounded-none hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Next Day</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <Calendar className="w-4 h-4 text-primary" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 rounded-xl text-xs w-36 font-medium"
            />
            <span className="text-xs font-semibold text-foreground hidden sm:inline">
              {format(dateObj, 'EEEE, d MMMM yyyy')}
            </span>
          </div>
        </div>

        {/* Daily Summary Stat Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
            <span className="text-muted-foreground mr-1.5">Day Total:</span>
            <span className="font-mono font-bold text-primary text-sm">{totalHours}h</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            <span className="opacity-75 mr-1.5">Billable:</span>
            <span className="font-mono font-bold">{billableHours}h</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <span className="opacity-75 mr-1.5">Non-Billable:</span>
            <span className="font-mono font-bold">{nonBillableHours}h</span>
          </div>
        </div>
      </div>

      {/* Form Area (Add or Edit) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WorkLogForm
              projects={projects}
              defaultDate={selectedDate}
              initialData={editingLog}
              onSave={handleSaveLog}
              onCancel={() => {
                setShowForm(false);
                setEditingLog(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Work Log Table or Empty State */}
      {dayLogs.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No work logged for this day"
          description={`You haven't recorded any tasks for ${format(dateObj, 'EEEE, d MMMM yyyy')}. Start logging or copy from yesterday.`}
          actionLabel="+ Log Work for this Day"
          onAction={() => {
            setEditingLog(null);
            setShowForm(true);
          }}
        />
      ) : (
        <WorkLogTable
          logs={dayLogs}
          projects={projects}
          onEdit={handleStartEdit}
          onDelete={deleteWorkLog}
        />
      )}
    </div>
  );
}
