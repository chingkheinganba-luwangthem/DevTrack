// ============================================================
// DevTrack — CSV & Data Export Utilities
// ============================================================

import { WorkLog, Project } from '@/types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, eachWeekOfInterval, eachMonthOfInterval, parseISO } from 'date-fns';
import { sumHours, sumBillableHours, sumNonBillableHours, formatDateStr } from './calculations';

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---- Daily Report ----
export function exportDailyReport(
  logs: WorkLog[],
  projects: Project[],
  date: Date
): void {
  const dateStr = formatDateStr(date);
  const dayLogs = logs.filter((l) => l.date === dateStr);

  const headers = ['Date', 'Project ID', 'Project Name', 'Description', 'Type', 'Start Time', 'End Time', 'Break (min)', 'Hours'];
  const rows = dayLogs.map((log) => {
    const project = projects.find((p) => p.projectId === log.projectId);
    return [
      log.date,
      log.projectId,
      project?.projectName || log.projectId,
      log.workDescription,
      log.workType === 'billable' ? 'Billable' : 'Non-Billable',
      log.startTime || '',
      log.endTime || '',
      log.breakMinutes,
      log.totalHours,
    ].map(escapeCsv).join(',');
  });

  // Summary
  rows.push('');
  rows.push(`Total Hours,${sumHours(dayLogs)}`);
  rows.push(`Billable Hours,${sumBillableHours(dayLogs)}`);
  rows.push(`Non-Billable Hours,${sumNonBillableHours(dayLogs)}`);

  const csv = [headers.join(','), ...rows].join('\n');
  downloadCsv(csv, `DevTrack_Daily_${format(date, 'yyyy-MM-dd')}.csv`);
}

// ---- Weekly Report ----
export function exportWeeklyReport(
  logs: WorkLog[],
  projects: Project[],
  referenceDate: Date
): void {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dayStrs = days.map((d) => formatDateStr(d));

  const weekLogs = logs.filter((l) => l.date >= dayStrs[0] && l.date <= dayStrs[6]);

  // Group by project
  const projectMap = new Map<string, WorkLog[]>();
  weekLogs.forEach((log) => {
    const existing = projectMap.get(log.projectId) || [];
    existing.push(log);
    projectMap.set(log.projectId, existing);
  });

  const dayHeaders = days.map((d) => format(d, 'EEE dd'));
  const headers = ['Project ID', 'Project Name', 'Billing Type', ...dayHeaders, 'Total'];

  const rows: string[] = [];
  projectMap.forEach((projectLogs, projectId) => {
    const project = projects.find((p) => p.projectId === projectId);
    const dailyHours = dayStrs.map((ds) =>
      sumHours(projectLogs.filter((l) => l.date === ds))
    );
    const total = dailyHours.reduce((s, h) => s + h, 0);
    rows.push(
      [
        projectId,
        project?.projectName || projectId,
        project?.billingType === 'billable' ? 'Billable' : 'Non-Billable',
        ...dailyHours,
        total,
      ].map(escapeCsv).join(',')
    );
  });

  // Summary
  rows.push('');
  rows.push(`Week: ${format(weekStart, 'dd MMM yyyy')} - ${format(weekEnd, 'dd MMM yyyy')}`);
  rows.push(`Total Hours,${sumHours(weekLogs)}`);
  rows.push(`Billable Hours,${sumBillableHours(weekLogs)}`);
  rows.push(`Non-Billable Hours,${sumNonBillableHours(weekLogs)}`);

  const csv = [headers.join(','), ...rows].join('\n');
  downloadCsv(csv, `DevTrack_Weekly_${format(weekStart, 'yyyy-MM-dd')}.csv`);
}

// ---- Monthly Report ----
export function exportMonthlyReport(
  logs: WorkLog[],
  projects: Project[],
  referenceDate: Date
): void {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const startStr = formatDateStr(monthStart);
  const endStr = formatDateStr(monthEnd);

  const monthLogs = logs.filter((l) => l.date >= startStr && l.date <= endStr);

  // Weekly breakdown
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const headers = ['Project ID', 'Project Name', 'Billing Type', 'Total Hours', 'Billable Hours', 'Non-Billable Hours', 'Days Worked'];

  const projectMap = new Map<string, WorkLog[]>();
  monthLogs.forEach((log) => {
    const existing = projectMap.get(log.projectId) || [];
    existing.push(log);
    projectMap.set(log.projectId, existing);
  });

  const rows: string[] = [];
  projectMap.forEach((projectLogs, projectId) => {
    const project = projects.find((p) => p.projectId === projectId);
    const daysWorked = new Set(projectLogs.map((l) => l.date)).size;
    rows.push(
      [
        projectId,
        project?.projectName || projectId,
        project?.billingType === 'billable' ? 'Billable' : 'Non-Billable',
        sumHours(projectLogs),
        sumBillableHours(projectLogs),
        sumNonBillableHours(projectLogs),
        daysWorked,
      ].map(escapeCsv).join(',')
    );
  });

  // Weekly summary section
  rows.push('');
  rows.push('Weekly Breakdown');
  rows.push('Week Start,Total Hours,Billable,Non-Billable');
  weeks.forEach((weekStartDate) => {
    const ws = formatDateStr(weekStartDate);
    const we = formatDateStr(endOfWeek(weekStartDate, { weekStartsOn: 1 }));
    const wLogs = monthLogs.filter((l) => l.date >= ws && l.date <= we);
    rows.push([
      format(weekStartDate, 'dd MMM'),
      sumHours(wLogs),
      sumBillableHours(wLogs),
      sumNonBillableHours(wLogs),
    ].join(','));
  });

  // Total summary
  rows.push('');
  rows.push(`Month: ${format(referenceDate, 'MMMM yyyy')}`);
  rows.push(`Total Hours,${sumHours(monthLogs)}`);
  rows.push(`Billable Hours,${sumBillableHours(monthLogs)}`);
  rows.push(`Non-Billable Hours,${sumNonBillableHours(monthLogs)}`);

  const csv = [headers.join(','), ...rows].join('\n');
  downloadCsv(csv, `DevTrack_Monthly_${format(referenceDate, 'yyyy-MM')}.csv`);
}

// ---- Yearly Report ----
export function exportYearlyReport(
  logs: WorkLog[],
  projects: Project[],
  referenceDate: Date
): void {
  const yearStart = startOfYear(referenceDate);
  const yearEnd = endOfYear(referenceDate);
  const startStr = formatDateStr(yearStart);
  const endStr = formatDateStr(yearEnd);

  const yearLogs = logs.filter((l) => l.date >= startStr && l.date <= endStr);

  // Monthly breakdown
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const headers = ['Month', 'Total Hours', 'Billable Hours', 'Non-Billable Hours', 'Projects Worked', 'Days Worked'];
  const rows: string[] = [];

  months.forEach((monthDate) => {
    const ms = formatDateStr(startOfMonth(monthDate));
    const me = formatDateStr(endOfMonth(monthDate));
    const mLogs = yearLogs.filter((l) => l.date >= ms && l.date <= me);

    if (mLogs.length === 0) return;

    const projectsWorked = new Set(mLogs.map((l) => l.projectId)).size;
    const daysWorked = new Set(mLogs.map((l) => l.date)).size;

    rows.push([
      format(monthDate, 'MMMM yyyy'),
      sumHours(mLogs),
      sumBillableHours(mLogs),
      sumNonBillableHours(mLogs),
      projectsWorked,
      daysWorked,
    ].map(escapeCsv).join(','));
  });

  // Project summary for the year
  rows.push('');
  rows.push('Project Summary');
  rows.push('Project ID,Project Name,Total Hours,Billable,Non-Billable');

  const projectMap = new Map<string, WorkLog[]>();
  yearLogs.forEach((log) => {
    const existing = projectMap.get(log.projectId) || [];
    existing.push(log);
    projectMap.set(log.projectId, existing);
  });

  projectMap.forEach((projectLogs, projectId) => {
    const project = projects.find((p) => p.projectId === projectId);
    rows.push([
      projectId,
      project?.projectName || projectId,
      sumHours(projectLogs),
      sumBillableHours(projectLogs),
      sumNonBillableHours(projectLogs),
    ].map(escapeCsv).join(','));
  });

  // Total summary
  rows.push('');
  rows.push(`Year: ${format(referenceDate, 'yyyy')}`);
  rows.push(`Total Hours,${sumHours(yearLogs)}`);
  rows.push(`Billable Hours,${sumBillableHours(yearLogs)}`);
  rows.push(`Non-Billable Hours,${sumNonBillableHours(yearLogs)}`);

  const csv = [headers.join(','), ...rows].join('\n');
  downloadCsv(csv, `DevTrack_Yearly_${format(referenceDate, 'yyyy')}.csv`);
}

// ---- Print Report ----
export function printReport(): void {
  window.print();
}
