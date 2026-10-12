'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { X, Clock, AlertCircle, Flame, Zap, Trash2, Tag } from 'lucide-react';
import { TaskPriority, TimeBlockCategory } from '@/types';

const priorityOptions: {
  key: TaskPriority;
  label: string;
  badge: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'must',
    label: 'Must Do [P1]',
    badge: 'border-rose-500 bg-rose-500/10 text-rose-500 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-300',
    icon: <AlertCircle className="h-3.5 w-3.5 text-rose-500" />,
  },
  {
    key: 'should',
    label: 'Should Do [P2]',
    badge: 'border-amber-500 bg-amber-500/10 text-amber-500 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300',
    icon: <Flame className="h-3.5 w-3.5 text-amber-500" />,
  },
  {
    key: 'quick_win',
    label: 'Quick Win [P3]',
    badge: 'border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300',
    icon: <Zap className="h-3.5 w-3.5 text-emerald-500" />,
  },
];

const categoryOptions: { key: TimeBlockCategory; label: string; color: string }[] = [
  { key: 'deep_work', label: 'Deep Work', color: '#f43f5e' },
  { key: 'meeting', label: 'Meeting', color: '#f59e0b' },
  { key: 'admin', label: 'Admin', color: '#10b981' },
  { key: 'health', label: 'Health', color: '#0ea5e9' },
  { key: 'break', label: 'Review / Break', color: '#8b5cf6' },
  { key: 'personal', label: 'Personal', color: '#ec4899' },
];

const durationPills = [15, 30, 45, 60, 90];

export default function QuickScheduleModal() {
  const {
    quickScheduleModal,
    closeQuickSchedule,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    timeblocks,
    tasks,
    selectedDate,
  } = useDashboard();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('must');
  const [duration, setDuration] = useState<number>(30);
  const [category, setCategory] = useState<TimeBlockCategory>('deep_work');
  const [startTime, setStartTime] = useState('09:00');

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (quickScheduleModal.isOpen) {
      if (quickScheduleModal.editBlockId) {
        // Editing existing block
        const block = timeblocks.find((b) => b.id === quickScheduleModal.editBlockId);
        if (block) {
          setTitle(block.title);
          setPriority(block.priority || 'must');
          setDuration(block.durationMinutes);
          setCategory(block.category);
          setStartTime(block.startTime);
        }
      } else if (quickScheduleModal.defaultTaskId) {
        // Scheduling from unscheduled task
        const task = tasks.find((t) => t.id === quickScheduleModal.defaultTaskId);
        if (task) {
          setTitle(task.title);
          setPriority(task.priority);
          setDuration(task.estimatedMinutes);
          setCategory(task.priority === 'must' ? 'deep_work' : task.priority === 'should' ? 'meeting' : 'admin');
          setStartTime(quickScheduleModal.defaultTime || '09:00');
        }
      } else {
        // Brand new schedule on slot
        setTitle('');
        setPriority('must');
        setDuration(quickScheduleModal.defaultDuration || 30);
        setCategory('deep_work');
        setStartTime(quickScheduleModal.defaultTime || '09:00');
      }

      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [quickScheduleModal, timeblocks, tasks]);

  if (!quickScheduleModal.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Calculate endTime
    const [startH, startM] = startTime.split(':').map(Number);
    const totalM = startH * 60 + startM + duration;
    const endH = Math.min(23, Math.floor(totalM / 60));
    const endMin = Math.min(59, totalM % 60);
    const endTime = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const catObj = categoryOptions.find((c) => c.key === category);

    if (quickScheduleModal.editBlockId) {
      // Update block
      updateTimeBlock(quickScheduleModal.editBlockId, {
        title: title.trim(),
        startTime,
        endTime,
        durationMinutes: duration,
        category,
        priority,
        color: catObj?.color || '#f43f5e',
      });
    } else {
      // Add new block
      addTimeBlock({
        date: selectedDate,
        title: title.trim(),
        startTime,
        endTime,
        durationMinutes: duration,
        category,
        priority,
        color: catObj?.color || '#f43f5e',
        taskId: quickScheduleModal.defaultTaskId || null,
        completed: false,
      });
    }

    closeQuickSchedule();
  };

  const handleDelete = () => {
    if (quickScheduleModal.editBlockId) {
      deleteTimeBlock(quickScheduleModal.editBlockId);
      closeQuickSchedule();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-xl border border-slate-700/80 bg-slate-900 p-5 shadow-2xl dark:border-slate-800 dark:bg-[#0f1117]">
        {/* Close Button */}
        <button
          onClick={closeQuickSchedule}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {quickScheduleModal.editBlockId ? 'Edit Scheduled Block' : 'Quick Schedule'}
            </h3>
            <p className="font-mono text-xs text-slate-400">
              {startTime} · {duration} min
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title Input */}
          <div>
            <label className="mb-1 block font-mono text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
              Task Title
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Deploy Docker cluster, Sprint review..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Priority Tier Selector */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
              Priority Tier
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPriority(opt.key)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? opt.badge
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Pills */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-mono text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                Duration
              </label>
              <span className="font-mono text-xs font-bold text-rose-400">
                {duration} minutes
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {durationPills.map((m) => {
                const isSelected = duration === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={`rounded-lg border py-1 font-mono text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Tag & Start Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-1 font-mono text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                <Tag className="h-3 w-3 text-slate-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TimeBlockCategory)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 font-mono text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                {categoryOptions.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 font-mono text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                <Clock className="h-3 w-3 text-slate-400" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 font-mono text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {quickScheduleModal.editBlockId ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeQuickSchedule}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 focus:ring-2 focus:ring-rose-500/50"
              >
                {quickScheduleModal.editBlockId ? 'Save Changes' : 'Schedule on Clock'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
