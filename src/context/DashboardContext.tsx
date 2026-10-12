'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  TimeBlock,
  DailyGoal,
  Habit,
  HabitLog,
  DailyCheckIn,
  DailyReview,
  DashboardData,
  HabitWithStreak,
  TaskPriority,
  TimeBlockCategory,
  EnergyLevel,
  MoodType,
} from '@/types';
import {
  getLocalSnapshot,
  saveLocalSnapshot,
  fetchRemoteData,
  postRemoteSync,
} from '@/lib/storage';
import {
  useTaskReminders,
  ReminderToast,
  NotificationPermissionStatus,
} from '@/hooks/useTaskReminders';

interface QuickScheduleParams {
  defaultTime: string;
  defaultTaskId?: string | null;
  editBlockId?: string | null;
  defaultDuration?: number;
}

interface PlannedStats {
  totalPlannedMinutes: number;
  hoursPlannedFormatted: string;
  hoursFreeFormatted: string;
  completedTasksCount: number;
  totalTasksCount: number;
  dayProgressPercent: number;
}

interface DashboardContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  isToday: boolean;

  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  syncStatus: 'synced' | 'syncing' | 'offline';

  // Planned stats
  plannedStats: PlannedStats;

  // Tasks
  tasks: Task[];
  dayTasks: Task[];
  unscheduledTasks: Task[];
  addTask: (title: string, priority: TaskPriority, estimatedMinutes: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Timeblocks
  timeblocks: TimeBlock[];
  dayTimeblocks: TimeBlock[];
  addTimeBlock: (block: Omit<TimeBlock, 'id' | 'createdAt'>) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  unscheduleTimeBlock: (id: string) => void;
  resizeTimeBlock: (id: string, newDurationMinutes: number) => void;
  scheduleTask: (taskId: string, startTime: string) => void;
  dropTaskOnSlot: (taskId: string, startTime: string) => void;

  // Goals
  currentGoal: DailyGoal | null;
  updateGoal: (updates: Partial<DailyGoal>) => void;
  toggleMilestone: (milestoneId: string) => void;
  addMilestone: (title: string) => void;

  // Habits
  habitsWithStreaks: HabitWithStreak[];
  habitLogs: HabitLog[];
  toggleHabit: (habitId: string, date?: string) => void;
  addHabit: (title: string, icon?: string, target?: number) => void;
  deleteHabit: (habitId: string) => void;

  // CheckIn
  currentCheckin: DailyCheckIn | null;
  saveCheckin: (energy: EnergyLevel, mood: MoodType, note: string) => void;

  // Reviews
  currentReview: DailyReview | null;
  submitDailyDebrief: (
    rating: number,
    wins: string,
    blockers: string,
    learnings: string,
    rollUnfinished: boolean
  ) => void;

  // Modals & UI States
  isReviewModalOpen: boolean;
  openReviewModal: () => void;
  closeReviewModal: () => void;

  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  isShortcutsOpen: boolean;
  openShortcuts: () => void;
  closeShortcuts: () => void;

  quickScheduleModal: {
    isOpen: boolean;
    defaultTime: string;
    defaultTaskId?: string | null;
    editBlockId?: string | null;
    defaultDuration?: number;
  };
  openQuickSchedule: (params: QuickScheduleParams) => void;
  closeQuickSchedule: () => void;

  // Proactive Task Reminder System
  notificationPermission: NotificationPermissionStatus;
  requestNotificationPermission: () => Promise<NotificationPermissionStatus>;
  activeNotificationToasts: ReminderToast[];
  dismissNotificationToast: (id: string) => void;
  triggerTestReminder: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Modals
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [quickScheduleModal, setQuickScheduleModal] = useState<{
    isOpen: boolean;
    defaultTime: string;
    defaultTaskId?: string | null;
    editBlockId?: string | null;
    defaultDuration?: number;
  }>({
    isOpen: false,
    defaultTime: '09:00',
    defaultTaskId: null,
    editBlockId: null,
    defaultDuration: 30,
  });

  // Core Data: lazy initialization from localStorage directly
  const [data, setData] = useState<DashboardData>(() => {
    return getLocalSnapshot();
  });

  // Proactive 15-minute task reminder system
  const reminders = useTaskReminders(data.timeblocks);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('vibrant_theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vibrant_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Hydrate and synchronize with SQLite API without resurrecting deleted data
  useEffect(() => {
    setSyncStatus('syncing');
    fetchRemoteData()
      .then((remote) => {
        if (remote) {
          const local = getLocalSnapshot();
          const localCount = local.tasks.length + local.timeblocks.length + local.habits.length + local.goals.length;
          const remoteCount = remote.tasks.length + remote.timeblocks.length + remote.habits.length + remote.goals.length;

          if (remoteCount > 0) {
            setData(remote);
            saveLocalSnapshot(remote);
            setSyncStatus('synced');
          } else if (localCount > 0) {
            // Local has data but SQLite database was fresh, sync local up to SQLite
            postRemoteSync(local)
              .then(() => setSyncStatus('synced'))
              .catch(() => setSyncStatus('offline'));
          } else {
            // Clean slate: both are empty, keep empty state without injecting mock data
            setData(remote);
            saveLocalSnapshot(remote);
            setSyncStatus('synced');
          }
        } else {
          setSyncStatus('offline');
        }
      })
      .catch(() => {
        setSyncStatus('offline');
      });
  }, []);

  // Helper to persist and sync mutations
  const updateDataAndSync = useCallback((updater: (prev: DashboardData) => DashboardData) => {
    setData((prev) => {
      const next = updater(prev);
      saveLocalSnapshot(next);
      postRemoteSync(next)
        .then((res) => {
          if (res) setSyncStatus('synced');
          else setSyncStatus('offline');
        })
        .catch(() => setSyncStatus('offline'));
      return next;
    });
  }, []);

  // Date Navigation
  const goToToday = useCallback(() => setSelectedDate(getTodayString()), []);
  const goToPrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return formatDate(d);
    });
  }, []);
  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return formatDate(d);
    });
  }, []);

  const isToday = useMemo(() => selectedDate === getTodayString(), [selectedDate]);

  // Day specific views
  const dayTasks = useMemo(() => {
    return data.tasks.filter((t) => t.date === selectedDate);
  }, [data.tasks, selectedDate]);

  const unscheduledTasks = useMemo(() => {
    return dayTasks
      .filter((t) => !t.scheduled)
      .sort((a, b) => {
        const order = { must: 0, should: 1, quick_win: 2 };
        return order[a.priority] - order[b.priority];
      });
  }, [dayTasks]);

  const dayTimeblocks = useMemo(() => {
    return data.timeblocks
      .filter((b) => b.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [data.timeblocks, selectedDate]);

  // Real-time planned stats (24.0-hour total day budget)
  const plannedStats = useMemo((): PlannedStats => {
    const totalPlannedMinutes = dayTimeblocks.reduce((acc, b) => acc + b.durationMinutes, 0);
    const plannedHoursNum = totalPlannedMinutes / 60;
    const plannedHours = plannedHoursNum.toFixed(1);

    // Full 24.0-hour total day budget: 24.0h - totalPlannedHours = freeHours
    const totalDayHours = 24.0;
    const freeHoursNum = Math.max(0, totalDayHours - plannedHoursNum);
    const freeHours = freeHoursNum.toFixed(1);

    const completedTasksCount = dayTasks.filter((t) => t.completed).length;
    const totalTasksCount = dayTasks.length;

    // Day progress percent across full 24h (00:00 to 24:00)
    const now = new Date();
    const currentM = now.getHours() * 60 + now.getMinutes();
    const startM = 0; // 00:00
    const endM = 24 * 60; // 24:00
    const progress = Math.min(100, Math.max(0, Math.round(((currentM - startM) / (endM - startM)) * 100)));

    return {
      totalPlannedMinutes,
      hoursPlannedFormatted: `${plannedHours}h`,
      hoursFreeFormatted: `${freeHours}h`,
      completedTasksCount,
      totalTasksCount,
      dayProgressPercent: progress,
    };
  }, [dayTimeblocks, dayTasks]);

  const currentGoal = useMemo(() => {
    const found = data.goals.find((g) => g.date === selectedDate);
    if (found) return found;
    return {
      id: `g-${selectedDate}`,
      date: selectedDate,
      title: '',
      why: '',
      completed: false,
      milestones: [],
      createdAt: new Date().toISOString(),
    };
  }, [data.goals, selectedDate]);

  const currentCheckin = useMemo(() => {
    return data.checkins.find((c) => c.date === selectedDate) || null;
  }, [data.checkins, selectedDate]);

  const currentReview = useMemo(() => {
    return data.reviews.find((r) => r.date === selectedDate) || null;
  }, [data.reviews, selectedDate]);

  // Tasks actions
  const addTask = useCallback(
    (title: string, priority: TaskPriority, estimatedMinutes: number) => {
      if (!title.trim()) return;
      const newTask: Task = {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: selectedDate,
        title: title.trim(),
        priority,
        estimatedMinutes,
        completed: false,
        scheduled: false,
        orderIndex: Date.now(),
        createdAt: new Date().toISOString(),
      };
      updateDataAndSync((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
      }));
    },
    [selectedDate, updateDataAndSync]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      updateDataAndSync((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    },
    [updateDataAndSync]
  );

  const deleteTask = useCallback(
    (id: string) => {
      updateDataAndSync((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
        timeblocks: prev.timeblocks.filter((b) => b.taskId !== id),
      }));
    },
    [updateDataAndSync]
  );

  const toggleTaskComplete = useCallback(
    (id: string) => {
      updateDataAndSync((prev) => {
        const task = prev.tasks.find((t) => t.id === id);
        if (!task) return prev;
        const newCompleted = !task.completed;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)),
          timeblocks: prev.timeblocks.map((b) =>
            b.taskId === id ? { ...b, completed: newCompleted } : b
          ),
        };
      });
    },
    [updateDataAndSync]
  );

  // Timeblocks actions
  const addTimeBlock = useCallback(
    (block: Omit<TimeBlock, 'id' | 'createdAt'>) => {
      const newBlock: TimeBlock = {
        ...block,
        id: `tb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        priority: block.priority || 'must',
        createdAt: new Date().toISOString(),
      };

      updateDataAndSync((prev) => {
        // If linked to a task, mark task as scheduled
        const updatedTasks = block.taskId
          ? prev.tasks.map((t) => (t.id === block.taskId ? { ...t, scheduled: true } : t))
          : prev.tasks;

        return {
          ...prev,
          tasks: updatedTasks,
          timeblocks: [...prev.timeblocks, newBlock],
        };
      });
    },
    [updateDataAndSync]
  );

  const updateTimeBlock = useCallback(
    (id: string, updates: Partial<TimeBlock>) => {
      updateDataAndSync((prev) => ({
        ...prev,
        timeblocks: prev.timeblocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        // If updating completed status, synchronize linked task
        tasks:
          updates.completed !== undefined
            ? prev.tasks.map((t) => {
                const block = prev.timeblocks.find((b) => b.id === id);
                if (block && block.taskId === t.id) {
                  return { ...t, completed: updates.completed! };
                }
                return t;
              })
            : prev.tasks,
      }));
    },
    [updateDataAndSync]
  );

  const deleteTimeBlock = useCallback(
    (id: string) => {
      updateDataAndSync((prev) => {
        const block = prev.timeblocks.find((b) => b.id === id);
        return {
          ...prev,
          timeblocks: prev.timeblocks.filter((b) => b.id !== id),
          tasks: block?.taskId
            ? prev.tasks.filter((t) => t.id !== block.taskId)
            : prev.tasks,
        };
      });
    },
    [updateDataAndSync]
  );

  // Unschedule: removes from timeline but preserves task in Unscheduled Inbox!
  const unscheduleTimeBlock = useCallback(
    (id: string) => {
      updateDataAndSync((prev) => {
        const block = prev.timeblocks.find((b) => b.id === id);
        if (!block) return prev;

        let updatedTasks = [...prev.tasks];
        if (block.taskId) {
          // Reset scheduled flag
          updatedTasks = updatedTasks.map((t) =>
            t.id === block.taskId ? { ...t, scheduled: false } : t
          );
        } else {
          // If the block didn't have a task, create one in the inbox so it's not lost
          const newTask: Task = {
            id: `t-${Date.now()}`,
            date: block.date,
            title: block.title,
            priority: block.priority || 'must',
            estimatedMinutes: block.durationMinutes,
            completed: block.completed,
            scheduled: false,
            orderIndex: Date.now(),
            createdAt: new Date().toISOString(),
          };
          updatedTasks.push(newTask);
        }

        return {
          ...prev,
          tasks: updatedTasks,
          timeblocks: prev.timeblocks.filter((b) => b.id !== id),
        };
      });
    },
    [updateDataAndSync]
  );

  // Resize block duration in 15-minute increments
  const resizeTimeBlock = useCallback(
    (id: string, newDurationMinutes: number) => {
      const cleanDuration = Math.max(15, Math.min(240, newDurationMinutes));
      updateDataAndSync((prev) => {
        const block = prev.timeblocks.find((b) => b.id === id);
        if (!block) return prev;

        const [startH, startM] = block.startTime.split(':').map(Number);
        const totalEndM = startH * 60 + startM + cleanDuration;
        const endH = Math.min(23, Math.floor(totalEndM / 60));
        const endMin = Math.min(59, totalEndM % 60);
        const endTime = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        return {
          ...prev,
          timeblocks: prev.timeblocks.map((b) =>
            b.id === id
              ? { ...b, durationMinutes: cleanDuration, endTime }
              : b
          ),
          tasks: block.taskId
            ? prev.tasks.map((t) =>
                t.id === block.taskId ? { ...t, estimatedMinutes: cleanDuration } : t
              )
            : prev.tasks,
        };
      });
    },
    [updateDataAndSync]
  );

  // Schedule task into timeline slot
  const scheduleTask = useCallback(
    (taskId: string, startTime: string) => {
      const task = data.tasks.find((t) => t.id === taskId);
      if (!task) return;

      const [startHour, startMin] = startTime.split(':').map(Number);
      const totalMinutes = startHour * 60 + startMin + task.estimatedMinutes;
      const endHour = Math.min(23, Math.floor(totalMinutes / 60));
      const endMin = Math.min(59, totalMinutes % 60);
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      let category: TimeBlockCategory = 'deep_work';
      let color = '#f43f5e';
      if (task.priority === 'must') {
        category = 'deep_work';
        color = '#f43f5e'; // crimson/rose
      } else if (task.priority === 'should') {
        category = 'meeting';
        color = '#f59e0b'; // amber
      } else {
        category = 'admin';
        color = '#10b981'; // emerald
      }

      const newBlock: TimeBlock = {
        id: `tb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: selectedDate,
        title: task.title,
        startTime,
        endTime,
        durationMinutes: task.estimatedMinutes,
        category,
        priority: task.priority,
        color,
        taskId: task.id,
        completed: task.completed,
        createdAt: new Date().toISOString(),
      };

      updateDataAndSync((prev) => ({
        ...prev,
        timeblocks: [...prev.timeblocks, newBlock],
        tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, scheduled: true } : t)),
      }));
    },
    [data.tasks, selectedDate, updateDataAndSync]
  );

  // Drag and drop task on slot
  const dropTaskOnSlot = useCallback(
    (taskId: string, startTime: string) => {
      scheduleTask(taskId, startTime);
    },
    [scheduleTask]
  );

  // Goal actions
  const updateGoal = useCallback(
    (updates: Partial<DailyGoal>) => {
      updateDataAndSync((prev) => {
        const existing = prev.goals.find((g) => g.date === selectedDate);
        if (existing) {
          return {
            ...prev,
            goals: prev.goals.map((g) =>
              g.date === selectedDate ? { ...g, ...updates } : g
            ),
          };
        } else {
          const newGoal: DailyGoal = {
            id: `g-${selectedDate}`,
            date: selectedDate,
            title: updates.title || '',
            why: updates.why || '',
            completed: updates.completed ?? false,
            milestones: updates.milestones || [],
            createdAt: new Date().toISOString(),
          };
          return {
            ...prev,
            goals: [...prev.goals, newGoal],
          };
        }
      });
    },
    [selectedDate, updateDataAndSync]
  );

  const toggleMilestone = useCallback(
    (milestoneId: string) => {
      updateDataAndSync((prev) => {
        return {
          ...prev,
          goals: prev.goals.map((g) => {
            if (g.date !== selectedDate) return g;
            const updatedMilestones = g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            );
            const allComplete =
              updatedMilestones.length > 0 &&
              updatedMilestones.every((m) => m.completed);
            return {
              ...g,
              milestones: updatedMilestones,
              completed: allComplete,
            };
          }),
        };
      });
    },
    [selectedDate, updateDataAndSync]
  );

  const addMilestone = useCallback(
    (title: string) => {
      if (!title.trim()) return;
      updateDataAndSync((prev) => {
        const newM = {
          id: `m-${Date.now()}`,
          title: title.trim(),
          completed: false,
        };
        const existing = prev.goals.find((g) => g.date === selectedDate);
        if (existing) {
          return {
            ...prev,
            goals: prev.goals.map((g) =>
              g.date === selectedDate
                ? { ...g, milestones: [...g.milestones, newM], completed: false }
                : g
            ),
          };
        } else {
          const newGoal: DailyGoal = {
            id: `g-${selectedDate}`,
            date: selectedDate,
            title: '',
            why: '',
            completed: false,
            milestones: [newM],
            createdAt: new Date().toISOString(),
          };
          return {
            ...prev,
            goals: [...prev.goals, newGoal],
          };
        }
      });
    },
    [selectedDate, updateDataAndSync]
  );

  // Habits with streak computation
  const habitsWithStreaks = useMemo((): HabitWithStreak[] => {
    const today = selectedDate;
    const past7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      past7Days.push(formatDate(d));
    }

    return data.habits.map((habit) => {
      const habitLogs = data.habitLogs.filter((l) => l.habitId === habit.id && l.completed);
      const isCompletedToday = habitLogs.some((l) => l.date === today);

      let currentStreak = 0;
      const checkDate = new Date(today);

      const todayDone = habitLogs.some((l) => l.date === formatDate(checkDate));
      if (!todayDone) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = formatDate(checkDate);
        const done = habitLogs.some((l) => l.date === dateStr);
        if (done) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      const weeklyLogs = past7Days.map((dStr) => ({
        date: dStr,
        completed: habitLogs.some((l) => l.date === dStr),
      }));

      return {
        ...habit,
        currentStreak,
        longestStreak: Math.max(currentStreak, habit.targetDaysPerWeek),
        isCompletedToday,
        weeklyLogs,
      };
    });
  }, [data.habits, data.habitLogs, selectedDate]);

  const toggleHabit = useCallback(
    (habitId: string, targetDate?: string) => {
      const dateToToggle = targetDate || selectedDate;
      updateDataAndSync((prev) => {
        const existingIndex = prev.habitLogs.findIndex(
          (l) => l.habitId === habitId && l.date === dateToToggle
        );
        let updatedLogs: HabitLog[];
        if (existingIndex >= 0) {
          const current = prev.habitLogs[existingIndex];
          if (current.completed) {
            updatedLogs = prev.habitLogs.filter((_, idx) => idx !== existingIndex);
          } else {
            updatedLogs = prev.habitLogs.map((l, idx) =>
              idx === existingIndex ? { ...l, completed: true } : l
            );
          }
        } else {
          updatedLogs = [
            ...prev.habitLogs,
            {
              id: `hl-${habitId}-${dateToToggle}`,
              habitId,
              date: dateToToggle,
              completed: true,
            },
          ];
        }
        return {
          ...prev,
          habitLogs: updatedLogs,
        };
      });
    },
    [selectedDate, updateDataAndSync]
  );

  const addHabit = useCallback(
    (title: string, icon: string = 'zap', target: number = 7) => {
      if (!title.trim()) return;
      const newHabit: Habit = {
        id: `h-${Date.now()}`,
        title: title.trim(),
        icon,
        category: 'general',
        targetDaysPerWeek: target,
        orderIndex: Date.now(),
        createdAt: new Date().toISOString(),
      };
      updateDataAndSync((prev) => ({
        ...prev,
        habits: [...prev.habits, newHabit],
      }));
    },
    [updateDataAndSync]
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      updateDataAndSync((prev) => ({
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
        habitLogs: prev.habitLogs.filter((l) => l.habitId !== habitId),
      }));
    },
    [updateDataAndSync]
  );

  // CheckIn action
  const saveCheckin = useCallback(
    (energy: EnergyLevel, mood: MoodType, note: string) => {
      updateDataAndSync((prev) => {
        const existing = prev.checkins.find((c) => c.date === selectedDate);
        if (existing) {
          return {
            ...prev,
            checkins: prev.checkins.map((c) =>
              c.date === selectedDate ? { ...c, energy, mood, note } : c
            ),
          };
        } else {
          const newCheckin: DailyCheckIn = {
            id: `c-${selectedDate}`,
            date: selectedDate,
            energy,
            mood,
            note,
            createdAt: new Date().toISOString(),
          };
          return {
            ...prev,
            checkins: [...prev.checkins, newCheckin],
          };
        }
      });
    },
    [selectedDate, updateDataAndSync]
  );

  // End of Day Debrief and Roll Unfinished Tasks
  const submitDailyDebrief = useCallback(
    (
      rating: number,
      wins: string,
      blockers: string,
      learnings: string,
      rollUnfinished: boolean
    ) => {
      updateDataAndSync((prev) => {
        const tomorrow = new Date(selectedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDate(tomorrow);

        let rolledCount = 0;
        let updatedTasks = [...prev.tasks];

        if (rollUnfinished) {
          updatedTasks = prev.tasks.map((t) => {
            if (t.date === selectedDate && !t.completed) {
              rolledCount++;
              return {
                ...t,
                date: tomorrowStr,
                scheduled: false,
              };
            }
            return t;
          });
        }

        const review: DailyReview = {
          id: `rev-${selectedDate}`,
          date: selectedDate,
          rating,
          wins,
          blockers,
          learnings,
          tasksRolledOver: rolledCount,
          createdAt: new Date().toISOString(),
        };

        const existingRevIdx = prev.reviews.findIndex((r) => r.date === selectedDate);
        let updatedReviews: DailyReview[];
        if (existingRevIdx >= 0) {
          updatedReviews = prev.reviews.map((r, i) =>
            i === existingRevIdx ? review : r
          );
        } else {
          updatedReviews = [...prev.reviews, review];
        }

        return {
          ...prev,
          tasks: updatedTasks,
          reviews: updatedReviews,
        };
      });
    },
    [selectedDate, updateDataAndSync]
  );

  // Quick Schedule Modal control
  const openQuickSchedule = useCallback((params: QuickScheduleParams) => {
    setQuickScheduleModal({
      isOpen: true,
      defaultTime: params.defaultTime,
      defaultTaskId: params.defaultTaskId || null,
      editBlockId: params.editBlockId || null,
      defaultDuration: params.defaultDuration || 30,
    });
  }, []);

  const closeQuickSchedule = useCallback(() => {
    setQuickScheduleModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Global Keyboard Navigation (T, N, Cmd+K, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Cmd+K or Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        goToToday();
      } else if (e.key === 'n' || e.key === 'N') {
        // Quick add block at current hour
        e.preventDefault();
        const now = new Date();
        const curHour = `${String(now.getHours()).padStart(2, '0')}:00`;
        openQuickSchedule({ defaultTime: curHour });
      } else if (e.key === '[') {
        e.preventDefault();
        goToPrevDay();
      } else if (e.key === ']') {
        e.preventDefault();
        goToNextDay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsReviewModalOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToToday, goToPrevDay, goToNextDay, toggleTheme, openQuickSchedule]);

  return (
    <DashboardContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        goToToday,
        goToPrevDay,
        goToNextDay,
        isToday,
        theme,
        toggleTheme,
        isSidebarOpen,
        toggleSidebar,
        syncStatus,
        plannedStats,
        tasks: data.tasks,
        dayTasks,
        unscheduledTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        timeblocks: data.timeblocks,
        dayTimeblocks,
        addTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
        unscheduleTimeBlock,
        resizeTimeBlock,
        scheduleTask,
        dropTaskOnSlot,
        currentGoal,
        updateGoal,
        toggleMilestone,
        addMilestone,
        habitsWithStreaks,
        habitLogs: data.habitLogs,
        toggleHabit,
        addHabit,
        deleteHabit,
        currentCheckin,
        saveCheckin,
        currentReview,
        submitDailyDebrief,
        isReviewModalOpen,
        openReviewModal: () => setIsReviewModalOpen(true),
        closeReviewModal: () => setIsReviewModalOpen(false),
        isCommandPaletteOpen,
        openCommandPalette: () => setIsCommandPaletteOpen(true),
        closeCommandPalette: () => setIsCommandPaletteOpen(false),
        isShortcutsOpen,
        openShortcuts: () => setIsShortcutsOpen(true),
        closeShortcuts: () => setIsShortcutsOpen(false),
        quickScheduleModal,
        openQuickSchedule,
        closeQuickSchedule,
        notificationPermission: reminders.permission,
        requestNotificationPermission: reminders.requestPermission,
        activeNotificationToasts: reminders.toasts,
        dismissNotificationToast: reminders.dismissToast,
        triggerTestReminder: reminders.triggerTestReminder,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
