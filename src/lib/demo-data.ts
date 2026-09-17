// ============================================================
// DevTrack — Demo Data
// ============================================================

import { Project, WorkLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

function dateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function generateDemoProjects(): Project[] {
  const now = new Date().toISOString();
  return [
    {
      id: uuidv4(),
      projectId: 'PS26INH093',
      projectName: 'Globizs Apps - Inhouse',
      description: 'Internal company applications development and maintenance',
      client: 'Globizs Technology',
      status: 'ongoing',
      billingType: 'billable',
      startDate: '2026-07-01',
      deadline: '2026-12-31',
      progress: 45,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      projectId: 'PS26TAA099',
      projectName: 'Travel Allowance App',
      description: 'Inhouse product for managing travel allowances and reimbursements',
      client: 'Globizs Technology',
      status: 'ongoing',
      billingType: 'non_billable',
      startDate: '2026-08-01',
      deadline: '2026-11-30',
      progress: 30,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      projectId: 'PS26KLM086',
      projectName: 'Kanglei Lingo Mobile Application',
      description: 'Mobile application for Kanglei language learning platform',
      client: 'Kanglei Lingo',
      status: 'ongoing',
      billingType: 'billable',
      startDate: '2026-06-15',
      deadline: '2026-10-31',
      progress: 65,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      projectId: 'PS26MTD087',
      projectName: 'Online Contractor Enlistment / MTDC Project',
      description: 'Online contractor enlistment system for MTDC',
      client: 'MTDC',
      status: 'ongoing',
      billingType: 'billable',
      startDate: '2026-07-07',
      deadline: '2026-09-30',
      progress: 72,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      projectId: 'PS26MTD088',
      projectName: 'Project Monitoring & Tracking System',
      description: 'Monitoring and tracking system for MTDC projects',
      client: 'MTDC',
      status: 'pending',
      billingType: 'billable',
      startDate: '2026-09-15',
      deadline: '2026-12-15',
      progress: 10,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      projectId: 'PS26KFS092',
      projectName: 'Kids Foundation Website',
      description: 'Website development for Kids Foundation organization',
      client: 'Kids Foundation',
      status: 'completed',
      billingType: 'billable',
      startDate: '2026-05-01',
      deadline: '2026-08-31',
      progress: 100,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      projectId: 'PS26SEC101',
      projectName: 'Security Audit & Penetration Testing',
      description: 'Security audit and pen testing for client applications',
      client: 'Various',
      status: 'upcoming',
      billingType: 'billable',
      startDate: '2026-10-01',
      deadline: '2026-10-31',
      progress: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      projectId: 'PS26WPR094',
      projectName: 'WordPress Plugin Development',
      description: 'Custom WordPress plugin for e-commerce integration',
      client: 'Client Corp',
      status: 'on_hold',
      billingType: 'billable',
      startDate: '2026-08-10',
      deadline: '2026-11-10',
      progress: 25,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function generateDemoWorkLogs(): WorkLog[] {
  const today = new Date();
  const now = new Date().toISOString();
  const monday = startOfWeek(today, { weekStartsOn: 1 });

  const descriptions: Record<string, string[]> = {
    PS26INH093: [
      'Fixed responsive layout issues on dashboard',
      'Developed user profile module',
      'API integration for notification system',
      'Code review and bug fixes',
      'Database optimization and indexing',
    ],
    PS26TAA099: [
      'Designed travel request form UI',
      'Implemented expense calculation logic',
      'Created approval workflow',
      'Mobile responsive adjustments',
      'Unit testing for allowance module',
    ],
    PS26KLM086: [
      'Flutter UI component development',
      'Implemented offline mode for lessons',
      'Audio playback integration',
      'Push notification setup',
      'Performance optimization for large datasets',
    ],
    PS26MTD087: [
      'Contractor registration form development',
      'Document upload and verification system',
      'Admin dashboard charts and reports',
      'Payment gateway integration',
      'Testing and bug fixes',
    ],
    PS26MTD088: [
      'Requirements gathering and documentation',
      'Database schema design',
      'Initial project setup and configuration',
      'Wireframe and mockup review',
      'Sprint planning and task breakdown',
    ],
    PS26KFS092: [
      'Final QA testing and deployment',
      'SEO optimization and meta tags',
      'Content migration and formatting',
      'Cross-browser compatibility testing',
      'Client training session',
    ],
  };

  const logs: WorkLog[] = [];

  // Generate logs for the current week (Mon-Fri)
  const weekConfigs = [
    // Monday
    [
      { pid: 'PS26INH093', hours: 2, type: 'billable' as const, start: '09:00', end: '11:00' },
      { pid: 'PS26KLM086', hours: 3, type: 'billable' as const, start: '11:30', end: '14:30' },
      { pid: 'PS26TAA099', hours: 2.5, type: 'non_billable' as const, start: '15:00', end: '17:30' },
    ],
    // Tuesday
    [
      { pid: 'PS26MTD087', hours: 3, type: 'billable' as const, start: '09:00', end: '12:00' },
      { pid: 'PS26INH093', hours: 2, type: 'billable' as const, start: '13:00', end: '15:00' },
      { pid: 'PS26MTD088', hours: 2, type: 'billable' as const, start: '15:30', end: '17:30' },
    ],
    // Wednesday
    [
      { pid: 'PS26KLM086', hours: 4, type: 'billable' as const, start: '09:00', end: '13:00' },
      { pid: 'PS26TAA099', hours: 2, type: 'non_billable' as const, start: '14:00', end: '16:00' },
      { pid: 'PS26INH093', hours: 1.5, type: 'billable' as const, start: '16:00', end: '17:30' },
    ],
    // Thursday
    [
      { pid: 'PS26MTD087', hours: 3.5, type: 'billable' as const, start: '09:00', end: '12:30' },
      { pid: 'PS26KLM086', hours: 2, type: 'billable' as const, start: '13:30', end: '15:30' },
      { pid: 'PS26INH093', hours: 2, type: 'billable' as const, start: '15:30', end: '17:30' },
    ],
    // Friday
    [
      { pid: 'PS26INH093', hours: 2, type: 'billable' as const, start: '09:00', end: '11:00' },
      { pid: 'PS26MTD088', hours: 3, type: 'billable' as const, start: '11:30', end: '14:30' },
      { pid: 'PS26TAA099', hours: 2, type: 'non_billable' as const, start: '15:00', end: '17:00' },
    ],
  ];

  // Current week
  for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
    const day = addDays(monday, dayIdx);
    const dayDate = dateStr(day);

    // Only add logs for days up to today
    if (day > today) continue;

    const dayConfig = weekConfigs[dayIdx];
    dayConfig.forEach((entry) => {
      const descList = descriptions[entry.pid] || ['General development work'];
      logs.push({
        id: uuidv4(),
        date: dayDate,
        projectId: entry.pid,
        workDescription: descList[dayIdx % descList.length],
        workType: entry.type,
        startTime: entry.start,
        endTime: entry.end,
        breakMinutes: 0,
        totalHours: entry.hours,
        isManualHours: false,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  // Previous week logs
  const prevMonday = subDays(monday, 7);
  for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
    const day = addDays(prevMonday, dayIdx);
    const dayDate = dateStr(day);
    const config = weekConfigs[(dayIdx + 2) % 5]; // Different pattern

    config.forEach((entry) => {
      const descList = descriptions[entry.pid] || ['General development work'];
      logs.push({
        id: uuidv4(),
        date: dayDate,
        projectId: entry.pid,
        workDescription: descList[(dayIdx + 1) % descList.length],
        workType: entry.type,
        startTime: entry.start,
        endTime: entry.end,
        breakMinutes: 0,
        totalHours: entry.hours,
        isManualHours: false,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  return logs;
}
