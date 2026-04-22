import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/teacher/enrollments/actions
 * Body: { teacherId, action, studentIds: string[], classIds?: string[] }
 *
 * Actions:
 *   - 'accept'   enrollment status → 'active' (for pending join requests)
 *   - 'reject'   enrollment status → 'rejected' (keep row for audit)
 *   - 'archive'  enrollment status → 'archived' (student left / may come back)
 *   - 'reactivate' enrollment status → 'active' (bring back an archived student)
 *   - 'remove'   DELETE the enrollment row(s) (does NOT delete the user account)
 *
 * All actions scope by teacher's own classes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, action, studentIds, classIds } = body || {};
    if (!teacherId || !action || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'teacherId, action, and studentIds[] required' }, { status: 400 });
    }
    const allowed = ['accept', 'reject', 'archive', 'reactivate', 'remove'];
    if (!allowed.includes(action)) {
      return NextResponse.json({ error: `action must be one of ${allowed.join(', ')}` }, { status: 400 });
    }

    const admin = createAdminClient();

    // Scope: only classes owned by this teacher
    const { data: myClasses } = await (admin as any)
      .from('classes').select('id').eq('teacher_id', teacherId);
    const myClassIds: string[] = (myClasses ?? []).map((c: any) => c.id);
    if (myClassIds.length === 0) {
      return NextResponse.json({ error: 'No classes owned by teacher' }, { status: 403 });
    }
    const targetClassIds = Array.isArray(classIds) && classIds.length > 0
      ? classIds.filter((id: string) => myClassIds.includes(id))
      : myClassIds;

    const newStatus = ({
      accept: 'active', reject: 'rejected', archive: 'archived', reactivate: 'active',
    } as Record<string, string>)[action];

    let affected = 0;
    if (action === 'remove') {
      const { error, count } = await (admin as any)
        .from('enrollments')
        .delete({ count: 'exact' })
        .in('student_id', studentIds)
        .in('class_id', targetClassIds);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      affected = count ?? 0;
    } else {
      const { error, count } = await (admin as any)
        .from('enrollments')
        .update({ status: newStatus }, { count: 'exact' })
        .in('student_id', studentIds)
        .in('class_id', targetClassIds);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      affected = count ?? 0;
    }
    return NextResponse.json({ ok: true, affected, action });
  } catch (err) {
    console.error('[enrollments/actions] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
