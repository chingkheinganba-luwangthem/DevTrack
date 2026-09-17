// ============================================================
// DevTrack — Core Type Definitions
// ============================================================

export type ProjectStatus = 'completed' | 'ongoing' | 'pending' | 'upcoming' | 'on_hold';
export type BillingType = 'billable' | 'non_billable';
export type ThemeMode = 'light' | 'dark' | 'system';
export type WeekStartDay = 'monday' | 'sunday';

// ---- Project ----
export interface Project {
  id: string;               // Internal UUID
  projectId: string;        // User-facing ID (e.g., PS26INH093)
  projectName: string;
  description: string;
  client: string;
  status: ProjectStatus;
  billingType: BillingType;
  startDate: string;        // ISO date string
  deadline: string;         // ISO date string
  progress: number;         // 0–100
  archived: boolean;
  createdAt: string;        // ISO datetime
  updatedAt: string;        // ISO datetime
}

// ---- Work Log ----
export interface WorkLog {
  id: string;               // UUID
  date: string;             // ISO date string (YYYY-MM-DD)
  projectId: string;        // References Project.projectId
  workDescription: string;
  workType: BillingType;
  startTime: string;        // HH:mm (24h)
  endTime: string;          // HH:mm (24h)
  breakMinutes: number;
  totalHours: number;       // Calculated or manually entered
  isManualHours: boolean;   // true = manually entered hours (no start/end)
  createdAt: string;
  updatedAt: string;
}

// ---- Settings ----
export interface AppSettings {
  weeklyTargetHours: number;
  defaultBreakMinutes: number;
  weekStartsOn: WeekStartDay;
  theme: ThemeMode;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  todayHours: number;
  yesterdayHours: number;
  weekHours: number;
  billableHours: number;
  nonBillableHours: number;
  activeProjects: number;
}

// ---- Timesheet Row ----
export interface TimesheetRow {
  projectId: string;
  projectName: string;
  billingType: BillingType;
  dailyHours: number[];    // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  totalHours: number;
}

// ---- Report Filter ----
export interface ReportFilter {
  startDate: string;
  endDate: string;
  projectId: string;
  billingType: BillingType | 'all';
  status: ProjectStatus | 'all';
}

// ---- Chart Data ----
export interface BillableChartData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectStatusChartData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectHoursData {
  projectId: string;
  projectName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface DailyChartData {
  day: string;
  date: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

// ---- Status color map ----
export const STATUS_COLORS: Record<ProjectStatus, { main: string; bg: string; label: string }> = {
  completed: { main: '#16A34A', bg: '#DCFCE7', label: 'Completed' },
  ongoing: { main: '#2563EB', bg: '#DBEAFE', label: 'Ongoing' },
  pending: { main: '#D97706', bg: '#FEF3C7', label: 'Pending' },
  upcoming: { main: '#7C3AED', bg: '#EDE9FE', label: 'Upcoming' },
  on_hold: { main: '#DC2626', bg: '#FEE2E2', label: 'On Hold' },
};

export const BILLING_LABELS: Record<BillingType, string> = {
  billable: 'Billable',
  non_billable: 'Non-Billable',
};

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  weeklyTargetHours: 40,
  defaultBreakMinutes: 0,
  weekStartsOn: 'monday',
  theme: 'light',
};
