import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/student/activity-status?studentId=<uuid>&classId=<uuid>
 * Returns status records for all activities in a class for this student.
 *
 * POST /api/student/activity-status
 * Body: { studentId, activityId, classId, action: 'turn_in' | 'archive' | 'unarchive' }
 */
export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId');
  const classId = request.nextUrl.searchParams.get('classId');
  if (!studentId || !classId) {
    return NextResponse.json({ error: 'studentId and classId required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await (admin as any)
    .from('student_activity_status')
    .select('*')
    .eq('student_id', studentId)
    .eq('class_id', classId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ statuses: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { studentId, activityId, classId, action } = await request.json();
  if (!studentId || !activityId || !classId || !action) {
    return NextResponse.json({ error: 'studentId, activityId, classId, and action required' }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === 'turn_in') {
    const { data, error } = await (admin as any)
      .from('student_activity_status')
      .upsert({
        student_id: studentId,
        activity_id: activityId,
        class_id: classId,
        status: 'done',
        turned_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id,activity_id,class_id' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: data });
  }

  if (action === 'archive' || action === 'unarchive') {
    const { data, error } = await (admin as any)
      .from('student_activity_status')
      .upsert({
        student_id: studentId,
        activity_id: activityId,
        class_id: classId,
        archived: action === 'archive',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id,activity_id,class_id' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: data });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
