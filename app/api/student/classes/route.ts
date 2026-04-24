import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

/**
 * GET /api/student/classes
 * Returns the authenticated user's enrolled classes. Any `studentId` query
 * param is ignored — identity is taken only from the session.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { user, admin } = auth;
  const userId = user.id;

  const { data: enrollments } = await (admin as any)
    .from('enrollments')
    .select('class_id')
    .eq('student_id', userId)
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ classes: [] });
  }

  const classIds = enrollments.map((e: any) => e.class_id);

  const { data: classes } = await (admin as any)
    .from('classes')
    .select('id, name, subject, icon, teacher_id')
    .in('id', classIds)
    .order('name', { ascending: true });

  return NextResponse.json({ classes: classes ?? [] });
}
