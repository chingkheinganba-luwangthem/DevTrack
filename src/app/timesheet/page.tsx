'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import { useData } from '@/components/providers/DataProvider';
import { generateTimesheetRows, sumHours, sumBillableHours, sumNonBillableHours, formatDateStr } from '@/lib/calculations';
import { exportWeeklyReport } from '@/lib/export';
import { BillingBadge } from '@/components/shared/BillingBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TableProperties,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Layers,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export default function TimesheetPage() {
  const { projects, workLogs, isLoaded } = useData();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Week boundaries (Monday to Sunday)
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);
  const dayStrs = useMemo(() => weekDays.map((d) => formatDateStr(d)), [weekDays]);

  // Timesheet rows
  const rows = useMemo(() => {
    return generateTimesheetRows(workLogs, projects, currentDate);
  }, [workLogs, projects, currentDate]);

  // Week logs
  const weekLogs = useMemo(() => {
    const startStr = dayStrs[0];
    const endStr = dayStrs[6];
    return workLogs.filter((l) => l.date >= startStr && l.date <= endStr);
  }, [workLogs, dayStrs]);

  // Summary statistics
  const totalWeekHours = useMemo(() => sumHours(weekLogs), [weekLogs]);
  const billableWeekHours = useMemo(() => sumBillableHours(weekLogs), [weekLogs]);
  const nonBillableWeekHours = useMemo(() => sumNonBillableHours(weekLogs), [weekLogs]);
  const projectsWorkedCount = useMemo(() => rows.length, [rows]);

  // Day column totals
  const dailyTotals = useMemo(() => {
    return dayStrs.map((dayStr) => {
      const logs = weekLogs.filter((l) => l.date === dayStr);
      return sumHours(logs);
    });
  }, [dayStrs, weekLogs]);

  // Navigation handlers
  const handlePrevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      try {
        setCurrentDate(parseISO(e.target.value));
      } catch {
        // ignore
      }
    }
  };

  const handleExport = () => {
    exportWeeklyReport(workLogs, projects, currentDate);
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
            <TableProperties className="w-7 h-7 text-primary" />
            Weekly Timesheet
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Auto-aggregated from your daily work logs. Daily entries are the source of truth.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExport}
          className="rounded-xl h-10 px-4 text-xs font-semibold gap-1.5 shadow-2xs"
        >
          <Download className="w-4 h-4 text-primary" />
          Export Weekly CSV
        </Button>
      </div>

      {/* Week Navigator Bar */}
      <div className="bg-card rounded-2xl p-4 border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Buttons & Date Picker */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center border border-border rounded-xl overflow-hidden shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevWeek}
              className="h-9 w-9 rounded-none hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Previous Week</span>
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
              onClick={handleNextWeek}
              className="h-9 w-9 rounded-none hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Next Week</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <Input
              type="date"
              value={formatDateStr(currentDate)}
              onChange={handleDateChange}
              className="h-9 rounded-xl text-xs w-36 font-medium"
            />
          </div>
        </div>

        {/* Current Week Range Display */}
        <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-center md:text-right">
          <span className="text-xs text-muted-foreground block md:inline md:mr-2">Selected Week:</span>
          <span className="text-sm font-bold text-primary font-mono">
            {format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM yyyy')}
          </span>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground border-b border-border/60">
                <th className="py-3 px-3 font-semibold uppercase text-[11px] tracking-wider w-28">Project ID</th>
                <th className="py-3 px-3 font-semibold uppercase text-[11px] tracking-wider min-w-[180px]">Project Description</th>
                <th className="py-3 px-3 font-semibold uppercase text-[11px] tracking-wider w-24 text-center">Type</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="py-3 px-2 font-semibold uppercase text-[11px] tracking-wider text-center w-14">
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">{format(day, 'dd/MM')}</div>
                  </th>
                ))}
                <th className="py-3 px-3 font-bold uppercase text-[11px] tracking-wider text-right w-20 bg-muted/80 text-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-xs text-muted-foreground">
                    No work hours recorded for this week.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.projectId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-primary whitespace-nowrap">
                      {row.projectId}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground max-w-[240px] truncate">
                      {row.projectName}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <BillingBadge type={row.billingType} className="text-[10px] px-1.5 py-0" />
                    </td>
                    {row.dailyHours.map((hours, idx) => (
                      <td
                        key={idx}
                        className={`py-3 px-2 text-center font-mono ${
                          hours > 0 ? 'font-bold text-foreground bg-primary/5' : 'text-muted-foreground/40'
                        }`}
                      >
                        {hours > 0 ? hours : '0'}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground bg-muted/40 whitespace-nowrap">
                      {row.totalHours} hrs
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Daily Column Totals Row */}
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-muted/80 font-bold text-foreground border-t-2 border-border text-xs">
                  <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider text-[11px]">
                    Daily Totals:
                  </td>
                  {dailyTotals.map((tot, idx) => (
                    <td key={idx} className="py-3 px-2 text-center font-mono text-primary font-bold">
                      {tot > 0 ? tot : '0'}
                    </td>
                  ))}
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-sm text-primary bg-primary/10">
                    {totalWeekHours} hrs
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Weekly Summary Cards at the bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Week Hours</p>
            <h4 className="text-2xl font-bold text-foreground font-sans mt-0.5">{totalWeekHours} hrs</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-primary flex items-center justify-center">
            <TableProperties className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Billable Hours</p>
            <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-sans mt-0.5">{billableWeekHours} hrs</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Non-Billable</p>
            <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-300 font-sans mt-0.5">{nonBillableWeekHours} hrs</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Projects Worked</p>
            <h4 className="text-2xl font-bold text-foreground font-sans mt-0.5">{projectsWorkedCount}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
