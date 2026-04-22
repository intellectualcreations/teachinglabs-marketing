import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/teacher/enrollments/move
 * Body: { teacherId, studentId, toClassId }
 *
 * Moves a pending enrollment to a different class owned by the same teacher.
 * Handles the "student entered wrong join code" case.
 */
export async function POST(request: NextRequest) {
  try {
    const { teacherId, studentId, toClassId } = await request.json();
    if (!teacherId || !studentId || !toClassId) {
      return NextResponse.json({ error: 'teacherId, studentId, toClassId required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Authorize: toClassId must belong to teacher
    const { data: ownedClasses } = await (admin as any)
      .from('classes').select('id').eq('teacher_id', teacherId);
    const classIds = (ownedClasses ?? []).map((c: any) => c.id);
    if (!classIds.includes(toClassId)) {
      return NextResponse.json({ error: 'Target class not owned by teacher' }, { status: 403 });
    }

    // Upsert the student as pending in the target class.
    const { error } = await (admin as any)
      .from('enrollments')
      .upsert(
        { student_id: studentId, class_id: toClassId, status: 'pending', enrolled_at: new Date().toISOString() },
        { onConflict: 'student_id,class_id' }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[enrollments/move] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
