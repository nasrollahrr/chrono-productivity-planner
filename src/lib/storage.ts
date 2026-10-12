import { DashboardData } from '@/types';

export const STORAGE_KEY = 'chrono_productivity_data';
export const LEGACY_STORAGE_KEY = 'vibrant_productivity_dashboard_data';
export const TASKS_STORAGE_KEY = 'chrono_tasks';

// Clean slate initial state: strictly empty arrays with zero dummy tasks
export const cleanInitialData: DashboardData = {
  goals: [],
  tasks: [],
  timeblocks: [],
  habits: [],
  habitLogs: [],
  checkins: [],
  reviews: [],
};

// Kept for backward compatibility exports
export const fallbackInitialData: DashboardData = cleanInitialData;

export function getLocalSnapshot(): DashboardData {
  if (typeof window === 'undefined') return cleanInitialData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    const rawTasks = localStorage.getItem(TASKS_STORAGE_KEY);

    // If completely uninitialized, return cleanInitialData
    if (!raw && !rawTasks) {
      return cleanInitialData;
    }

    let parsed: Partial<DashboardData> = {};
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }
    }

    // Check if tasks were stored under chrono_tasks
    let tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    if (rawTasks) {
      try {
        const parsedTasks = JSON.parse(rawTasks);
        if (Array.isArray(parsedTasks)) {
          tasks = parsedTasks;
        }
      } catch {
        // ignore
      }
    }

    // Preserve empty arrays as empty - never re-inject mock data!
    return {
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      tasks,
      timeblocks: Array.isArray(parsed.timeblocks) ? parsed.timeblocks : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      habitLogs: Array.isArray(parsed.habitLogs) ? parsed.habitLogs : [],
      checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch (err) {
    console.error('Failed to parse local snapshot:', err);
    return cleanInitialData;
  }
}

export function saveLocalSnapshot(data: DashboardData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data.tasks));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export async function fetchRemoteData(): Promise<DashboardData | null> {
  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Network sync failed, relying on offline storage:', err);
  }
  return null;
}

export async function postRemoteSync(data: DashboardData): Promise<DashboardData | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      saveLocalSnapshot(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('Background sync failed, queued in offline storage:', err);
  }
  return null;
}
