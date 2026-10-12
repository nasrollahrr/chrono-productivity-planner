'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Command,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  Circle,
  Edit2,
  Calendar as CalendarIcon,
  PieChart,
  Bell,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Header() {
  const {
    selectedDate,
    goToToday,
    goToPrevDay,
    goToNextDay,
    isToday,
    theme,
    toggleTheme,
    isSidebarOpen,
    toggleSidebar,
    plannedStats,
    currentGoal,
    updateGoal,
    openReviewModal,
    openCommandPalette,
    openShortcuts,
    currentReview,
    notificationPermission,
    requestNotificationPermission,
    triggerTestReminder,
  } = useDashboard();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState(currentGoal?.title || '');

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDay = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const handleSaveGoal = () => {
    if (goalTitle.trim()) {
      updateGoal({ title: goalTitle.trim() });
    }
    setIsEditingGoal(false);
  };

  const handleToggleGoalWon = () => {
    const nextVal = !currentGoal?.completed;
    updateGoal({ completed: nextVal });
    if (nextVal) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.1 },
      });
    }
  };

  const handleToggleNotifications = async () => {
    if (notificationPermission === 'granted') {
      // Play test synthesized chime and dispatch test notification
      triggerTestReminder();
    } else if (notificationPermission === 'default') {
      await requestNotificationPermission();
    } else if (notificationPermission === 'denied') {
      alert('Browser notifications are currently blocked in site settings. Enable them in browser permissions for desktop alerts.');
    } else {
      triggerTestReminder();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#090b10]/95 px-3 backdrop-blur dark:bg-[#090b10]/95">
      {/* 1. Main Slim Control Bar */}
      <div className="flex h-12 items-center justify-between gap-3">
        {/* Left: Sidebar Toggle, Brand, Date Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Toggle Sidebar Button */}
          <button
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftOpen className="h-3.5 w-3.5 text-rose-400" />
            )}
          </button>

          {/* Brand */}
          <div className="flex items-center gap-1.5 pr-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-600 text-white font-mono text-xs font-bold shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="hidden font-mono text-xs font-black tracking-wider text-slate-100 uppercase sm:inline-block">
              CHRONO<span className="text-rose-500">·PRO</span>
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-800" />

          {/* Date Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevDay}
              title="Previous Day ([)"
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={goToToday}
              className={`rounded px-2 py-0.5 font-mono text-xs font-semibold transition-colors ${
                isToday
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Today
            </button>

            <button
              onClick={goToNextDay}
              title="Next Day (])"
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <div className="ml-1 flex items-center gap-1.5 rounded bg-slate-900/60 px-2 py-0.5 font-mono text-xs font-bold text-slate-200 border border-slate-800/80">
              <CalendarIcon className="h-3 w-3 text-rose-500" />
              <span>
                <span className="text-slate-400">{formattedDay}, </span>
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-1 font-mono text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <Command className="h-3 w-3 text-rose-500" />
            <span>Search or command...</span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Stats, Debrief, Actions */}
        <div className="flex items-center gap-2">
          {/* Hours Planned vs Free */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-slate-800/90 bg-slate-900/80 px-2 py-1 font-mono text-[11px] text-slate-300">
            <PieChart className="h-3 w-3 text-rose-400" />
            <span>
              <span className="font-bold text-rose-400">{plannedStats.hoursPlannedFormatted}</span>
              <span className="text-slate-500"> planned · </span>
              <span className="text-emerald-400">{plannedStats.hoursFreeFormatted}</span>
              <span className="text-slate-500"> free</span>
            </span>
          </div>

          {/* Completed counter */}
          <div className="hidden md:flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <span>
              {plannedStats.completedTasksCount}/{plannedStats.totalTasksCount} done
            </span>
          </div>

          {/* Shutdown Review Button */}
          <button
            onClick={openReviewModal}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
              currentReview
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-600 text-white shadow-xs hover:bg-rose-500'
            }`}
            title="End-of-day 2-minute review & task roll (R)"
          >
            <span>🌙</span>
            <span className="hidden sm:inline">
              {currentReview ? 'Debriefed' : 'Daily Debrief'}
            </span>
            <span className="font-mono text-[10px] opacity-80">(2m)</span>
          </button>

          {/* Proactive 15-Minute Task Reminder Bell */}
          <button
            onClick={handleToggleNotifications}
            title={
              notificationPermission === 'granted'
                ? 'Reminders Active (15m alerts enabled) • Click to test audio chime'
                : notificationPermission === 'denied'
                ? 'Reminders Blocked in Browser Settings'
                : 'Enable 15-minute proactive task reminders'
            }
            className={`relative flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
              notificationPermission === 'granted'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : notificationPermission === 'denied'
                ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                : 'border-slate-800 bg-slate-900/80 text-amber-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            {/* Visual Permission Status Indicator Dot */}
            {notificationPermission === 'granted' && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            )}
            {notificationPermission === 'default' && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
            {notificationPermission === 'denied' && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Shortcuts Help */}
          <button
            onClick={openShortcuts}
            title="Keyboard Shortcuts (?)"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Light / Dark Mode (D)"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-rose-400" />}
          </button>
        </div>
      </div>

      {/* 2. Pinned "North Star" Sleek Single-Line Banner */}
      <div className="flex h-7 items-center justify-between border-t border-slate-800/80 px-1 text-xs">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-rose-400 uppercase shrink-0">
            <span>🎯</span>
            <span>North Star</span>
          </span>

          {isEditingGoal ? (
            <div className="flex items-center gap-1.5 flex-1 max-w-xl">
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                autoFocus
                className="flex-1 rounded border border-rose-500 bg-slate-900 px-2 py-0.5 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveGoal}
                className="rounded bg-rose-600 px-2 py-0.5 font-mono text-[10px] font-bold text-white hover:bg-rose-500"
              >
                Save
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setGoalTitle(currentGoal?.title || '');
                setIsEditingGoal(true);
              }}
              className="group flex cursor-pointer items-center gap-1.5 truncate"
            >
              <span
                className={`truncate font-medium transition-colors ${
                  currentGoal?.completed
                    ? 'line-through text-slate-500'
                    : 'text-slate-200 hover:text-rose-300'
                }`}
              >
                {currentGoal?.title || 'Click to set today’s singular focus objective...'}
              </span>
              <Edit2 className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100" />
            </div>
          )}
        </div>

        {/* Check Done / Won status */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          <button
            onClick={handleToggleGoalWon}
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold transition-all ${
              currentGoal?.completed
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            {currentGoal?.completed ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Victory Achieved</span>
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" />
                <span>Mark Done</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
