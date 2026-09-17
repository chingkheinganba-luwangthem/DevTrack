// ============================================================
// DevTrack — localStorage Abstraction Layer
// ============================================================
// Clean storage utilities. All localStorage access goes through here.
// This makes it easy to swap to a database later.

import { Project, WorkLog, AppSettings, DEFAULT_SETTINGS } from '@/types';

const KEYS = {
  projects: 'devtrack_projects',
  workLogs: 'devtrack_work_logs',
  settings: 'devtrack_settings',
} as const;

// ---- Helpers ----

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    // Corrupted data — reset
    console.warn(`[DevTrack] Corrupted localStorage key "${key}". Resetting.`);
    localStorage.removeItem(key);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[DevTrack] Failed to write "${key}" to localStorage:`, e);
  }
}

// ---- Projects ----

export function getProjects(): Project[] {
  return safeGet<Project[]>(KEYS.projects, []);
}

export function saveProjects(projects: Project[]): void {
  safeSet(KEYS.projects, projects);
}

export function getProjectByProjectId(projectId: string): Project | undefined {
  return getProjects().find((p) => p.projectId === projectId);
}

export function addProject(project: Project): { success: boolean; error?: string } {
  const projects = getProjects();
  if (projects.some((p) => p.projectId === project.projectId)) {
    return { success: false, error: `Project ID "${project.projectId}" already exists.` };
  }
  projects.push(project);
  saveProjects(projects);
  return { success: true };
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
    saveProjects(projects);
  }
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function archiveProject(id: string): void {
  updateProject(id, { archived: true, status: 'completed' });
}

// ---- Work Logs ----

export function getWorkLogs(): WorkLog[] {
  return safeGet<WorkLog[]>(KEYS.workLogs, []);
}

export function saveWorkLogs(logs: WorkLog[]): void {
  safeSet(KEYS.workLogs, logs);
}

export function addWorkLog(log: WorkLog): void {
  const logs = getWorkLogs();
  logs.push(log);
  saveWorkLogs(logs);
}

export function updateWorkLog(id: string, updates: Partial<WorkLog>): void {
  const logs = getWorkLogs();
  const idx = logs.findIndex((l) => l.id === id);
  if (idx !== -1) {
    logs[idx] = { ...logs[idx], ...updates, updatedAt: new Date().toISOString() };
    saveWorkLogs(logs);
  }
}

export function deleteWorkLog(id: string): void {
  const logs = getWorkLogs().filter((l) => l.id !== id);
  saveWorkLogs(logs);
}

export function deleteWorkLogsByProject(projectId: string): void {
  const logs = getWorkLogs().filter((l) => l.projectId !== projectId);
  saveWorkLogs(logs);
}

export function getWorkLogsByDate(date: string): WorkLog[] {
  return getWorkLogs().filter((l) => l.date === date);
}

export function getWorkLogsByProject(projectId: string): WorkLog[] {
  return getWorkLogs().filter((l) => l.projectId === projectId);
}

export function getWorkLogsByDateRange(startDate: string, endDate: string): WorkLog[] {
  return getWorkLogs().filter((l) => l.date >= startDate && l.date <= endDate);
}

// ---- Settings ----

export function getSettings(): AppSettings {
  return safeGet<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.settings, settings);
}

// ---- Import / Export ----

export interface ExportData {
  version: string;
  exportedAt: string;
  projects: Project[];
  workLogs: WorkLog[];
  settings: AppSettings;
}

export function exportAllData(): ExportData {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projects: getProjects(),
    workLogs: getWorkLogs(),
    settings: getSettings(),
  };
}

export function importAllData(data: ExportData): { success: boolean; error?: string } {
  try {
    if (!data || !data.version) {
      return { success: false, error: 'Invalid import data format.' };
    }
    if (Array.isArray(data.projects)) saveProjects(data.projects);
    if (Array.isArray(data.workLogs)) saveWorkLogs(data.workLogs);
    if (data.settings) saveSettings(data.settings);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to import data.' };
  }
}

export function clearAllData(): void {
  if (!isClient()) return;
  localStorage.removeItem(KEYS.projects);
  localStorage.removeItem(KEYS.workLogs);
  localStorage.removeItem(KEYS.settings);
}
