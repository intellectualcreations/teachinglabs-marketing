import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/teacher/students/delete
 * Body: { teacherId, studentId, reason? }
 *
 * HARD DELETE a student — removes auth user + profile + everything cascading.
 * Use only for bad actors / bypassed-invite accounts. Teacher must have the
 * student in one of their classes. Archive is NOT delete — use enrollments/actions
 * action=archive for students who left but may return.
 *
 * Returns { ok: true, studentId } on success.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, studentId, reason } = body || {};
    if (!teacherId || !studentId) {
      return NextResponse.json({ error: 'teacherId and studentId required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Authorize
    const { data: myClasses } = await (admin as any)
      .from('classes').select('id').eq('teacher_id', teacherId);
    const classIds = (myClasses ?? []).map((c: any) => c.id);
    if (classIds.length === 0) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const { data: enr } = await (admin as any)
      .from('enrollments').select('student_id').eq('student_id', studentId).in('class_id', classIds);
    if (!enr || enr.length === 0) {
      return NextResponse.json({ error: 'Student is not in your classes' }, { status: 403 });
    }

    // Cascade deletions (FKs should handle most, but be explicit for belt-and-suspenders)
    try { await (admin as any).from('enrollments').delete().eq('student_id', studentId); } catch {}
    try { await (admin as any).from('assessment_responses').delete().eq('student_id', studentId); } catch {}
    try { await (admin as any).from('student_assessments').delete().eq('student_id', studentId); } catch {}
    try { await (admin as any).from('baseline_history').delete().eq('student_id', studentId); } catch {}
    try { await (admin as any).from('teacher_notes').delete().eq('student_id', studentId); } catch {}
    try { await (admin as any).from('profiles').delete().eq('id', studentId); } catch {}

    // Finally delete the auth user
    const { error } = await (admin.auth as any).admin.deleteUser(studentId);
    if (error) {
      console.error('[delete student] auth delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[delete student] teacher=${teacherId} deleted studentId=${studentId} reason=${reason || ''}`);
    return NextResponse.json({ ok: true, studentId });
  } catch (err) {
    console.error('[delete student] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
