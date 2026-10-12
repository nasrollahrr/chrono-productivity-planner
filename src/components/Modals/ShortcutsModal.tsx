'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { X, Keyboard } from 'lucide-react';

const shortcutsList = [
  { key: 'N', desc: 'Quick-add block into current hour slot' },
  { key: 'T', desc: 'Jump to Today' },
  { key: '⌘K / Ctrl+K', desc: 'Open Command Palette & Quick Capture' },
  { key: '[', desc: 'Navigate to Previous Day' },
  { key: ']', desc: 'Navigate to Next Day' },
  { key: 'R', desc: 'Trigger 2-minute daily debrief & task roll' },
  { key: 'D', desc: 'Toggle Dark / Light Mode' },
  { key: 'Drag & Drop', desc: 'Drag any inbox task onto timeline slot' },
  { key: 'Resize', desc: 'Drag bottom handle or +/- buttons to adjust duration' },
  { key: '?', desc: 'Show / hide keyboard shortcuts' },
];

export default function ShortcutsModal() {
  const { isShortcutsOpen, closeShortcuts } = useDashboard();

  if (!isShortcutsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-[#121215]">
        {/* Close Button */}
        <button
          onClick={closeShortcuts}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Keyboard className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 sm:text-base dark:text-white">
              Keyboard Navigation
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Navigate and capture at the speed of thought
            </p>
          </div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {shortcutsList.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 text-xs">
              <span className="text-neutral-600 dark:text-neutral-300">{s.desc}</span>
              <kbd className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={closeShortcuts}
            className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
