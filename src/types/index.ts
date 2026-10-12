export type TaskPriority = 'must' | 'should' | 'quick_win';

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  priority: TaskPriority;
  estimatedMinutes: number;
  completed: boolean;
  scheduled: boolean;
  orderIndex: number;
  createdAt: string;
}

export type TimeBlockCategory = 'deep_work' | 'meeting' | 'admin' | 'health' | 'break' | 'personal';

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  durationMinutes: number;
  category: TimeBlockCategory;
  priority?: TaskPriority;
  color?: string;
  taskId?: string | null;
  completed: boolean;
  createdAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface DailyGoal {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  why: string;
  completed: boolean;
  milestones: GoalMilestone[];
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  category: string;
  targetDaysPerWeek: number;
  orderIndex: number;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface HabitWithStreak extends Habit {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  weeklyLogs: { date: string; completed: boolean }[];
}

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type MoodType = 'exhausted' | 'low' | 'steady' | 'focused' | 'unstoppable';

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  energy: EnergyLevel;
  mood: MoodType;
  note: string;
  createdAt: string;
}

export interface DailyReview {
  id: string;
  date: string; // YYYY-MM-DD
  rating: number; // 1-10
  wins: string;
  blockers: string;
  learnings: string;
  tasksRolledOver: number;
  createdAt: string;
}

export interface DashboardData {
  tasks: Task[];
  timeblocks: TimeBlock[];
  goals: DailyGoal[];
  habits: Habit[];
  habitLogs: HabitLog[];
  checkins: DailyCheckIn[];
  reviews: DailyReview[];
}
