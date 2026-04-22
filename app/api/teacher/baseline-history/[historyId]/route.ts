import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireTeacher } from '@/lib/api-auth';

/**
 * GET /api/teacher/baseline-history/[historyId]?teacherId=<uuid>
 * Returns an archived baseline (snapshot) for viewing in the panel.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ historyId: string }> }
) {
  const { historyId } = await params;
  const authRes = await requireTeacher(request);
  if ('error' in authRes) return authRes.error;
  const { user, admin } = authRes;
  const teacherId = user.id;
  if (!historyId) {
    return NextResponse.json({ error: 'historyId required' }, { status: 400 });
  }

  const { data: history, error } = await (admin as any)
    .from('baseline_history')
    .select('*')
    .eq('id', historyId)
    .maybeSingle();

  if (error || !history) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Authorize: teacher must have the student in one of their classes
  const { data: teacherClasses } = await (admin as any)
    .from('classes')
    .select('id')
    .eq('teacher_id', teacherId);
  const classIds = (teacherClasses ?? []).map((c: any) => c.id);
  const { data: enrollment } = await (admin as any)
    .from('enrollments')
    .select('student_id')
    .eq('student_id', history.student_id)
    .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .maybeSingle();
  if (!enrollment) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json({ history });
}
