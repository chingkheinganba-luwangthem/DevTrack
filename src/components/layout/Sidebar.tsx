'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck2,
  FolderKanban,
  TableProperties,
  BarChart3,
  Settings as SettingsIcon,
  Zap,
  HardDrive,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Daily Log', href: '/daily-log', icon: CalendarCheck2 },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Timesheet', href: '/timesheet', icon: TableProperties },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border/80 bg-card hidden lg:flex flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-border/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/30 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-foreground font-sans">
                DevTrack
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Track your work. Understand your time.
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 pb-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Storage Footer Status */}
      <div className="p-4 m-3 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Storage: Local</span>
          </div>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          ● Data saved locally in browser
        </p>
      </div>
    </aside>
  );
};
