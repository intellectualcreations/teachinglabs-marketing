import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/classes/[id]/allow-student-topics
 * Body: { teacherId, allow }
 * Toggle whether students can create new topics on the message board in this class.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { teacherId, allow } = body || {};

  if (!id || !teacherId || typeof allow !== 'boolean') {
    return NextResponse.json({ error: 'id, teacherId, allow required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify teacher owns this class
  const { data: cls } = await (supabase as any)
    .from('classes')
    .select('teacher_id')
    .eq('id', id)
    .maybeSingle();
  if (!cls || cls.teacher_id !== teacherId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { error } = await (supabase as any)
    .from('classes')
    .update({ allow_student_topics: allow })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, allow });
}
