// ============================================================
// DevTrack — useWorkLogs Hook
// ============================================================

'use client';

import { useCallback } from 'react';
import { WorkLog } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export function useWorkLogs() {
  const [workLogs, setWorkLogs, isLoaded] = useLocalStorage<WorkLog[]>('devtrack_work_logs', []);

  const addWorkLog = useCallback(
    (data: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newLog: WorkLog = {
        ...data,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      setWorkLogs((prev) => [...prev, newLog]);
      return newLog;
    },
    [setWorkLogs]
  );

  const updateWorkLog = useCallback(
    (id: string, updates: Partial<WorkLog>) => {
      setWorkLogs((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        )
      );
    },
    [setWorkLogs]
  );

  const deleteWorkLog = useCallback(
    (id: string) => {
      setWorkLogs((prev) => prev.filter((l) => l.id !== id));
    },
    [setWorkLogs]
  );

  const deleteWorkLogsByProject = useCallback(
    (projectId: string) => {
      setWorkLogs((prev) => prev.filter((l) => l.projectId !== projectId));
    },
    [setWorkLogs]
  );

  const getLogsByDate = useCallback(
    (date: string): WorkLog[] => {
      return workLogs.filter((l) => l.date === date);
    },
    [workLogs]
  );

  const getLogsByProject = useCallback(
    (projectId: string): WorkLog[] => {
      return workLogs.filter((l) => l.projectId === projectId);
    },
    [workLogs]
  );

  const getLogsByDateRange = useCallback(
    (startDate: string, endDate: string): WorkLog[] => {
      return workLogs.filter((l) => l.date >= startDate && l.date <= endDate);
    },
    [workLogs]
  );

  const getLastWorkLog = useCallback((): WorkLog | undefined => {
    if (workLogs.length === 0) return undefined;
    return [...workLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [workLogs]);

  return {
    workLogs,
    isLoaded,
    setWorkLogs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    deleteWorkLogsByProject,
    getLogsByDate,
    getLogsByProject,
    getLogsByDateRange,
    getLastWorkLog,
  };
}
