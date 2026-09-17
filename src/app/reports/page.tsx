'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { ProjectStatus, BillingType } from '@/types';
import {
  sumHours,
  sumBillableHours,
  sumNonBillableHours,
  averageDailyHours,
  formatDateStr,
} from '@/lib/calculations';
import {
  exportDailyReport,
  exportWeeklyReport,
  exportMonthlyReport,
  exportYearlyReport,
  printReport,
} from '@/lib/export';
import { StatCard } from '@/components/shared/StatCard';
import { BillingBadge } from '@/components/shared/BillingBadge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  FolderKanban,
  FileSpreadsheet,
} from 'lucide-react';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

export default function ReportsPage() {
  const { projects, workLogs, isLoaded } = useData();

  // Filters
  const today = new Date();
  const [startDate, setStartDate] = useState(formatDateStr(subDays(today, 30)));
  const [endDate, setEndDate] = useState(formatDateStr(today));
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedBilling, setSelectedBilling] = useState<BillingType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all');

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return workLogs.filter((log) => {
      // Date filter
      if (startDate && log.date < startDate) return false;
      if (endDate && log.date > endDate) return false;

      // Project filter
      if (selectedProjectId !== 'all' && log.projectId !== selectedProjectId) {
        return false;
      }

      // Billing filter
      if (selectedBilling !== 'all' && log.workType !== selectedBilling) {
        return false;
      }

      // Project status filter
      if (selectedStatus !== 'all') {
        const p = projects.find((proj) => proj.projectId === log.projectId);
        if (!p || p.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [workLogs, projects, startDate, endDate, selectedProjectId, selectedBilling, selectedStatus]);

  // Aggregate stats
  const totalHours = useMemo(() => sumHours(filteredLogs), [filteredLogs]);
  const billableHours = useMemo(() => sumBillableHours(filteredLogs), [filteredLogs]);
  const nonBillableHours = useMemo(() => sumNonBillableHours(filteredLogs), [filteredLogs]);
  const avgHours = useMemo(() => averageDailyHours(filteredLogs), [filteredLogs]);
  const uniqueProjectsCount = useMemo(() => {
    return new Set(filteredLogs.map((l) => l.projectId)).size;
  }, [filteredLogs]);

  // Project breakdown for chart
  const projectChartData = useMemo(() => {
    const map = new Map<string, { total: number; billable: number; nonBillable: number }>();
    filteredLogs.forEach((l) => {
      const cur = map.get(l.projectId) || { total: 0, billable: 0, nonBillable: 0 };
      cur.total += l.totalHours;
      if (l.workType === 'billable') cur.billable += l.totalHours;
      else cur.nonBillable += l.totalHours;
      map.set(l.projectId, cur);
    });

    return Array.from(map.entries())
      .map(([pid, data]) => {
        const p = projects.find((proj) => proj.projectId === pid);
        return {
          projectId: pid,
          projectName: p?.projectName || pid,
          total: Math.round(data.total * 10) / 10,
          billable: Math.round(data.billable * 10) / 10,
          nonBillable: Math.round(data.nonBillable * 10) / 10,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [filteredLogs, projects]);

  // Export handlers
  const handleExportDaily = () => {
    exportDailyReport(workLogs, projects, new Date());
  };

  const handleExportWeekly = () => {
    exportWeeklyReport(workLogs, projects, new Date());
  };

  const handleExportMonthly = () => {
    exportMonthlyReport(workLogs, projects, new Date());
  };

  const handleExportYearly = () => {
    exportYearlyReport(workLogs, projects, new Date());
  };

  // Quick preset filters
  const setPreset = (preset: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const d = new Date();
    if (preset === 'today') {
      const todayStr = formatDateStr(d);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      setStartDate(formatDateStr(subDays(d, 7)));
      setEndDate(formatDateStr(d));
    } else if (preset === 'month') {
      setStartDate(formatDateStr(startOfMonth(d)));
      setEndDate(formatDateStr(d));
    } else if (preset === 'year') {
      setStartDate(formatDateStr(startOfYear(d)));
      setEndDate(formatDateStr(d));
    } else {
      setStartDate('2020-01-01');
      setEndDate(formatDateStr(d));
    }
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
            <BarChart3 className="w-7 h-7 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Filter, analyze, and export your personal time logs across all intervals.
          </p>
        </div>

        {/* Export Dropdown & Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={printReport}
            className="rounded-xl h-10 px-3.5 text-xs font-semibold gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-muted-foreground" />
            Print Report
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl h-10 px-4 text-xs font-semibold gap-1.5 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl min-w-[200px]">
              <DropdownMenuItem onClick={handleExportDaily} className="gap-2 text-xs py-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Download Daily Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWeekly} className="gap-2 text-xs py-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Download Weekly Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMonthly} className="gap-2 text-xs py-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Download Monthly Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportYearly} className="gap-2 text-xs py-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>Download Yearly Report</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs space-y-4">
        {/* Preset Range Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border/60">
          <span className="text-xs font-semibold text-muted-foreground">Quick Intervals:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setPreset('today')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setPreset('week')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPreset('month')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => setPreset('year')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition-colors"
            >
              This Year
            </button>
            <button
              onClick={() => setPreset('all')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition-colors"
            >
              All Time
            </button>
          </div>
        </div>

        {/* Detailed Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Project</Label>
            <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val || 'all')}>
              <SelectTrigger className="rounded-xl h-9 text-xs">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.projectId} className="text-xs">
                    {p.projectId} - {p.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Billing Type</Label>
            <Select value={selectedBilling} onValueChange={(val) => setSelectedBilling((val as any) || 'all')}>
              <SelectTrigger className="rounded-xl h-9 text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Billing Types</SelectItem>
                <SelectItem value="billable" className="text-xs">Billable Only</SelectItem>
                <SelectItem value="non_billable" className="text-xs">Non-Billable Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Filtered Hours"
          value={`${totalHours}h`}
          subtext="Total for selected filter"
          icon={Calendar}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/50"
        />
        <StatCard
          label="Billable Hours"
          value={`${billableHours}h`}
          subtext={`${totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}% of total time`}
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          label="Non-Billable"
          value={`${nonBillableHours}h`}
          subtext="Internal effort"
          icon={Layers}
          iconColor="text-slate-600 dark:text-slate-400"
          iconBg="bg-slate-100 dark:bg-slate-800/50"
        />
        <StatCard
          label="Projects"
          value={uniqueProjectsCount}
          subtext="Active in interval"
          icon={FolderKanban}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/50"
        />
        <StatCard
          label="Daily Average"
          value={`${avgHours}h`}
          subtext="Per worked day"
          icon={TrendingUp}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/50"
        />
      </div>

      {/* Chart: Project Hours Comparison */}
      {projectChartData.length > 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Project Hours Breakdown</h3>
              <p className="text-xs text-muted-foreground">Billable vs Non-Billable by project</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-muted-foreground">Billable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="text-muted-foreground">Non-Billable</span>
              </div>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="projectId"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  unit="h"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-card text-card-foreground p-3 rounded-xl border border-border shadow-lg text-xs space-y-1">
                          <p className="font-bold text-foreground">{item.projectId} - {item.projectName}</p>
                          <div className="pt-1 space-y-0.5 text-muted-foreground">
                            <p>Total: <strong className="text-foreground">{item.total} hrs</strong></p>
                            <p className="text-blue-600 dark:text-blue-400">Billable: {item.billable} hrs</p>
                            <p>Non-Billable: {item.nonBillable} hrs</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="billable" fill="#2563EB" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="nonBillable" fill="#64748B" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filtered Records Table */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Detailed Work Records ({filteredLogs.length})
          </h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No work logs match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground border-b border-border/60">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Project ID</th>
                  <th className="py-3 px-4 font-semibold">Project Name</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.map((log) => {
                  const project = projects.find((p) => p.projectId === log.projectId);
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                        {log.projectId}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground max-w-[200px] truncate">
                        {project?.projectName || log.projectId}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-sm">
                        {log.workDescription}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <BillingBadge type={log.workType} className="text-[10px] px-2 py-0.5" />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-foreground text-right whitespace-nowrap">
                        {log.totalHours} hrs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
