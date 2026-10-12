'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthNavigator() {
  const { selectedDate, setSelectedDate, tasks, habitLogs } = useDashboard();

  // Active view month based on selectedDate
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday as 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 1 : month + 2;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-xs">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-slate-200">
          {monthName}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center font-mono text-[10px] text-slate-500">
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
        <span>Su</span>
      </div>

      {/* Days grid */}
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          const isDayToday = item.dateStr === todayStr;

          // Check if there is activity on this date
          const hasTasks = tasks.some((t) => t.date === item.dateStr);
          const hasHabits = habitLogs.some((l) => l.date === item.dateStr && l.completed);

          return (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`group relative flex h-7 flex-col items-center justify-center rounded-md font-mono text-xs transition-colors ${
                !item.isCurrentMonth
                  ? 'text-slate-600'
                  : isSelected
                  ? 'bg-rose-600 font-bold text-white shadow-xs'
                  : isDayToday
                  ? 'border border-rose-500/60 font-semibold text-rose-400'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span>{item.dayNum}</span>

              {/* Activity indicator dot */}
              {(hasTasks || hasHabits) && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isSelected
                      ? 'bg-white'
                      : hasHabits
                      ? 'bg-emerald-400'
                      : 'bg-rose-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
