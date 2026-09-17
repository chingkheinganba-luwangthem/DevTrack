'use client';

import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ThemeMode, WeekStartDay } from '@/types';
import { generateDemoProjects, generateDemoWorkLogs } from '@/lib/demo-data';
import { exportAllData, importAllData, clearAllData } from '@/lib/storage';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    setProjects,
    setWorkLogs,
    isLoaded,
  } = useData();

  const { theme, setTheme } = useTheme();

  const [weeklyHours, setWeeklyHours] = useState(settings.weeklyTargetHours || 40);
  const [defaultBreak, setDefaultBreak] = useState(settings.defaultBreakMinutes || 0);
  const [weekStart, setWeekStart] = useState<WeekStartDay>(settings.weekStartsOn || 'monday');

  // Confirmation dialog state for Clear Data
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmDemoOpen, setConfirmDemoOpen] = useState(false);

  // Save general settings
  const handleSaveSettings = () => {
    updateSettings({
      weeklyTargetHours: Number(weeklyHours),
      defaultBreakMinutes: Number(defaultBreak),
      weekStartsOn: weekStart,
    });
    toast.success('Settings saved successfully');
  };

  // Load demo data
  const handleLoadDemo = () => {
    const demoProjects = generateDemoProjects();
    const demoLogs = generateDemoWorkLogs();

    setProjects(demoProjects);
    setWorkLogs(demoLogs);

    toast.success('Realistic demo data loaded!', {
      description: `Loaded ${demoProjects.length} projects and ${demoLogs.length} work logs.`,
    });
    setConfirmDemoOpen(false);
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DevTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded as JSON');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = importAllData(parsed);
        if (res.success) {
          if (parsed.projects) setProjects(parsed.projects);
          if (parsed.workLogs) setWorkLogs(parsed.workLogs);
          if (parsed.settings) updateSettings(parsed.settings);
          toast.success('Data imported successfully!');
        } else {
          toast.error(res.error || 'Failed to import data');
        }
      } catch {
        toast.error('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Clear all data
  const handleClearAll = () => {
    clearAllData();
    setProjects([]);
    setWorkLogs([]);
    toast.success('All local data cleared');
    setConfirmClearOpen(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Page Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-primary" />
          Settings & Data Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure your personal preferences, target hours, appearance, and backup data.
        </p>
      </div>

      {/* General Preferences */}
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-foreground">Preferences</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personal targets and default time values
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="target-hours" className="text-xs font-semibold text-foreground">
              Weekly Target Hours
            </Label>
            <Input
              id="target-hours"
              type="number"
              min="1"
              max="100"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 40)}
              className="rounded-xl h-10 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">Standard is 40 hours/week</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="default-break" className="text-xs font-semibold text-foreground">
              Default Break (Minutes)
            </Label>
            <Input
              id="default-break"
              type="number"
              min="0"
              step="5"
              value={defaultBreak}
              onChange={(e) => setDefaultBreak(parseInt(e.target.value) || 0)}
              className="rounded-xl h-10 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">Auto-fills in new time entries</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Week Starts On</Label>
            <Select value={weekStart} onValueChange={(val) => setWeekStart((val as WeekStartDay) || 'monday')}>
              <SelectTrigger className="rounded-xl h-10 text-xs">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="monday" className="text-xs">Monday (ISO Standard)</SelectItem>
                <SelectItem value="sunday" className="text-xs">Sunday</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Used for weekly calculations</p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSaveSettings}
            className="rounded-xl h-9 px-4 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Appearance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose your preferred interface theme
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-blue-50/70 border-primary text-primary dark:bg-blue-950/40 shadow-xs'
                : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/40'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-blue-50/70 border-primary text-primary dark:bg-blue-950/40 shadow-xs'
                : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/40'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              theme === 'system'
                ? 'bg-blue-50/70 border-primary text-primary dark:bg-blue-950/40 shadow-xs'
                : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/40'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Data Storage & Backup
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your data is stored locally in your web browser. Export backups regularly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Demo Data Button */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Load Demo Data
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Populate with realistic sample projects and 2 weeks of work logs based on the provided timesheet screenshots.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDemoOpen(true)}
              className="rounded-xl h-8 text-xs font-semibold gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Load Sample Records
            </Button>
          </div>

          {/* Backup / Export */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Export Data Backup
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Save all your projects, work logs, and settings to a JSON file on your machine.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="rounded-xl h-8 text-xs font-semibold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON Backup
            </Button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                Import Data Backup
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Restore your previous JSON backup file.
              </p>
            </div>
            <div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold cursor-pointer hover:bg-muted transition-colors bg-card shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset / Clear */}
          <div className="p-4 rounded-xl border border-red-200/80 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 space-y-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Data
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Permanently wipes all projects and work logs stored in this browser.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
              className="rounded-xl h-8 text-xs font-semibold gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Everything
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation for Demo Data */}
      <ConfirmDialog
        open={confirmDemoOpen}
        onOpenChange={setConfirmDemoOpen}
        title="Load Demo Data?"
        description="This will overwrite your existing projects and work logs with realistic sample data based on the provided timesheet screenshots."
        confirmLabel="Load Demo Data"
        variant="default"
        onConfirm={handleLoadDemo}
      />

      {/* Confirmation for Clear Data */}
      <ConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Wipe All Application Data?"
        description="Are you absolutely sure? All your projects, daily time logs, and custom settings will be permanently erased from your browser. We recommend downloading a JSON backup first."
        confirmLabel="Yes, Clear Everything"
        variant="danger"
        onConfirm={handleClearAll}
      />
    </div>
  );
}
