// ============================================================
// DevTrack — useProjects Hook
// ============================================================

'use client';

import { useCallback } from 'react';
import { Project } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export function useProjects() {
  const [projects, setProjects, isLoaded] = useLocalStorage<Project[]>('devtrack_projects', []);

  const addProject = useCallback(
    (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): { success: boolean; error?: string } => {
      const exists = projects.some((p) => p.projectId === data.projectId);
      if (exists) {
        return { success: false, error: `Project ID "${data.projectId}" already exists.` };
      }
      const now = new Date().toISOString();
      const newProject: Project = {
        ...data,
        id: uuidv4(),
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [...prev, newProject]);
      return { success: true };
    },
    [projects, setProjects]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      );
    },
    [setProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [setProjects]
  );

  const archiveProject = useCallback(
    (id: string) => {
      updateProject(id, { archived: true });
    },
    [updateProject]
  );

  const getProjectByProjectId = useCallback(
    (projectId: string): Project | undefined => {
      return projects.find((p) => p.projectId === projectId);
    },
    [projects]
  );

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);

  return {
    projects,
    activeProjects,
    archivedProjects,
    isLoaded,
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    archiveProject,
    getProjectByProjectId,
  };
}
