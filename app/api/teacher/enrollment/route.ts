import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/enrollment?classId=<uuid>
 * Returns all enrollments for a class (pending + active)
 */
export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get('classId');
  if (!classId) return NextResponse.json({ error: 'classId required' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('enrollments')
    .select('id, student_id, class_id, status, enrolled_at, profiles!enrollments_student_id_fkey(display_name, preferred_name, student_number)')
    .eq('class_id', classId)
    .order('enrolled_at', { ascending: false });

  if (error) {
    // Fallback without join if FK name is different
    const { data: fallback } = await admin
      .from('enrollments')
      .select('*')
      .eq('class_id', classId)
      .order('enrolled_at', { ascending: false });
    return NextResponse.json({ enrollments: fallback ?? [] });
  }

  return NextResponse.json({ enrollments: data ?? [] });
}

/**
 * PATCH /api/teacher/enrollment
 * Body: { enrollmentId, action: 'approve' | 'deny' }
 */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { enrollmentId, action } = body;

  if (!enrollmentId || !['approve', 'deny'].includes(action)) {
    return NextResponse.json({ error: 'enrollmentId and action (approve|deny) required' }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === 'approve') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from('enrollments') as any)
      .update({ status: 'active' })
      .eq('id', enrollmentId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, status: 'active' });
  }

  if (action === 'deny') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from('enrollments') as any)
      .delete()
      .eq('id', enrollmentId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, status: 'removed' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
