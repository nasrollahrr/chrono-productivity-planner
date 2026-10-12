# ⏱️ Chrono Pro — 24-Hour Unified Daily Productivity Engine

A modular, proactive daily productivity dashboard and time-blocking application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **SQLite / LocalStorage offline persistence**.

Inspired by modern tools like **Linear**, **Sunsama**, and **Cron / Notion Calendar**.

---

## ✨ Features

- **🕒 24-Hour Proactive Time-Blocking Timeline:**
  - Full 24-hour vertical timeline grid spanning `00:00` to `24:00` (48 thirty-minute slots).
  - Smart auto-scroll (`useRef`) on mount that centers the live pulsing time indicator line in the viewport.
  - Priority-coded timeblocks:
    - **P1 [Must Do]:** Vivid crimson accent with high visual weight.
    - **P2 [Should Do]:** Warm amber badge.
    - **P3 [Quick Win]:** Emerald compact badge.
  - Interactive direct checkbox, context menus, and drag-to-resize duration in 15-minute increments.

- **⏰ Proactive 15-Minute Task Reminder System:**
  - Background polling engine checking every 30 seconds for upcoming scheduled tasks.
  - Synthesized dual-tone harmonic sound chime using the **Web Audio API** ($587.33\text{ Hz}\ [\text{D}_5] \rightarrow 880.00\text{ Hz}\ [\text{A}_5]$) requiring zero MP3 assets.
  - Floating top-right in-app toast with countdown progress and priority indicators.
  - Native Web Notifications API desktop alerts that appear even when minimized.
  - Navbar bell icon (`🔔`) showing permission status (`active`, `pending`, `denied`) and audio test chime trigger.

- **📥 Unscheduled Inbox & Drag-and-Drop:**
  - Capture tasks on the fly into an inbox backlog.
  - Drag tasks directly onto any timeline slot or click "Schedule" to automatically snap into the next open hour.

- **🎯 Pinned "North Star" Banner:**
  - Sleek horizontal banner pinned at the top for today's singular focus objective.

- **🔥 Daily Habit Streak Tracker:**
  - Daily toggle checklist with consecutive streak counters and 7-day trend sparklines.

- **🌙 2-Minute End-of-Day Debrief:**
  - Daily shutdown review modal capturing ratings, wins, blockers, and automated rollover of unfinished tasks to tomorrow.

- **⌨️ Keyboard-First Shortcuts:**
  - `T`: Jump to Today
  - `N`: Quick-schedule at current hour slot
  - `[` / `]`: Navigate Previous / Next Day
  - `⌘K` / `Ctrl+K`: Global command palette
  - `R`: Trigger End-of-Day Debrief
  - `D`: Toggle Dark / Light mode
  - `?`: Open keyboard cheatsheet

- **🛡️ Bulletproof Persistence & Clean Slate:**
  - Zero hardcoded mock tasks.
  - Instant offline responsiveness with `localStorage` lazy state initialization.
  - Reconciled SQLite persistence via Next.js Route Handlers (`/api/sync`).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v26)
- npm or pnpm

### 2. Installation
```bash
git clone <your-repo-url>
cd vibrant-oppenheimer
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📦 Deploying to GitHub

To push this repository to your GitHub account:

```bash
# 1. Create a new empty repository on GitHub (e.g., chrono-planner)
# 2. Link your remote repository:
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 3. Rename branch to main (already set):
git branch -M main

# 4. Push your commits:
git push -u origin main
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark Linear palette)
- **Icons:** Lucide React
- **Audio:** Web Audio API (Synthesized Oscillators)
- **Database:** Local SQLite (`better-sqlite3`) + `localStorage` fallback
- **VFX:** `canvas-confetti`
