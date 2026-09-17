'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Plus, Sun, Moon, Laptop, Calendar as CalendarIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/components/providers/DataProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { MobileNav } from './MobileNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Header: React.FC = () => {
  const { setQuickAddOpen } = useData();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const formattedDate = format(today, 'EEEE, d MMMM yyyy');
  const formattedWeek = `${format(weekStart, 'd')} - ${format(weekEnd, 'd MMM')}`;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors">
      {/* Left side: Mobile menu & Date info */}
      <div className="flex items-center gap-3">
        <MobileNav />

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <CalendarIcon className="w-4 h-4 text-primary shrink-0 hidden sm:inline" />
            <span>{mounted ? formattedDate : 'Loading date...'}</span>
          </div>
          <span className="hidden sm:inline text-muted-foreground/40">•</span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
            <span className="font-semibold">Week:</span>
            <span>{mounted ? formattedWeek : ''}</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions & User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Work Button */}
        <Button
          onClick={() => setQuickAddOpen(true)}
          className="rounded-xl h-9 sm:h-10 px-3.5 sm:px-4 font-medium shadow-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Work</span>
        </Button>

        {/* Theme Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl h-9 w-9 sm:h-10 sm:w-10 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 text-xs">
              <Sun className="w-4 h-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 text-xs">
              <Moon className="w-4 h-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 text-xs">
              <Laptop className="w-4 h-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Personal Avatar */}
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-border/80 bg-muted/60">
          <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs">
            DEV
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
