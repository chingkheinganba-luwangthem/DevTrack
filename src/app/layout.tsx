import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'DevTrack — Modern Project & Daily Timesheet Tracker',
  description: 'Track your work. Understand your time. A futuristic personal timesheet and project tracking dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
