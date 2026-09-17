'use client';

import React, { useState } from 'react';
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
  Menu,
  HardDrive,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Daily Log', href: '/daily-log', icon: CalendarCheck2 },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Timesheet', href: '/timesheet', icon: TableProperties },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
];

export const MobileNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
        <Menu className="w-5 h-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card border-border">
        <SheetHeader className="p-6 border-b border-border/60 text-left">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-9 h-9 relative rounded-xl overflow-hidden bg-white shadow-sm">
              <img src="/DevTrackLogo.png" alt="DevTrack Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground font-sans">
                DevTrack
              </span>
              <p className="text-[11px] text-muted-foreground font-normal">
                Track your work. Understand your time.
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-2xl bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Personal Edition</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            ● Local browser storage active
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
