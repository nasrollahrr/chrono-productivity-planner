'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { X, Sparkles, Moon, ArrowRight, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EndOfDayReviewModal() {
  const {
    isReviewModalOpen,
    closeReviewModal,
    currentReview,
    submitDailyDebrief,
    dayTasks,
  } = useDashboard();

  const [rating, setRating] = useState<number>(8);
  const [wins, setWins] = useState<string>('');
  const [blockers, setBlockers] = useState<string>('');
  const [learnings, setLearnings] = useState<string>('');
  const [rollUnfinished, setRollUnfinished] = useState<boolean>(true);

  // Unfinished tasks count
  const unfinishedTasks = dayTasks.filter((t) => !t.completed);

  useEffect(() => {
    if (currentReview) {
      setRating(currentReview.rating);
      setWins(currentReview.wins);
      setBlockers(currentReview.blockers);
      setLearnings(currentReview.learnings);
    } else {
      setRating(8);
      setWins('');
      setBlockers('');
      setLearnings('');
      setRollUnfinished(true);
    }
  }, [currentReview, isReviewModalOpen]);

  if (!isReviewModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDailyDebrief(rating, wins, blockers, learnings, rollUnfinished);

    // Confetti celebration
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
    });

    closeReviewModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#121215]">
        {/* Close Button */}
        <button
          onClick={closeReviewModal}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Moon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
              End-of-Day 2-Minute Debrief
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Reflect, close loops, and roll unfinished tasks into tomorrow’s inbox.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day Rating (1 to 10) */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                How productive & intentional was today?
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {rating} / 10
              </span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className={`flex h-8 items-center justify-center rounded font-mono text-xs font-semibold transition-all ${
                    rating === val
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:bg-neutral-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Wins Prompt */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              1. What went exceptionally well today?
            </label>
            <textarea
              rows={2}
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="Shipped North Star milestone, hit hydration goal, high focus block..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          {/* Blockers & Distractions Prompt */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              2. What caused friction, delays, or distraction?
            </label>
            <textarea
              rows={2}
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Unexpected meetings, context switching, afternoon energy dip..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          {/* Key Lesson Prompt */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              3. What adjustment will make tomorrow even better?
            </label>
            <input
              type="text"
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Block 2 hours of phone-free deep work before checking slack..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          {/* Task Rollover Trigger */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 p-3 dark:border-indigo-500/10 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-indigo-500" />
                <div>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Roll Unfinished Tasks to Tomorrow
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {unfinishedTasks.length > 0
                      ? `${unfinishedTasks.length} task${
                          unfinishedTasks.length > 1 ? 's' : ''
                        } will automatically migrate to tomorrow’s list`
                      : 'All of today’s tasks are completed!'}
                  </p>
                </div>
              </div>

              {unfinishedTasks.length > 0 && (
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={rollUnfinished}
                    onChange={(e) => setRollUnfinished(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-neutral-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-neutral-700" />
                </label>
              )}
            </div>

            {/* List preview of unfinished tasks if any */}
            {unfinishedTasks.length > 0 && rollUnfinished && (
              <div className="mt-2 space-y-1 border-t border-indigo-200/50 pt-2 dark:border-indigo-900/50">
                {unfinishedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 font-mono text-[10px] text-neutral-600 dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3 text-indigo-500" />
                    <span className="truncate">{t.title}</span>
                    <span className="opacity-60">({t.estimatedMinutes}m)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeReviewModal}
              className="rounded-lg px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Complete Debrief & Close Day</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
