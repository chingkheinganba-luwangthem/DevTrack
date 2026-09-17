'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickAddWork } from '@/components/work-log/QuickAddWork';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { DataProvider } from '@/components/providers/DataProvider';
import { Toaster } from '@/components/ui/sonner';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <DataProvider>
        <div className="min-h-screen bg-background text-foreground flex">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Global Quick Add Work Modal */}
          <QuickAddWork />

          {/* Sonner Toast Container */}
          <Toaster position="bottom-right" richColors closeButton />
        </div>
      </DataProvider>
    </ThemeProvider>
  );
};
