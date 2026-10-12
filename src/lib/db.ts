import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DashboardData, DailyGoal, Task, TimeBlock, Habit, HabitLog, DailyCheckIn, DailyReview } from '@/types';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'productivity.db');

// Singleton database instance
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initTables(dbInstance);
    seedInitialDataIfEmpty();
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      why TEXT,
      completed INTEGER DEFAULT 0,
      milestones TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      priority TEXT NOT NULL,
      estimated_minutes INTEGER NOT NULL DEFAULT 30,
      completed INTEGER DEFAULT 0,
      scheduled INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);

    CREATE TABLE IF NOT EXISTS timeblocks (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      category TEXT NOT NULL,
      priority TEXT DEFAULT 'must',
      color TEXT,
      task_id TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_timeblocks_date ON timeblocks(date);

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      icon TEXT DEFAULT 'sparkles',
      category TEXT DEFAULT 'general',
      target_days_per_week INTEGER DEFAULT 7,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      UNIQUE(habit_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);

    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      energy INTEGER NOT NULL,
      mood TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      rating INTEGER NOT NULL,
      wins TEXT,
      blockers TEXT,
      learnings TEXT,
      tasks_rolled_over INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

function seedInitialDataIfEmpty() {
  // Clean slate: start with 0 tasks, 0 blocks, 0 habits
}

interface TaskRow {
  id: string;
  date: string;
  title: string;
  priority: 'must' | 'should' | 'quick_win';
  estimated_minutes: number;
  completed: number;
  scheduled: number;
  order_index: number;
  created_at: string;
}

interface TimeBlockRow {
  id: string;
  date: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  category: 'deep_work' | 'meeting' | 'admin' | 'health' | 'break' | 'personal';
  priority?: 'must' | 'should' | 'quick_win' | null;
  color?: string | null;
  task_id?: string | null;
  completed: number;
  created_at: string;
}

interface GoalRow {
  id: string;
  date: string;
  title: string;
  why?: string | null;
  completed: number;
  milestones?: string | null;
  created_at: string;
}

interface HabitRow {
  id: string;
  title: string;
  icon: string;
  category: string;
  target_days_per_week: number;
  order_index: number;
  created_at: string;
}

interface HabitLogRow {
  id: string;
  habit_id: string;
  date: string;
  completed: number;
}

interface CheckinRow {
  id: string;
  date: string;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: 'exhausted' | 'low' | 'steady' | 'focused' | 'unstoppable';
  note?: string | null;
  created_at: string;
}

interface ReviewRow {
  id: string;
  date: string;
  rating: number;
  wins?: string | null;
  blockers?: string | null;
  learnings?: string | null;
  tasks_rolled_over: number;
  created_at: string;
}

export function getAllDashboardData(): DashboardData {
  const db = getDatabase();

  const tasksRaw = db.prepare('SELECT * FROM tasks ORDER BY order_index ASC').all() as TaskRow[];
  const tasks: Task[] = tasksRaw.map(r => ({
    id: r.id,
    date: r.date,
    title: r.title,
    priority: r.priority,
    estimatedMinutes: r.estimated_minutes,
    completed: Boolean(r.completed),
    scheduled: Boolean(r.scheduled),
    orderIndex: r.order_index,
    createdAt: r.created_at,
  }));

  const timeblocksRaw = db.prepare('SELECT * FROM timeblocks ORDER BY start_time ASC').all() as TimeBlockRow[];
  const timeblocks: TimeBlock[] = timeblocksRaw.map(r => ({
    id: r.id,
    date: r.date,
    title: r.title,
    startTime: r.start_time,
    endTime: r.end_time,
    durationMinutes: r.duration_minutes,
    category: r.category,
    priority: (r.priority as 'must' | 'should' | 'quick_win') || 'must',
    color: r.color || undefined,
    taskId: r.task_id,
    completed: Boolean(r.completed),
    createdAt: r.created_at,
  }));

  const goalsRaw = db.prepare('SELECT * FROM goals').all() as GoalRow[];
  const goals: DailyGoal[] = goalsRaw.map(r => ({
    id: r.id,
    date: r.date,
    title: r.title,
    why: r.why || '',
    completed: Boolean(r.completed),
    milestones: r.milestones ? JSON.parse(r.milestones) : [],
    createdAt: r.created_at,
  }));

  const habitsRaw = db.prepare('SELECT * FROM habits ORDER BY order_index ASC').all() as HabitRow[];
  const habits: Habit[] = habitsRaw.map(r => ({
    id: r.id,
    title: r.title,
    icon: r.icon,
    category: r.category,
    targetDaysPerWeek: r.target_days_per_week,
    orderIndex: r.order_index,
    createdAt: r.created_at,
  }));

  const habitLogsRaw = db.prepare('SELECT * FROM habit_logs').all() as HabitLogRow[];
  const habitLogs: HabitLog[] = habitLogsRaw.map(r => ({
    id: r.id,
    habitId: r.habit_id,
    date: r.date,
    completed: Boolean(r.completed),
  }));

  const checkinsRaw = db.prepare('SELECT * FROM checkins').all() as CheckinRow[];
  const checkins: DailyCheckIn[] = checkinsRaw.map(r => ({
    id: r.id,
    date: r.date,
    energy: r.energy,
    mood: r.mood,
    note: r.note || '',
    createdAt: r.created_at,
  }));

  const reviewsRaw = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
  const reviews: DailyReview[] = reviewsRaw.map(r => ({
    id: r.id,
    date: r.date,
    rating: r.rating,
    wins: r.wins || '',
    blockers: r.blockers || '',
    learnings: r.learnings || '',
    tasksRolledOver: r.tasks_rolled_over,
    createdAt: r.created_at,
  }));

  return { tasks, timeblocks, goals, habits, habitLogs, checkins, reviews };
}

export function syncDashboardData(data: DashboardData) {
  const db = getDatabase();

  const syncTx = db.transaction(() => {
    // 1. Sync Goals
    if (data.goals.length === 0) {
      db.prepare('DELETE FROM goals').run();
    } else {
      const gPlaceholders = data.goals.map(() => '?').join(',');
      db.prepare(`DELETE FROM goals WHERE id NOT IN (${gPlaceholders})`).run(...data.goals.map(g => g.id));
    }

    const upsertGoal = db.prepare(`
      INSERT INTO goals (id, date, title, why, completed, milestones, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        why = excluded.why,
        completed = excluded.completed,
        milestones = excluded.milestones
    `);

    for (const g of data.goals) {
      upsertGoal.run(
        g.id,
        g.date,
        g.title,
        g.why,
        g.completed ? 1 : 0,
        JSON.stringify(g.milestones || []),
        g.createdAt || new Date().toISOString()
      );
    }

    // 2. Sync Tasks
    if (data.tasks.length === 0) {
      db.prepare('DELETE FROM tasks').run();
    } else {
      const tPlaceholders = data.tasks.map(() => '?').join(',');
      db.prepare(`DELETE FROM tasks WHERE id NOT IN (${tPlaceholders})`).run(...data.tasks.map(t => t.id));
    }

    const upsertTask = db.prepare(`
      INSERT INTO tasks (id, date, title, priority, estimated_minutes, completed, scheduled, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        date = excluded.date,
        title = excluded.title,
        priority = excluded.priority,
        estimated_minutes = excluded.estimated_minutes,
        completed = excluded.completed,
        scheduled = excluded.scheduled,
        order_index = excluded.order_index
    `);

    for (const t of data.tasks) {
      upsertTask.run(
        t.id,
        t.date,
        t.title,
        t.priority,
        t.estimatedMinutes,
        t.completed ? 1 : 0,
        t.scheduled ? 1 : 0,
        t.orderIndex,
        t.createdAt || new Date().toISOString()
      );
    }

    // 3. Sync Timeblocks
    if (data.timeblocks.length === 0) {
      db.prepare('DELETE FROM timeblocks').run();
    } else {
      const bPlaceholders = data.timeblocks.map(() => '?').join(',');
      db.prepare(`DELETE FROM timeblocks WHERE id NOT IN (${bPlaceholders})`).run(...data.timeblocks.map(b => b.id));
    }

    const upsertBlock = db.prepare(`
      INSERT INTO timeblocks (id, date, title, start_time, end_time, duration_minutes, category, priority, color, task_id, completed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        date = excluded.date,
        title = excluded.title,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        duration_minutes = excluded.duration_minutes,
        category = excluded.category,
        priority = excluded.priority,
        color = excluded.color,
        task_id = excluded.task_id,
        completed = excluded.completed
    `);

    for (const b of data.timeblocks) {
      upsertBlock.run(
        b.id,
        b.date,
        b.title,
        b.startTime,
        b.endTime,
        b.durationMinutes,
        b.category,
        b.priority || 'must',
        b.color || null,
        b.taskId || null,
        b.completed ? 1 : 0,
        b.createdAt || new Date().toISOString()
      );
    }

    // 4. Sync Habits
    if (data.habits.length === 0) {
      db.prepare('DELETE FROM habits').run();
    } else {
      const hPlaceholders = data.habits.map(() => '?').join(',');
      db.prepare(`DELETE FROM habits WHERE id NOT IN (${hPlaceholders})`).run(...data.habits.map(h => h.id));
    }

    const upsertHabit = db.prepare(`
      INSERT INTO habits (id, title, icon, category, target_days_per_week, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        icon = excluded.icon,
        category = excluded.category,
        target_days_per_week = excluded.target_days_per_week,
        order_index = excluded.order_index
    `);

    for (const h of data.habits) {
      upsertHabit.run(
        h.id,
        h.title,
        h.icon,
        h.category,
        h.targetDaysPerWeek,
        h.orderIndex,
        h.createdAt || new Date().toISOString()
      );
    }

    // 5. Sync Habit Logs
    if (data.habitLogs.length === 0) {
      db.prepare('DELETE FROM habit_logs').run();
    } else {
      const hlIds = data.habitLogs.map(hl => hl.id || `hl-${hl.habitId}-${hl.date}`);
      const hlPlaceholders = hlIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM habit_logs WHERE id NOT IN (${hlPlaceholders})`).run(...hlIds);
    }

    const upsertHabitLog = db.prepare(`
      INSERT INTO habit_logs (id, habit_id, date, completed, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(habit_id, date) DO UPDATE SET
        completed = excluded.completed
    `);

    for (const hl of data.habitLogs) {
      upsertHabitLog.run(
        hl.id || `hl-${hl.habitId}-${hl.date}`,
        hl.habitId,
        hl.date,
        hl.completed ? 1 : 0,
        new Date().toISOString()
      );
    }

    // 6. Sync Checkins
    const upsertCheckin = db.prepare(`
      INSERT INTO checkins (id, date, energy, mood, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        energy = excluded.energy,
        mood = excluded.mood,
        note = excluded.note
    `);

    for (const c of data.checkins) {
      upsertCheckin.run(
        c.id,
        c.date,
        c.energy,
        c.mood,
        c.note,
        c.createdAt || new Date().toISOString()
      );
    }

    // 7. Sync Reviews
    const upsertReview = db.prepare(`
      INSERT INTO reviews (id, date, rating, wins, blockers, learnings, tasks_rolled_over, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        rating = excluded.rating,
        wins = excluded.wins,
        blockers = excluded.blockers,
        learnings = excluded.learnings,
        tasks_rolled_over = excluded.tasks_rolled_over
    `);

    for (const r of data.reviews) {
      upsertReview.run(
        r.id,
        r.date,
        r.rating,
        r.wins,
        r.blockers,
        r.learnings,
        r.tasksRolledOver,
        r.createdAt || new Date().toISOString()
      );
    }
  });

  syncTx();
  return getAllDashboardData();
}
