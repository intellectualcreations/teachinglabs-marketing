import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * PATCH /api/teacher/class-activities
 * Body: { classId, activityId, is_open?, due_date? }
 * Updates is_open and/or due_date on the class_activities junction row.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, activityId, is_open, due_date } = body;

    if (!classId || !activityId) {
      return NextResponse.json({ error: 'classId and activityId required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof is_open === 'boolean') updates.is_open = is_open;
    if (due_date !== undefined) updates.due_date = due_date;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = (supabase as any).from('class_activities');
    const { data, error } = await q
      .update(updates)
      .eq('class_id', classId)
      .eq('activity_id', activityId)
      .select()
      .single();

    if (error) {
      console.error('class-activities PATCH error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('class-activities error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
