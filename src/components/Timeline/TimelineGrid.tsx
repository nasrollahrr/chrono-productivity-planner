'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { TimeBlock, TaskPriority } from '@/types';
import {
  Clock,
  Plus,
  Check,
  Trash2,
  Inbox,
  AlertCircle,
  Flame,
  Zap,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const HOUR_HEIGHT = 52; // 52px per hour ensures high density (8-10 hours visible)
const START_HOUR = 0;  // 00:00 (Full 24-hour day starting at midnight)
const END_HOUR = 24;   // 24:00 (Spanning to 23:59 and ending at midnight boundary)

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

export default function TimelineGrid() {
  const {
    dayTimeblocks,
    updateTimeBlock,
    deleteTimeBlock,
    unscheduleTimeBlock,
    resizeTimeBlock,
    dropTaskOnSlot,
    openQuickSchedule,
    isToday,
    plannedStats,
  } = useDashboard();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredSlotTime, setHoveredSlotTime] = useState<string | null>(null);
  const [dragOverTime, setDragOverTime] = useState<string | null>(null);

  // Live Current Time
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentTimeMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Smart initial auto-scroll: automatically centers current time slot & live indicator in viewport
  const hasAutoScrolledRef = useRef(false);

  useEffect(() => {
    if (hasAutoScrolledRef.current) return;
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const lineTop = (currentTimeMinutes / 60) * HOUR_HEIGHT;
        const containerHeight = scrollRef.current.clientHeight || 550;
        // Center the current time indicator in the visible viewport
        const targetScrollTop = Math.max(0, lineTop - containerHeight / 2);

        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
        hasAutoScrolledRef.current = true;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentTimeMinutes]);

  // Generate 24 hourly slots (00:00 to 23:00) with 30-min subdivisions
  const hoursList = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  // Drag over handlers
  const handleDragOver = (e: React.DragEvent, timeStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverTime !== timeStr) {
      setDragOverTime(timeStr);
    }
  };

  const handleDragLeave = () => {
    setDragOverTime(null);
  };

  const handleDrop = (e: React.DragEvent, timeStr: string) => {
    e.preventDefault();
    setDragOverTime(null);
    const taskId = e.dataTransfer.getData('application/x-task-id') || e.dataTransfer.getData('text/plain');
    if (taskId) {
      dropTaskOnSlot(taskId, timeStr);
    }
  };

  // Live indicator vertical position
  const currentLineTop = ((currentTimeMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const isLineVisible = isToday && currentTimeMinutes >= START_HOUR * 60 && currentTimeMinutes <= END_HOUR * 60;

  // Render priority badge
  const renderPriorityBadge = (priority: TaskPriority = 'must') => {
    if (priority === 'must') {
      return (
        <span className="flex items-center gap-0.5 rounded bg-rose-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-rose-300">
          <AlertCircle className="h-2.5 w-2.5 text-rose-400" />
          P1
        </span>
      );
    } else if (priority === 'should') {
      return (
        <span className="flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amber-300">
          <Flame className="h-2.5 w-2.5 text-amber-400" />
          P2
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-300">
          <Zap className="h-2.5 w-2.5 text-emerald-400" />
          P3
        </span>
      );
    }
  };

  // Get block styling according to priority
  const getBlockStyle = (block: TimeBlock) => {
    const priority = block.priority || 'must';
    if (priority === 'must') {
      return {
        card: 'border border-rose-500/70 bg-rose-950/40 text-rose-100 shadow-[0_0_14px_rgba(244,63,94,0.12)] hover:border-rose-400',
        bar: 'bg-rose-500',
        text: 'text-rose-100',
        glow: 'shadow-rose-500/20',
      };
    } else if (priority === 'should') {
      return {
        card: 'border border-amber-500/60 bg-amber-950/30 text-amber-100 hover:border-amber-400',
        bar: 'bg-amber-500',
        text: 'text-amber-100',
        glow: 'shadow-amber-500/20',
      };
    } else {
      return {
        card: 'border border-emerald-500/60 bg-emerald-950/25 text-emerald-100 hover:border-emerald-400',
        bar: 'bg-emerald-500',
        text: 'text-emerald-100',
        glow: 'shadow-emerald-500/20',
      };
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0b0d13] shadow-lg">
      {/* Timeline Controls Header */}
      <div className="flex h-10 items-center justify-between border-b border-slate-800/80 px-4 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-rose-500" />
          <h2 className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
            Timeline Engine
          </h2>
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
            00:00 — 24:00 (24.0h Budget)
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] text-rose-300 font-semibold">
            <span>{plannedStats.hoursPlannedFormatted} planned</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400">{plannedStats.hoursFreeFormatted} free</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
            Click any slot to schedule
          </span>
          <button
            onClick={() => {
              const now = new Date();
              const curH = `${String(now.getHours()).padStart(2, '0')}:00`;
              openQuickSchedule({ defaultTime: curH });
            }}
            className="flex items-center gap-1 rounded bg-rose-600/90 px-2 py-1 font-mono text-xs font-semibold text-white shadow-xs hover:bg-rose-500"
          >
            <Plus className="h-3 w-3" />
            <span>Schedule (N)</span>
          </button>
        </div>
      </div>

      {/* Main Hourly Grid Scroll Canvas with Smooth Auto-Scroll */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto select-none custom-timeline-scrollbar max-h-[calc(100vh-140px)] pb-20 scroll-smooth"
      >
        <div
          className="relative"
          style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT + 36}px` }}
        >
          {/* Live Current Time Line */}
          {isLineVisible && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
              style={{ top: `${currentLineTop}px` }}
            >
              <div className="flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                <span>
                  {String(Math.floor(currentTimeMinutes / 60)).padStart(2, '0')}:
                  {String(currentTimeMinutes % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="h-[2px] flex-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            </div>
          )}

          {/* Hourly Slots & 30-min Subdivisions */}
          {hoursList.map((hour) => {
            const timeTop = `${String(hour).padStart(2, '0')}:00`;
            const timeHalf = `${String(hour).padStart(2, '0')}:30`;

            const isHoverTop = hoveredSlotTime === timeTop;
            const isHoverHalf = hoveredSlotTime === timeHalf;

            const isDragTop = dragOverTime === timeTop;
            const isDragHalf = dragOverTime === timeHalf;

            return (
              <div
                key={hour}
                className="relative flex border-b border-slate-800/60"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {/* Time Gutter on the left */}
                <div className="w-14 shrink-0 pr-2 pt-0.5 text-right select-none">
                  <span className="font-mono text-[11px] font-semibold text-slate-500">
                    {timeTop}
                  </span>
                </div>

                {/* Slot Click & Drop Target Area */}
                <div className="relative flex-1 border-l border-slate-800">
                  {/* Top 30-Min Slot (00 - 30) */}
                  <div
                    onMouseEnter={() => setHoveredSlotTime(timeTop)}
                    onMouseLeave={() => setHoveredSlotTime(null)}
                    onDragOver={(e) => handleDragOver(e, timeTop)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, timeTop)}
                    onClick={() => openQuickSchedule({ defaultTime: timeTop })}
                    className={`group absolute inset-x-0 top-0 cursor-pointer transition-colors ${
                      isDragTop
                        ? 'bg-rose-500/20 border-2 border-dashed border-rose-500'
                        : isHoverTop
                        ? 'bg-slate-800/40 ring-1 ring-inset ring-slate-700/60'
                        : ''
                    }`}
                    style={{ height: `${HOUR_HEIGHT / 2}px` }}
                  >
                    {isHoverTop && !isDragTop && (
                      <div className="flex h-full items-center pl-3">
                        <span className="font-mono text-[10px] font-semibold text-slate-400 group-hover:text-rose-400">
                          + Add block at {timeTop}
                        </span>
                      </div>
                    )}
                    {isDragTop && (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-mono text-xs font-bold text-rose-300">
                          Drop to schedule at {timeTop}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 30-min dashed divider guide */}
                  <div
                    className="pointer-events-none absolute inset-x-0 border-b border-dashed border-slate-800/80"
                    style={{ top: `${HOUR_HEIGHT / 2}px` }}
                  />

                  {/* Bottom 30-Min Slot (30 - 60) */}
                  <div
                    onMouseEnter={() => setHoveredSlotTime(timeHalf)}
                    onMouseLeave={() => setHoveredSlotTime(null)}
                    onDragOver={(e) => handleDragOver(e, timeHalf)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, timeHalf)}
                    onClick={() => openQuickSchedule({ defaultTime: timeHalf })}
                    className={`group absolute inset-x-0 bottom-0 cursor-pointer transition-colors ${
                      isDragHalf
                        ? 'bg-rose-500/20 border-2 border-dashed border-rose-500'
                        : isHoverHalf
                        ? 'bg-slate-800/40 ring-1 ring-inset ring-slate-700/60'
                        : ''
                    }`}
                    style={{ height: `${HOUR_HEIGHT / 2}px` }}
                  >
                    {isHoverHalf && !isDragHalf && (
                      <div className="flex h-full items-center pl-3">
                        <span className="font-mono text-[10px] font-semibold text-slate-400 group-hover:text-rose-400">
                          + Add block at {timeHalf}
                        </span>
                      </div>
                    )}
                    {isDragHalf && (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-mono text-xs font-bold text-rose-300">
                          Drop to schedule at {timeHalf}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 24:00 (Midnight) Terminal Boundary */}
          <div
            className="relative flex border-t border-slate-700/80"
            style={{ height: '36px' }}
          >
            <div className="w-14 shrink-0 pr-2 pt-0.5 text-right select-none">
              <span className="font-mono text-[11px] font-semibold text-slate-500">
                24:00
              </span>
            </div>
            <div className="flex-1 border-l border-slate-800 flex items-center pl-3">
              <span className="font-mono text-[10px] text-slate-600">
                Midnight · End of 24h schedule
              </span>
            </div>
          </div>

          {/* Absolute Rendered Time Blocks Layer */}
          <div className="pointer-events-none absolute inset-0 left-14">
            {dayTimeblocks.map((block) => {
              const startMinutes = parseTimeToMinutes(block.startTime);
              const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
              const height = Math.max(26, (block.durationMinutes / 60) * HOUR_HEIGHT - 2);

              const styling = getBlockStyle(block);

              return (
                <div
                  key={block.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openQuickSchedule({
                      defaultTime: block.startTime,
                      editBlockId: block.id,
                    });
                  }}
                  className={`group pointer-events-auto absolute inset-x-2 z-20 flex flex-col justify-between overflow-hidden rounded-md cursor-pointer transition-all ${
                    styling.card
                  } ${block.completed ? 'opacity-50 grayscale-20' : 'opacity-100'}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  {/* Left accent bar */}
                  <div
                    className={`absolute inset-y-0 left-0 w-1 ${styling.bar}`}
                  />

                  {/* Block Content Container */}
                  <div className="flex h-full flex-col justify-between pl-2.5 pr-1.5 py-1">
                    {/* Top Row: Checkbox, Title, Priority Badge, Actions */}
                    <div className="flex items-start justify-between gap-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {/* Completion Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTimeBlock(block.id, { completed: !block.completed });
                          }}
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded transition-all ${
                            block.completed
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-600 bg-slate-900 hover:border-white'
                          }`}
                        >
                          {block.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </button>

                        {/* Title */}
                        <span
                          className={`truncate text-xs font-bold leading-tight ${
                            block.completed ? 'line-through text-slate-400' : styling.text
                          }`}
                        >
                          {block.title}
                        </span>

                        {/* Priority Badge (P1/P2/P3) */}
                        {renderPriorityBadge(block.priority)}
                      </div>

                      {/* Hover Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                        {/* Unschedule back to Inbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            unscheduleTimeBlock(block.id);
                          }}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                          title="Unschedule back to Inbox"
                        >
                          <Inbox className="h-3 w-3" />
                        </button>

                        {/* Delete block */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTimeBlock(block.id);
                          }}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                          title="Delete from schedule"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Time Interval, Duration, Resize controls */}
                    {height >= 34 && (
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <span>
                            {block.startTime} — {block.endTime}
                          </span>
                          <span className="font-semibold text-slate-300">
                            ({block.durationMinutes}m)
                          </span>
                        </div>

                        {/* Quick resize buttons */}
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              resizeTimeBlock(block.id, block.durationMinutes - 15);
                            }}
                            className="flex h-4 w-4 items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                            title="Shorten (-15m)"
                          >
                            <ChevronUp className="h-2.5 w-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              resizeTimeBlock(block.id, block.durationMinutes + 15);
                            }}
                            className="flex h-4 w-4 items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                            title="Expand (+15m)"
                          >
                            <ChevronDown className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Drag-to-Resize Bottom Handle */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const startY = e.clientY;
                      const initialDuration = block.durationMinutes;

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const deltaY = moveEvent.clientY - startY;
                        const deltaMinutes = Math.round(deltaY / (HOUR_HEIGHT / 4)) * 15;
                        const newDuration = Math.max(15, initialDuration + deltaMinutes);
                        resizeTimeBlock(block.id, newDuration);
                      };

                      const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                      };

                      window.addEventListener('mousemove', onMouseMove);
                      window.addEventListener('mouseup', onMouseUp);
                    }}
                    className="group-hover:opacity-100 opacity-0 absolute bottom-0 inset-x-0 h-1.5 cursor-ns-resize bg-slate-600/40 hover:bg-rose-500/80 transition-colors"
                    title="Drag to resize block duration"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
