'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Project, ProjectStatus } from '@/types';
import { getProjectHours, getProjectBillableHours, getProjectNonBillableHours } from '@/lib/calculations';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { FolderKanban, Plus } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_TABS: { label: string; value: 'all' | ProjectStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'On Hold', value: 'on_hold' },
];

export default function ProjectsPage() {
  const {
    projects,
    workLogs,
    addProject,
    updateProject,
    deleteProject,
    archiveProject,
    deleteWorkLogsByProject,
    isLoaded,
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | ProjectStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Deletion state
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Check if project to be deleted has work logs
  const projectLogsCount = useMemo(() => {
    if (!deletingProject) return 0;
    return workLogs.filter((l) => l.projectId === deletingProject.projectId).length;
  }, [deletingProject, workLogs]);

  // Filter projects (exclude archived by default)
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (project.archived) return false;

      // Status filter
      if (activeTab !== 'all' && project.status !== activeTab) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = project.projectId.toLowerCase().includes(query);
        const matchesName = project.projectName.toLowerCase().includes(query);
        const matchesClient = project.client?.toLowerCase().includes(query);
        return matchesId || matchesName || matchesClient;
      }

      return true;
    });
  }, [projects, activeTab, searchQuery]);

  const handleSaveProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      return { success: true };
    } else {
      return await addProject(data);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingProject) return;

    if (projectLogsCount > 0) {
      // Delete project and its logs
      deleteWorkLogsByProject(deletingProject.projectId);
    }
    deleteProject(deletingProject.id);
    toast.success(`Project ${deletingProject.projectId} deleted.`);
    setDeletingProject(null);
  };

  const handleArchive = () => {
    if (!deletingProject) return;
    archiveProject(deletingProject.id);
    toast.info(`Project ${deletingProject.projectId} archived.`);
    setDeletingProject(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-primary" />
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your personal client projects, IDs, deadlines, and time tracking.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingProject(null);
            setFormOpen(true);
          }}
          className="rounded-xl h-10 px-4 text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count =
              tab.value === 'all'
                ? projects.filter((p) => !p.archived).length
                : projects.filter((p) => !p.archived && p.status === tab.value).length;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-card border border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by ID, name, client..."
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            searchQuery
              ? `No projects matching "${searchQuery}".`
              : activeTab !== 'all'
              ? `No projects currently in "${activeTab}" status.`
              : 'Create your first project to start tracking your work and daily timesheet hours.'
          }
          actionLabel="+ Add Project"
          onAction={() => {
            setEditingProject(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const totalHours = getProjectHours(workLogs, project.projectId);
            const billableHours = getProjectBillableHours(workLogs, project.projectId);
            const nonBillableHours = getProjectNonBillableHours(workLogs, project.projectId);

            return (
              <ProjectCard
                key={project.id}
                project={project}
                totalHours={totalHours}
                billableHours={billableHours}
                nonBillableHours={nonBillableHours}
                onEdit={(p) => {
                  setEditingProject(p);
                  setFormOpen(true);
                }}
                onDelete={(p) => setDeletingProject(p)}
              />
            );
          })}
        </div>
      )}

      {/* Project Add / Edit Modal */}
      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialProject={editingProject}
        existingProjects={projects}
        onSave={handleSaveProject}
      />

      {/* Delete / Archive Confirmation Dialog */}
      <ConfirmDialog
        open={deletingProject !== null}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        title={
          projectLogsCount > 0
            ? `Delete Project ${deletingProject?.projectId}?`
            : `Delete Project`
        }
        description={
          projectLogsCount > 0
            ? `This project has ${projectLogsCount} existing work log(s). Deleting it will permanently remove all associated time logs and affect your weekly timesheet and reports.`
            : `Are you sure you want to delete project ${deletingProject?.projectId} (${deletingProject?.projectName})? This action cannot be undone.`
        }
        hasWorkLogs={projectLogsCount > 0}
        confirmLabel="Delete Project"
        onConfirm={handleConfirmDelete}
        onArchive={handleArchive}
      />
    </div>
  );
}
