'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Project, WorkLog, AppSettings, DEFAULT_SETTINGS } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface DataContextType {
  projects: Project[];
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<{ success: boolean; error?: string }>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  getProjectByProjectId: (projectId: string) => Project | undefined;
  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void;

  workLogs: WorkLog[];
  addWorkLog: (data: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkLog | null>;
  updateWorkLog: (id: string, updates: Partial<WorkLog>) => Promise<void>;
  deleteWorkLog: (id: string) => Promise<void>;
  deleteWorkLogsByProject: (projectId: string) => Promise<void>;
  getLogsByDate: (date: string) => WorkLog[];
  getLogsByProject: (projectId: string) => WorkLog[];
  getLogsByDateRange: (startDate: string, endDate: string) => WorkLog[];
  getLastWorkLog: () => WorkLog | undefined;
  setWorkLogs: (logs: WorkLog[] | ((prev: WorkLog[]) => WorkLog[])) => void;

  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setSettings: (settings: AppSettings | ((prev: AppSettings) => AppSettings)) => void;

  isLoaded: boolean;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

// Map from DB snake_case to TS camelCase
const mapProjectFromDB = (db: any): Project => ({
  id: db.id,
  projectId: db.project_id,
  projectName: db.project_name,
  description: db.description || '',
  client: db.client || '',
  status: db.status,
  billingType: db.billing_type,
  startDate: db.start_date || '',
  deadline: db.deadline || '',
  progress: db.progress,
  archived: db.archived,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapProjectToDB = (ts: Partial<Project>): any => {
  const db: any = {};
  if (ts.projectId !== undefined) db.project_id = ts.projectId;
  if (ts.projectName !== undefined) db.project_name = ts.projectName;
  if (ts.description !== undefined) db.description = ts.description;
  if (ts.client !== undefined) db.client = ts.client;
  if (ts.status !== undefined) db.status = ts.status;
  if (ts.billingType !== undefined) db.billing_type = ts.billingType;
  if (ts.startDate !== undefined) db.start_date = ts.startDate;
  if (ts.deadline !== undefined) db.deadline = ts.deadline;
  if (ts.progress !== undefined) db.progress = ts.progress;
  if (ts.archived !== undefined) db.archived = ts.archived;
  return db;
};

const mapLogFromDB = (db: any): WorkLog => ({
  id: db.id,
  date: db.date,
  projectId: db.project_id,
  workDescription: db.work_description || '',
  workType: db.work_type,
  startTime: db.start_time || '',
  endTime: db.end_time || '',
  breakMinutes: db.break_minutes,
  totalHours: parseFloat(db.total_hours),
  isManualHours: db.is_manual_hours,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapLogToDB = (ts: Partial<WorkLog>): any => {
  const db: any = {};
  if (ts.date !== undefined) db.date = ts.date;
  if (ts.projectId !== undefined) db.project_id = ts.projectId;
  if (ts.workDescription !== undefined) db.work_description = ts.workDescription;
  if (ts.workType !== undefined) db.work_type = ts.workType;
  if (ts.startTime !== undefined) db.start_time = ts.startTime;
  if (ts.endTime !== undefined) db.end_time = ts.endTime;
  if (ts.breakMinutes !== undefined) db.break_minutes = ts.breakMinutes;
  if (ts.totalHours !== undefined) db.total_hours = ts.totalHours;
  if (ts.isManualHours !== undefined) db.is_manual_hours = ts.isManualHours;
  return db;
};

export function DataProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  
  // Settings stay in local storage since they are just UI preferences
  const [settings, setSettings, settingsLoaded] = useLocalStorage<AppSettings>('devtrack_settings', DEFAULT_SETTINGS);
  
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, logsRes] = await Promise.all([
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('work_logs').select('*').order('date', { ascending: false })
        ]);

        if (projectsRes.error) throw projectsRes.error;
        if (logsRes.error) throw logsRes.error;

        setProjects((projectsRes.data || []).map(mapProjectFromDB));
        setWorkLogs((logsRes.data || []).map(mapLogFromDB));
      } catch (error: any) {
        toast.error('Failed to load data from Supabase: ' + error.message);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [supabase]);

  // Project operations
  const addProject = useCallback(
    async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => {
      const exists = projects.some((p) => p.projectId === data.projectId && !p.archived);
      if (exists) {
        return { success: false, error: `Project ID "${data.projectId}" already exists.` };
      }
      
      const dbData = mapProjectToDB(data);
      const { data: res, error } = await supabase.from('projects').insert([dbData]).select().single();
      
      if (error) {
        toast.error('Failed to create project');
        return { success: false, error: error.message };
      }
      
      setProjects((prev) => [mapProjectFromDB(res), ...prev]);
      return { success: true };
    },
    [projects, supabase]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      // Optimistic update
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      
      const dbUpdates = mapProjectToDB(updates);
      const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
      
      if (error) {
        toast.error('Failed to update project');
        // Re-fetch to reset optimistic update on error would go here
      }
    },
    [supabase]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await supabase.from('projects').delete().eq('id', id);
    },
    [supabase]
  );

  const archiveProject = useCallback(
    async (id: string) => {
      await updateProject(id, { archived: true });
    },
    [updateProject]
  );

  const getProjectByProjectId = useCallback(
    (projectId: string) => projects.find((p) => p.projectId === projectId),
    [projects]
  );

  // WorkLog operations
  const addWorkLog = useCallback(
    async (data: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      const dbData = mapLogToDB(data);
      const { data: res, error } = await supabase.from('work_logs').insert([dbData]).select().single();
      
      if (error) {
        toast.error('Failed to log work');
        return null;
      }
      
      const newLog = mapLogFromDB(res);
      setWorkLogs((prev) => [newLog, ...prev]);
      return newLog;
    },
    [supabase]
  );

  const updateWorkLog = useCallback(
    async (id: string, updates: Partial<WorkLog>) => {
      setWorkLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
      const dbUpdates = mapLogToDB(updates);
      await supabase.from('work_logs').update(dbUpdates).eq('id', id);
    },
    [supabase]
  );

  const deleteWorkLog = useCallback(
    async (id: string) => {
      setWorkLogs((prev) => prev.filter((l) => l.id !== id));
      await supabase.from('work_logs').delete().eq('id', id);
    },
    [supabase]
  );

  const deleteWorkLogsByProject = useCallback(
    async (projectId: string) => {
      setWorkLogs((prev) => prev.filter((l) => l.projectId !== projectId));
      await supabase.from('work_logs').delete().eq('project_id', projectId);
    },
    [supabase]
  );

  const getLogsByDate = useCallback(
    (date: string) => workLogs.filter((l) => l.date === date),
    [workLogs]
  );

  const getLogsByProject = useCallback(
    (projectId: string) => workLogs.filter((l) => l.projectId === projectId),
    [workLogs]
  );

  const getLogsByDateRange = useCallback(
    (startDate: string, endDate: string) => workLogs.filter((l) => l.date >= startDate && l.date <= endDate),
    [workLogs]
  );

  const getLastWorkLog = useCallback(
    () => {
      if (workLogs.length === 0) return undefined;
      return [...workLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    },
    [workLogs]
  );

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => setSettings((prev) => ({ ...prev, ...updates })),
    [setSettings]
  );

  return (
    <DataContext.Provider
      value={{
        projects, addProject, updateProject, deleteProject, archiveProject, getProjectByProjectId, setProjects,
        workLogs, addWorkLog, updateWorkLog, deleteWorkLog, deleteWorkLogsByProject, getLogsByDate, getLogsByProject, getLogsByDateRange, getLastWorkLog, setWorkLogs,
        settings, updateSettings, setSettings,
        isLoaded: isLoaded && settingsLoaded,
        quickAddOpen, setQuickAddOpen,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
