'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeBlock, TaskPriority } from '@/types';
import { playChimeSound } from '@/lib/audio';

export interface ReminderToast {
  id: string;
  blockId: string;
  title: string;
  durationMinutes: number;
  priority: TaskPriority;
  priorityLabel: string;
  startTime: string;
  diffMinutes: number;
  createdAt: number;
}

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

const SESSION_STORAGE_KEY = 'chrono_notified_task_ids';

function getInitialNotifiedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function persistNotifiedIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

export function useTaskReminders(timeblocks: TimeBlock[]) {
  const [permission, setPermission] = useState<NotificationPermissionStatus>('default');
  const [toasts, setToasts] = useState<ReminderToast[]>([]);
  const notifiedIdsRef = useRef<Set<string>>(getInitialNotifiedIds());

  // Check initial browser notification permission on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as NotificationPermissionStatus);
  }, []);

  // Request browser notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported';
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res as NotificationPermissionStatus);
      if (res === 'granted') {
        playChimeSound();
      }
      return res as NotificationPermissionStatus;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return 'denied';
    }
  }, []);

  // Dismiss a specific toast
  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Trigger a test notification & chime for user verification
  const triggerTestReminder = useCallback(() => {
    playChimeSound();

    const testToast: ReminderToast = {
      id: `test-toast-${Date.now()}`,
      blockId: 'test-block',
      title: 'Deep Work: System Architecture & Testing',
      durationMinutes: 45,
      priority: 'must',
      priorityLabel: 'P1 Must Do',
      startTime: 'In 15 Minutes',
      diffMinutes: 15,
      createdAt: Date.now(),
    };

    setToasts((prev) => [testToast, ...prev]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('⏰ Upcoming Task in 15 Minutes', {
          body: 'Deep Work: System Architecture & Testing (45m) • P1 Must Do',
          icon: '/favicon.ico',
          tag: 'chrono-test-reminder',
        });
      } catch (err) {
        console.warn('Failed to dispatch test notification:', err);
      }
    }
  }, []);

  // Core Polling & Deduplication Engine (every 30 seconds)
  useEffect(() => {
    const checkUpcomingTasks = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Only inspect today's scheduled timeblocks that are not completed
      const todayBlocks = timeblocks.filter(
        (b) => b.date === todayStr && !b.completed && b.startTime
      );

      for (const block of todayBlocks) {
        const [startH, startM] = block.startTime.split(':').map(Number);
        if (isNaN(startH) || isNaN(startM)) continue;

        const blockStartMinutes = startH * 60 + startM;
        const diffMinutes = blockStartMinutes - currentMinutes;

        // Trigger condition: task begins between 1 and 15 minutes from now
        if (diffMinutes > 0 && diffMinutes <= 15) {
          if (!notifiedIdsRef.current.has(block.id)) {
            // Deduplicate: mark task as notified
            notifiedIdsRef.current.add(block.id);
            persistNotifiedIds(notifiedIdsRef.current);

            // 1. Play synthesized Web Audio frequency chime
            playChimeSound();

            const priorityLabel =
              block.priority === 'must'
                ? 'P1 Must Do'
                : block.priority === 'should'
                ? 'P2 Should Do'
                : 'P3 Quick Win';

            // 2. Dispatch in-app toast
            const newToast: ReminderToast = {
              id: `toast-${block.id}-${Date.now()}`,
              blockId: block.id,
              title: block.title,
              durationMinutes: block.durationMinutes,
              priority: block.priority || 'must',
              priorityLabel,
              startTime: block.startTime,
              diffMinutes,
              createdAt: Date.now(),
            };

            setToasts((prev) => [newToast, ...prev]);

            // 3. Dispatch native OS/browser desktop notification if granted
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification('⏰ Upcoming Task in 15 Minutes', {
                  body: `${block.title} (${block.durationMinutes}m) • ${priorityLabel} • Starts at ${block.startTime}`,
                  icon: '/favicon.ico',
                  tag: `chrono-reminder-${block.id}`,
                });
              } catch (err) {
                console.warn('Native notification failed:', err);
              }
            }
          }
        }
      }
    };

    // Run check immediately on mount and every 30 seconds thereafter
    checkUpcomingTasks();
    const interval = setInterval(checkUpcomingTasks, 30000);

    return () => clearInterval(interval);
  }, [timeblocks]);

  return {
    permission,
    requestPermission,
    toasts,
    dismissToast,
    triggerTestReminder,
  };
}
