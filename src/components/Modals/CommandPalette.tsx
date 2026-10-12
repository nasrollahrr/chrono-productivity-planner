'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Search,
  CheckSquare,
  Clock,
  Moon,
  Calendar,
  Sun,
  Maximize2,
  HelpCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { TaskPriority } from '@/types';

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    addTask,
    openQuickSchedule,
    openReviewModal,
    openShortcuts,
    goToToday,
    goToPrevDay,
    goToNextDay,
    toggleTheme,
    toggleSidebar,
    theme,
  } = useDashboard();

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'quick_task'>('search');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('must');
  const [taskMinutes, setTaskMinutes] = useState(30);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setMode('search');
      setTaskTitle('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask(taskTitle.trim(), taskPriority, taskMinutes);
    closeCommandPalette();
  };

  const commands = [
    {
      id: 'new_task',
      title: 'Quick Capture Task',
      subtitle: 'Add Must Do, Should Do, or Quick Win task',
      icon: <CheckSquare className="h-4 w-4 text-indigo-500" />,
      action: () => setMode('quick_task'),
      badge: 'N',
    },
    {
      id: 'new_event',
      title: 'Schedule Time Block',
      subtitle: 'Create a dedicated block on the timeline engine',
      icon: <Clock className="h-4 w-4 text-emerald-500" />,
      action: () => {
        closeCommandPalette();
        const now = new Date();
        const curHour = `${String(now.getHours()).padStart(2, '0')}:00`;
        openQuickSchedule({ defaultTime: curHour });
      },
      badge: 'B',
    },
    {
      id: 'review',
      title: 'Daily 2-Minute Debrief',
      subtitle: 'Evening shutdown & roll unfinished tasks',
      icon: <Moon className="h-4 w-4 text-purple-500" />,
      action: () => {
        closeCommandPalette();
        openReviewModal();
      },
      badge: 'R',
    },
    {
      id: 'today',
      title: 'Jump to Today',
      subtitle: 'Return to current calendar date',
      icon: <Calendar className="h-4 w-4 text-sky-500" />,
      action: () => {
        goToToday();
        closeCommandPalette();
      },
      badge: 'T',
    },
    {
      id: 'prev_day',
      title: 'Previous Day',
      subtitle: 'View yesterday’s logs and tasks',
      icon: <ArrowRight className="h-4 w-4 rotate-180 text-neutral-400" />,
      action: () => {
        goToPrevDay();
        closeCommandPalette();
      },
      badge: '[',
    },
    {
      id: 'next_day',
      title: 'Next Day',
      subtitle: 'Plan ahead for tomorrow',
      icon: <ArrowRight className="h-4 w-4 text-neutral-400" />,
      action: () => {
        goToNextDay();
        closeCommandPalette();
      },
      badge: ']',
    },
    {
      id: 'focus',
      title: 'Toggle Left Sidebar (Inbox & Habits)',
      subtitle: 'Collapse or expand left sidebar to maximize timeline canvas',
      icon: <Maximize2 className="h-4 w-4 text-amber-500" />,
      action: () => {
        toggleSidebar();
        closeCommandPalette();
      },
      badge: 'F',
    },
    {
      id: 'theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: 'Toggle dashboard visual contrast theme',
      icon: theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />,
      action: () => {
        toggleTheme();
        closeCommandPalette();
      },
      badge: 'D',
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts Cheatsheet',
      subtitle: 'View all keyboard navigation bindings',
      icon: <HelpCircle className="h-4 w-4 text-neutral-400" />,
      action: () => {
        closeCommandPalette();
        openShortcuts();
      },
      badge: '?',
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#121215]">
        {/* Close */}
        <button
          onClick={closeCommandPalette}
          className="absolute top-3.5 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>

        {mode === 'search' ? (
          <div>
            {/* Search Input */}
            <div className="flex items-center border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <Search className="mr-2.5 h-4 w-4 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-white dark:placeholder-neutral-500"
              />
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        {item.badge}
                      </kbd>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Quick Task Capture Submode */
          <form onSubmit={handleQuickTaskSubmit} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="h-4 w-4" />
                <span>Quick Capture New Task</span>
              </div>
              <button
                type="button"
                onClick={() => setMode('search')}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Back to search
              </button>
            </div>

            <input
              type="text"
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-sm text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['must', 'should', 'quick_win'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaskPriority(p)}
                    className={`rounded px-2 py-1 font-mono text-xs uppercase font-bold transition-all ${
                      taskPriority === p
                        ? 'bg-indigo-600 text-white'
                        : 'border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {p === 'quick_win' ? 'Quick Win' : p}
                  </button>
                ))}
              </div>

              <select
                value={taskMinutes}
                onChange={(e) => setTaskMinutes(Number(e.target.value))}
                className="rounded border border-neutral-300 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {[15, 30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeCommandPalette}
                className="rounded px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Create Task
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
