import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * GET /api/student/my-classes
 * Returns the student's enrolled classes with teacher info.
 * Bypasses RLS using admin client after verifying the student's identity.
 */
export async function GET(request: NextRequest) {
  let userId: string | null = null;

  // Method 1: Cookie-based session
  try {
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (user) userId = user.id;
  } catch { /* try header */ }

  // Method 2: Authorization header
  if (!userId) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (userRes.ok) {
        const userData = await userRes.json();
        userId = userData.id;
      }
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch enrollments
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('class_id')
    .eq('student_id', userId)
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ classes: [], teachers: [], enrollments: [] });
  }

  const classIds = enrollments.map((e: { class_id: string }) => e.class_id);

  // Fetch classes
  const { data: classes } = await admin
    .from('classes')
    .select('*')
    .in('id', classIds);

  // Fetch teacher profiles
  const teacherIds = [...new Set((classes ?? []).map((c: { teacher_id: string }) => c.teacher_id))];
  const { data: teachers } = await admin
    .from('profiles')
    .select('id, display_name, email')
    .in('id', teacherIds);

  // Fetch assignments
  const { data: assignments } = await admin
    .from('assignments')
    .select('*')
    .in('class_id', classIds);

  // Fetch submissions for this student
  const assignmentIds = (assignments ?? []).map((a: { id: string }) => a.id);
  let submissions = null;
  if (assignmentIds.length > 0) {
    const { data: subs } = await admin
      .from('submissions')
      .select('*')
      .eq('student_id', userId)
      .in('assignment_id', assignmentIds);
    submissions = subs;
  }

  return NextResponse.json({
    classes: classes ?? [],
    teachers: teachers ?? [],
    enrollments: enrollments ?? [],
    assignments: assignments ?? [],
    submissions: submissions ?? [],
  });
}
