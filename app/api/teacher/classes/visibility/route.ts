import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireTeacher, requireTeacherOwnsClass } from '@/lib/api-auth';

/**
 * POST /api/teacher/classes/visibility
 * Body: { teacherId, classId, action }
 * Actions:
 *   - 'archive'   → is_archived = true, archived_at = now()
 *   - 'unarchive' → is_archived = false, archived_at = null
 *   - 'hide'      → show_in_sidebar = false
 *   - 'show'      → show_in_sidebar = true
 */
export async function POST(request: NextRequest) {
  try {
    const authRes = await requireTeacher(request);
    if ('error' in authRes) return authRes.error;
    const { user, admin } = authRes;
    const teacherId = user.id;

    const { classId, action } = await request.json();
    if (!classId || !action) {
      return NextResponse.json({ error: 'classId and action required' }, { status: 400 });
    }
    const allowed = ['archive', 'unarchive', 'hide', 'show'];
    if (!allowed.includes(action)) {
      return NextResponse.json({ error: `action must be one of ${allowed.join(', ')}` }, { status: 400 });
    }

    const ownsErr = await requireTeacherOwnsClass(admin, teacherId, classId);
    if (ownsErr) return ownsErr;

    const update: Record<string, unknown> = {};
    if (action === 'archive')   { update.is_archived = true;  update.archived_at = new Date().toISOString(); }
    if (action === 'unarchive') { update.is_archived = false; update.archived_at = null; }
    if (action === 'hide')      { update.show_in_sidebar = false; }
    if (action === 'show')      { update.show_in_sidebar = true; }

    const { error } = await (admin as any)
      .from('classes').update(update).eq('id', classId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, action });
  } catch (err) {
    console.error('[classes/visibility] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
