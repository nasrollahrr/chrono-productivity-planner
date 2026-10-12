'use client';

import React, { useEffect } from 'react';
import { ReminderToast } from '@/hooks/useTaskReminders';
import { X, Clock, AlertCircle, Flame, Zap, Bell } from 'lucide-react';

interface NotificationToastProps {
  toasts: ReminderToast[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-88">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ReminderToast; onDismiss: (id: string) => void }) {
  // Auto-dismiss after 9 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 9000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const renderPriorityBadge = () => {
    if (toast.priority === 'must') {
      return (
        <span className="flex items-center gap-1 rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300">
          <AlertCircle className="h-2.5 w-2.5 text-rose-400" />
          P1 Must Do
        </span>
      );
    } else if (toast.priority === 'should') {
      return (
        <span className="flex items-center gap-1 rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
          <Flame className="h-2.5 w-2.5 text-amber-400" />
          P2 Should Do
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
          <Zap className="h-2.5 w-2.5 text-emerald-400" />
          P3 Quick Win
        </span>
      );
    }
  };

  return (
    <div className="pointer-events-auto relative overflow-hidden rounded-xl border border-rose-500/60 bg-[#0f111a]/95 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:border-rose-400">
      {/* Top alert bar */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-rose-400">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20">
            <Bell className="h-3 w-3 text-rose-400 animate-bounce" />
          </div>
          <span className="font-mono text-xs font-bold tracking-wide uppercase">
            Upcoming Task in 15 Minutes
          </span>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Task Title */}
      <h4 className="mb-2 text-sm font-bold text-slate-100 truncate">
        {toast.title}
      </h4>

      {/* Metadata Row: Time, Duration, Priority Badge */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Clock className="h-3 w-3 text-rose-400" />
            <span>{toast.startTime}</span>
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-semibold text-slate-300">
            {toast.durationMinutes}m
          </span>
        </div>

        {renderPriorityBadge()}
      </div>

      {/* Visual countdown progress line */}
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-800">
        <div className="h-full bg-rose-500 animate-[pulse_2s_infinite]" />
      </div>
    </div>
  );
}
