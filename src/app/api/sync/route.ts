import { NextResponse } from 'next/server';
import { getAllDashboardData, syncDashboardData, getDatabase } from '@/lib/db';
import { DashboardData } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = getAllDashboardData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /api/sync GET error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DashboardData;
    const updatedData = syncDashboardData(payload);
    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('API /api/sync POST error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Missing type or id' }, { status: 400 });
    }

    const db = getDatabase();
    if (type === 'task') {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      db.prepare('UPDATE timeblocks SET task_id = NULL WHERE task_id = ?').run(id);
    } else if (type === 'timeblock') {
      const block = db.prepare('SELECT task_id FROM timeblocks WHERE id = ?').get(id) as { task_id?: string | null } | undefined;
      if (block?.task_id) {
        db.prepare('UPDATE tasks SET scheduled = 0 WHERE id = ?').run(block.task_id);
      }
      db.prepare('DELETE FROM timeblocks WHERE id = ?').run(id);
    } else if (type === 'habit') {
      db.prepare('DELETE FROM habits WHERE id = ?').run(id);
      db.prepare('DELETE FROM habit_logs WHERE habit_id = ?').run(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
