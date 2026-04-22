import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher, requireTeacherOwnsClass } from '@/lib/api-auth';

/**
 * POST /api/teacher/classes/approval
 * Body: { teacherId, classId, requiresApproval: boolean }
 *
 * Toggle whether new students joining by code need teacher approval before
 * becoming active in the class. When true, students enroll as status='pending'
 * and appear in Manage Students \u2192 Pending tab.
 */
export async function POST(request: NextRequest) {
  try {
    const authRes = await requireTeacher(request);
    if ('error' in authRes) return authRes.error;
    const { user, admin } = authRes;
    const teacherId = user.id;

    const body = await request.json();
    const { classId, requiresApproval } = body || {};
    if (!classId || typeof requiresApproval !== 'boolean') {
      return NextResponse.json({ error: 'classId and requiresApproval (boolean) required' }, { status: 400 });
    }

    const ownsErr = await requireTeacherOwnsClass(admin, teacherId, classId);
    if (ownsErr) return ownsErr;

    const { error } = await (admin as any)
      .from('classes')
      .update({ requires_approval: requiresApproval })
      .eq('id', classId);

    if (error) {
      console.error('[classes/approval] update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, classId, requires_approval: requiresApproval });
  } catch (err) {
    console.error('[classes/approval] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
