'use client';

import React from 'react';
import MonthNavigator from './MonthNavigator';
import UnscheduledInbox from './UnscheduledInbox';
import HabitTracker from './HabitTracker';
import { useDashboard } from '@/context/DashboardContext';

export default function LeftSidebar() {
  const { isSidebarOpen } = useDashboard();

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] custom-timeline-scrollbar pr-1 pb-8 transition-all select-none">
      {/* 1. Mini-Calendar Month Navigator Card */}
      <MonthNavigator />

      {/* 2. Unscheduled Inbox / Backlog Card */}
      <UnscheduledInbox />

      {/* 3. Daily Habit Tracker with Streaks Card */}
      <HabitTracker />
    </aside>
  );
}
