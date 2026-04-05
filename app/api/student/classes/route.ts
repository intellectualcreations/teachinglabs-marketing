import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * GET /api/student/classes
 * Returns the authenticated student's enrolled classes.
 * Uses admin client to bypass RLS on enrollments.
 */
export async function GET(request: NextRequest) {
  const admin = createAdminClient();

  // Authenticate via cookie
  let userId: string | null = null;
  try {
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (user) userId = user.id;
  } catch { /* ignore */ }

  // Fallback: query param (for client-side calls)
  if (!userId) {
    userId = request.nextUrl.searchParams.get('studentId');
  }

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

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
