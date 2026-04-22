import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireTeacher, requireTeacherOwnsStudent } from '@/lib/api-auth';

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
    const authRes = await requireTeacher(request);
    if ('error' in authRes) return authRes.error;
    const { user, admin } = authRes;
    const teacherId = user.id;

    const body = await request.json();
    const { studentId, reason } = body || {};
    if (!studentId) {
      return NextResponse.json({ error: 'studentId required' }, { status: 400 });
    }
    const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
    if (trimmedReason.length < 3) {
      return NextResponse.json({ error: 'Reason is required (minimum 3 characters) for audit log.' }, { status: 400 });
    }

    const ownsErr = await requireTeacherOwnsStudent(admin, teacherId, studentId);
    if (ownsErr) return ownsErr;

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

    // Permanent audit log entry — written to server stdout so it's retained in
    // platform logs regardless of whether any downstream audit table is populated.
    console.log(JSON.stringify({
      event: 'student_deleted',
      teacher_id: teacherId,
      student_id: studentId,
      reason: trimmedReason,
      at: new Date().toISOString(),
    }));
    return NextResponse.json({ ok: true, studentId });
  } catch (err) {
    console.error('[delete student] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
