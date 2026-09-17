// ============================================================
// DevTrack — Calculation Utilities
// ============================================================
// Single source of truth for all hour / stat calculations.

import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInMinutes,
  isValid,
  subDays,
} from 'date-fns';
import {
  WorkLog,
  Project,
  DashboardStats,
  TimesheetRow,
  BillingType,
  ProjectHoursData,
  DailyChartData,
  ProjectStatus,
} from '@/types';

// ---- Time Calculation ----

export function calculateHoursFromTime(
  startTime: string,
  endTime: string,
  breakMinutes: number
): number {
  if (!startTime || !endTime) return 0;

  const today = '2000-01-01';
  let start = parseISO(`${today}T${startTime}`);
  let end = parseISO(`${today}T${endTime}`);

  if (!isValid(start) || !isValid(end)) return 0;

  // Handle crossing midnight
  if (end <= start) {
    const nextDay = '2000-01-02';
    end = parseISO(`${nextDay}T${endTime}`);
  }

  const totalMinutes = differenceInMinutes(end, start) - (breakMinutes || 0);
  if (totalMinutes <= 0) return 0;

  return Math.round((totalMinutes / 60) * 100) / 100;
}

// ---- Date Helpers ----

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function getWeekDays(date: Date): Date[] {
  const { start, end } = getWeekRange(date);
  return eachDayOfInterval({ start, end });
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function formatDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// ---- Summation Helpers ----

export function sumHours(logs: WorkLog[]): number {
  return Math.round(logs.reduce((sum, l) => sum + (l.totalHours || 0), 0) * 100) / 100;
}

export function sumBillableHours(logs: WorkLog[]): number {
  return sumHours(logs.filter((l) => l.workType === 'billable'));
}

export function sumNonBillableHours(logs: WorkLog[]): number {
  return sumHours(logs.filter((l) => l.workType === 'non_billable'));
}

// ---- Daily / Weekly / Monthly ----

export function getDailyHours(logs: WorkLog[], date: string): number {
  return sumHours(logs.filter((l) => l.date === date));
}

export function getWeeklyHours(logs: WorkLog[], referenceDate: Date): number {
  const { start, end } = getWeekRange(referenceDate);
  const startStr = formatDateStr(start);
  const endStr = formatDateStr(end);
  return sumHours(logs.filter((l) => l.date >= startStr && l.date <= endStr));
}

export function getMonthlyHours(logs: WorkLog[], referenceDate: Date): number {
  const { start, end } = getMonthRange(referenceDate);
  const startStr = formatDateStr(start);
  const endStr = formatDateStr(end);
  return sumHours(logs.filter((l) => l.date >= startStr && l.date <= endStr));
}

// ---- Project Hours ----

export function getProjectHours(logs: WorkLog[], projectId: string): number {
  return sumHours(logs.filter((l) => l.projectId === projectId));
}

export function getProjectBillableHours(logs: WorkLog[], projectId: string): number {
  return sumBillableHours(logs.filter((l) => l.projectId === projectId));
}

export function getProjectNonBillableHours(logs: WorkLog[], projectId: string): number {
  return sumNonBillableHours(logs.filter((l) => l.projectId === projectId));
}

// ---- Dashboard Stats ----

export function calculateDashboardStats(
  logs: WorkLog[],
  projects: Project[],
  today: Date
): DashboardStats {
  const todayStr = formatDateStr(today);
  const yesterdayStr = formatDateStr(subDays(today, 1));

  const todayLogs = logs.filter((l) => l.date === todayStr);
  const yesterdayLogs = logs.filter((l) => l.date === yesterdayStr);

  const { start, end } = getWeekRange(today);
  const startStr = formatDateStr(start);
  const endStr = formatDateStr(end);
  const weekLogs = logs.filter((l) => l.date >= startStr && l.date <= endStr);

  const activeProjects = projects.filter(
    (p) => p.status === 'ongoing' && !p.archived
  ).length;

  return {
    todayHours: sumHours(todayLogs),
    yesterdayHours: sumHours(yesterdayLogs),
    weekHours: sumHours(weekLogs),
    billableHours: sumBillableHours(weekLogs),
    nonBillableHours: sumNonBillableHours(weekLogs),
    activeProjects,
  };
}

// ---- Timesheet ----

export function generateTimesheetRows(
  logs: WorkLog[],
  projects: Project[],
  referenceDate: Date
): TimesheetRow[] {
  const weekDays = getWeekDays(referenceDate);
  const dayStrs = weekDays.map((d) => formatDateStr(d));

  const startStr = dayStrs[0];
  const endStr = dayStrs[6];

  const weekLogs = logs.filter((l) => l.date >= startStr && l.date <= endStr);

  // Group by projectId
  const projectMap = new Map<string, WorkLog[]>();
  weekLogs.forEach((log) => {
    const existing = projectMap.get(log.projectId) || [];
    existing.push(log);
    projectMap.set(log.projectId, existing);
  });

  const rows: TimesheetRow[] = [];
  projectMap.forEach((projectLogs, projectId) => {
    const project = projects.find((p) => p.projectId === projectId);
    const dailyHours = dayStrs.map((dayStr) =>
      sumHours(projectLogs.filter((l) => l.date === dayStr))
    );
    rows.push({
      projectId,
      projectName: project?.projectName || projectId,
      billingType: project?.billingType || 'billable',
      dailyHours,
      totalHours: dailyHours.reduce((s, h) => s + h, 0),
    });
  });

  return rows.sort((a, b) => b.totalHours - a.totalHours);
}

// ---- Chart Data Generators ----

export function getProjectHoursData(
  logs: WorkLog[],
  projects: Project[]
): ProjectHoursData[] {
  const data: ProjectHoursData[] = [];
  projects
    .filter((p) => !p.archived)
    .forEach((project) => {
      const projectLogs = logs.filter((l) => l.projectId === project.projectId);
      const total = sumHours(projectLogs);
      if (total > 0) {
        data.push({
          projectId: project.projectId,
          projectName: project.projectName,
          totalHours: total,
          billableHours: sumBillableHours(projectLogs),
          nonBillableHours: sumNonBillableHours(projectLogs),
        });
      }
    });
  return data.sort((a, b) => b.totalHours - a.totalHours);
}

export function getDailyChartData(
  logs: WorkLog[],
  referenceDate: Date
): DailyChartData[] {
  const weekDays = getWeekDays(referenceDate);
  return weekDays.map((day) => {
    const dayStr = formatDateStr(day);
    const dayLogs = logs.filter((l) => l.date === dayStr);
    return {
      day: format(day, 'EEE'),
      date: format(day, 'dd MMM'),
      totalHours: sumHours(dayLogs),
      billableHours: sumBillableHours(dayLogs),
      nonBillableHours: sumNonBillableHours(dayLogs),
    };
  });
}

export function getProjectStatusCounts(
  projects: Project[]
): Record<ProjectStatus, number> {
  const counts: Record<ProjectStatus, number> = {
    completed: 0,
    ongoing: 0,
    pending: 0,
    upcoming: 0,
    on_hold: 0,
  };
  projects
    .filter((p) => !p.archived)
    .forEach((p) => {
      counts[p.status]++;
    });
  return counts;
}

// ---- Unique project days worked ----

export function getProjectDaysWorked(logs: WorkLog[], projectId: string): number {
  const dates = new Set(logs.filter((l) => l.projectId === projectId).map((l) => l.date));
  return dates.size;
}

// ---- Filter logs by billing type ----

export function filterLogsByBilling(logs: WorkLog[], type: BillingType | 'all'): WorkLog[] {
  if (type === 'all') return logs;
  return logs.filter((l) => l.workType === type);
}

// ---- Average daily hours ----

export function averageDailyHours(logs: WorkLog[]): number {
  if (logs.length === 0) return 0;
  const dates = new Set(logs.map((l) => l.date));
  const total = sumHours(logs);
  return Math.round((total / dates.size) * 100) / 100;
}
