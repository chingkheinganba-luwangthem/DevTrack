'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useData } from '@/components/providers/DataProvider';
import {
  calculateDashboardStats,
  getProjectHoursData,
  getDailyChartData,
  formatDateStr,
} from '@/lib/calculations';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { TodaysWork } from '@/components/dashboard/TodaysWork';
import { RecentWork } from '@/components/dashboard/RecentWork';
import { BillableDonut } from '@/components/charts/BillableDonut';
import { ProjectStatusDonut } from '@/components/charts/ProjectStatusDonut';
import { HoursBarChart } from '@/components/charts/HoursBarChart';
import { DailyHoursChart } from '@/components/charts/DailyHoursChart';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { projects, workLogs, setQuickAddOpen, isLoaded } = useData();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateStr(today), [today]);

  // Dynamic greeting based on current hour
  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [today]);

  const weekStart = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);
  const weekEnd = useMemo(() => endOfWeek(today, { weekStartsOn: 1 }), [today]);

  // Compute stats and chart datasets
  const stats = useMemo(() => {
    return calculateDashboardStats(workLogs, projects, today);
  }, [workLogs, projects, today]);

  const projectHoursData = useMemo(() => {
    return getProjectHoursData(workLogs, projects);
  }, [workLogs, projects]);

  const dailyChartData = useMemo(() => {
    return getDailyChartData(workLogs, today);
  }, [workLogs, today]);

  const todaysLogs = useMemo(() => {
    return workLogs.filter((l) => l.date === todayStr);
  }, [workLogs, todayStr]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Top Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Personal Work Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-sans">
              {greeting} 👋
            </h1>
            <p className="text-sm text-blue-100/90 max-w-xl">
              Here&apos;s your work overview for today, {format(today, 'd MMMM yyyy')}. Week {format(weekStart, 'd')} - {format(weekEnd, 'd MMM')}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold shadow-md transition-all hover:scale-105 active:scale-95"
            >
              + Add Work
            </button>
            <Link
              href="/timesheet"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              Timesheet <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </motion.div>

      {/* Top 5 Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <StatsGrid stats={stats} />
      </motion.div>

      {/* Primary Work Focus: Today's Work */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <TodaysWork
          logs={todaysLogs}
          projects={projects}
          onAddClick={() => setQuickAddOpen(true)}
        />
      </motion.div>

      {/* Donut Charts Row: Billable Donut + Project Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <BillableDonut
            billableHours={stats.billableHours}
            nonBillableHours={stats.nonBillableHours}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <ProjectStatusDonut projects={projects} />
        </motion.div>
      </div>

      {/* Hours Bar Chart & Daily Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <HoursBarChart data={projectHoursData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <DailyHoursChart data={dailyChartData} />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <RecentWork logs={workLogs} projects={projects} />
      </motion.div>
    </div>
  );
}
