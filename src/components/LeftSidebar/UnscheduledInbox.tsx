'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Task, TaskPriority } from '@/types';
import {
  Inbox,
  Plus,
  GripVertical,
  Calendar,
  Trash2,
  AlertCircle,
  Flame,
  Zap,
} from 'lucide-react';

export default function UnscheduledInbox() {
  const {
    unscheduledTasks,
    addTask,
    deleteTask,
    openQuickSchedule,
    dayTimeblocks,
  } = useDashboard();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('must');
  const [estMinutes, setEstMinutes] = useState<number>(30);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), priority, estMinutes);
    setTitle('');
    setIsCapturing(false);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('application/x-task-id', task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Find next available hour slot for quick snapping
  const findNextFreeSlot = (): string => {
    const plannedHours = new Set(dayTimeblocks.map((b) => b.startTime.split(':')[0]));
    const now = new Date();
    const currentHour = Math.max(9, now.getHours());
    for (let h = currentHour; h < 24; h++) {
      const hStr = String(h).padStart(2, '0');
      if (!plannedHours.has(hStr)) {
        return `${hStr}:00`;
      }
    }
    return '10:00';
  };

  const renderPriorityBadge = (p: TaskPriority) => {
    if (p === 'must') {
      return (
        <span className="flex items-center gap-0.5 rounded bg-rose-500/15 px-1 py-0.2 font-mono text-[9px] font-bold text-rose-400 shrink-0">
          <AlertCircle className="h-2.5 w-2.5" />
          P1
        </span>
      );
    } else if (p === 'should') {
      return (
        <span className="flex items-center gap-0.5 rounded bg-amber-500/15 px-1 py-0.2 font-mono text-[9px] font-bold text-amber-400 shrink-0">
          <Flame className="h-2.5 w-2.5" />
          P2
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-0.5 rounded bg-emerald-500/15 px-1 py-0.2 font-mono text-[9px] font-bold text-emerald-400 shrink-0">
          <Zap className="h-2.5 w-2.5" />
          P3
        </span>
      );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-xs flex flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-rose-500" />
          <h3 className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
            Unscheduled Inbox
          </h3>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
            {unscheduledTasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCapturing(!isCapturing)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-700/60 bg-slate-800/80 text-slate-400 hover:border-slate-600 hover:text-white transition-colors"
          title="Quick capture new task"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Quick Capture Input Form */}
      {isCapturing && (
        <form onSubmit={handleCapture} className="mb-3 space-y-2 rounded-lg border border-slate-700 bg-slate-800/70 p-2.5">
          <input
            type="text"
            placeholder="What needs to be done?..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
          />

          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="flex items-center gap-1 font-mono text-[10px]">
              {(['must', 'should', 'quick_win'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded px-1.5 py-0.5 font-bold uppercase transition-colors ${
                    priority === p
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p === 'quick_win' ? 'P3' : p === 'must' ? 'P1' : 'P2'}
                </button>
              ))}
            </div>

            <select
              value={estMinutes}
              onChange={(e) => setEstMinutes(Number(e.target.value))}
              className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 focus:outline-none"
            >
              {[15, 30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>
                  {m}m
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsCapturing(false)}
              className="rounded px-2 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-500 shadow-xs"
            >
              Add to Inbox
            </button>
          </div>
        </form>
      )}

      {/* List of Unscheduled Tasks */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-72 custom-timeline-scrollbar pr-0.5">
        {unscheduledTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
            <Inbox className="h-6 w-6 text-slate-600 mb-1" />
            <p className="font-mono text-xs font-semibold text-slate-400">
              Inbox is empty
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5">
              No pending tasks to schedule
            </span>
            <button
              type="button"
              onClick={() => setIsCapturing(true)}
              className="mt-3 flex items-center gap-1 rounded bg-slate-800 hover:bg-rose-600 hover:text-white px-2.5 py-1 text-xs text-slate-300 transition-colors font-mono"
            >
              <Plus className="h-3 w-3" />
              <span>Add your first task</span>
            </button>
          </div>
        ) : (
          unscheduledTasks.map((task) => (
            <div
              key={task.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, task)}
              className="group flex items-center justify-between gap-2 rounded-lg border border-slate-800/90 bg-slate-900/80 px-2.5 py-1.5 transition-all hover:border-slate-700 hover:bg-slate-800/60 cursor-grab active:cursor-grabbing"
            >
              {/* Left Part: Grip, Title (truncated), Priority badge, Duration */}
              <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
                <div
                  className="text-slate-600 group-hover:text-slate-400 shrink-0"
                  title="Drag directly to timeline"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </div>

                <span
                  className="truncate text-xs font-medium text-slate-200"
                  title={task.title}
                >
                  {task.title}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {renderPriorityBadge(task.priority)}
                  <span className="font-mono text-[10px] text-slate-400">{task.estimatedMinutes}m</span>
                </div>
              </div>

              {/* Right Part: Schedule button & Delete action */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const freeSlot = findNextFreeSlot();
                    openQuickSchedule({
                      defaultTime: freeSlot,
                      defaultTaskId: task.id,
                      defaultDuration: task.estimatedMinutes,
                    });
                  }}
                  className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-300 hover:bg-rose-600 hover:text-white transition-colors"
                  title="Schedule on timeline"
                >
                  <Calendar className="h-2.5 w-2.5" />
                  <span>Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-500 transition-opacity p-0.5"
                  title="Delete task"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
