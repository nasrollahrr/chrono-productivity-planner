'use client';

import React from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar/LeftSidebar';
import TimelineGrid from './Timeline/TimelineGrid';
import QuickScheduleModal from './Modals/QuickScheduleModal';
import EndOfDayReviewModal from './Modals/EndOfDayReviewModal';
import CommandPalette from './Modals/CommandPalette';
import ShortcutsModal from './Modals/ShortcutsModal';
import NotificationToast from './Notifications/NotificationToast';
import { useDashboard } from '@/context/DashboardContext';

export default function DashboardLayout() {
  const { activeNotificationToasts, dismissNotificationToast } = useDashboard();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#07090e] text-slate-100 font-sans">
      {/* 1. Slim & Compact Sticky Header with Pinned North Star Banner */}
      <Header />

      {/* 2. Main Canvas Layout: Collapsible Left Sidebar + Dominant Timeline Grid */}
      <div className="flex flex-1 overflow-hidden p-2.5 sm:p-3 gap-3">
        {/* Left Sidebar (25-30% width: Mini-Calendar, Unscheduled Inbox, Habit Tracker) */}
        <LeftSidebar />

        {/* Hero Element: Dominant 24h Time-Blocking Timeline (70-75% width) */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          <TimelineGrid />
        </main>
      </div>

      {/* Interactive Global Modals */}
      <QuickScheduleModal />
      <EndOfDayReviewModal />
      <CommandPalette />
      <ShortcutsModal />

      {/* Proactive In-App 15-Minute Task Reminder Toast Notifications */}
      <NotificationToast
        toasts={activeNotificationToasts}
        onDismiss={dismissNotificationToast}
      />
    </div>
  );
}
