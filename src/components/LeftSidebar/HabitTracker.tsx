'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Flame, Plus, Check, Trash2, Zap, Droplet, Activity, Moon, BookOpen, Target } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="h-3.5 w-3.5 text-amber-500" />,
  droplet: <Droplet className="h-3.5 w-3.5 text-sky-500" />,
  activity: <Activity className="h-3.5 w-3.5 text-emerald-500" />,
  moon: <Moon className="h-3.5 w-3.5 text-indigo-400" />,
  book: <BookOpen className="h-3.5 w-3.5 text-purple-400" />,
  target: <Target className="h-3.5 w-3.5 text-rose-400" />,
};

export default function HabitTracker() {
  const { habitsWithStreaks, toggleHabit, addHabit, deleteHabit, selectedDate } = useDashboard();
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    addHabit(newHabitTitle.trim(), 'zap', 7);
    setNewHabitTitle('');
    setIsAdding(false);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-xs flex flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
          <h3 className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
            Habit Streaks
          </h3>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
            {habitsWithStreaks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-700/60 bg-slate-800/80 text-slate-400 hover:border-slate-600 hover:text-white transition-colors"
          title="Add Habit"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Add Habit Input */}
      {isAdding && (
        <form onSubmit={handleAddHabit} className="mb-3 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2">
          <input
            type="text"
            placeholder="New habit name..."
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            autoFocus
            className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500 shadow-xs"
          >
            Add
          </button>
        </form>
      )}

      {/* Habits List */}
      <div className="space-y-2">
        {habitsWithStreaks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
            <Flame className="h-6 w-6 text-slate-600 mb-1" />
            <p className="font-mono text-xs font-semibold text-slate-400">
              No habits tracked
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Build momentum day by day
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-3 flex items-center gap-1 rounded bg-slate-800 hover:bg-amber-600 hover:text-white px-2.5 py-1 text-xs text-slate-300 transition-colors font-mono"
            >
              <Plus className="h-3 w-3" />
              <span>Track your first habit</span>
            </button>
          </div>
        ) : (
          habitsWithStreaks.map((habit) => {
            const isDoneToday = habit.isCompletedToday;
            const habitIcon = iconMap[habit.icon] || <Zap className="h-3.5 w-3.5 text-indigo-400" />;

            return (
              <div
                key={habit.id}
                className="group flex flex-col gap-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 transition-colors hover:border-slate-700 hover:bg-slate-800/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                    {/* Checkbox button */}
                    <button
                      type="button"
                      onClick={() => toggleHabit(habit.id, selectedDate)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all ${
                        isDoneToday
                          ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/20'
                          : 'border border-slate-700 bg-slate-800 hover:border-slate-500'
                      }`}
                    >
                      {isDoneToday && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>

                    <div className="shrink-0">{habitIcon}</div>

                    <span
                      onClick={() => toggleHabit(habit.id, selectedDate)}
                      className={`cursor-pointer truncate text-xs font-medium transition-colors ${
                        isDoneToday
                          ? 'text-slate-500 line-through'
                          : 'text-slate-200 hover:text-white'
                      }`}
                      title={habit.title}
                    >
                      {habit.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Streak badge */}
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        habit.currentStreak > 0
                          ? 'border border-amber-500/30 bg-amber-500/20 text-amber-300'
                          : 'text-slate-500'
                      }`}
                      title={`Current consecutive streak: ${habit.currentStreak} days`}
                    >
                      <span>🔥</span>
                      <span>{habit.currentStreak}d</span>
                    </span>

                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                      title="Delete habit"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Mini Sparkline / Completion Dots */}
                <div className="flex items-center justify-between pl-6 pr-1">
                  <div className="flex items-center gap-1">
                    {habit.weeklyLogs.map((log) => (
                      <span
                        key={log.date}
                        title={`${log.date}: ${log.completed ? 'Completed' : 'Missed'}`}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          log.completed
                            ? 'bg-emerald-500 shadow-xs shadow-emerald-500/40'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-slate-500">
                    7-day trend
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
