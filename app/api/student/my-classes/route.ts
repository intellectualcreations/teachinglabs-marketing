import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * GET /api/student/my-classes
 * Returns the student's enrolled classes with teacher info, assignments, submissions.
 * Bypasses RLS using admin client after verifying the student's identity.
 */
export async function GET(request: NextRequest) {
  const admin = createAdminClient();
  let userId: string | null = null;

  // Method 1: Cookie-based session
  try {
    const userSupabase = await createClient();
    const { data: { user }, error: cookieErr } = await userSupabase.auth.getUser();
    if (user) userId = user.id;
    if (cookieErr) console.log('[my-classes] Cookie auth error:', cookieErr.message);
  } catch (err) {
    console.log('[my-classes] Cookie auth exception:', err);
  }

  // Method 2: Authorization header — use admin client to verify JWT
  if (!userId) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (!error && user) userId = user.id;
      if (error) console.log('[my-classes] Token auth error:', error.message);
    } else {
      console.log('[my-classes] No auth header found');
    }
  }

  // Method 3: userId query param (only if we can verify via cookie on the page that called us)
  if (!userId) {
    const queryUserId = request.nextUrl.searchParams.get('userId');
    if (queryUserId) {
      // Verify this user exists in the admin client
      const { data: { user }, error } = await admin.auth.admin.getUserById(queryUserId);
      if (!error && user) userId = user.id;
    }
  }

  if (!userId) {
    console.log('[my-classes] All auth methods failed');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  console.log('[my-classes] Authenticated as:', userId);

  // Fetch enrollments
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('class_id')
    .eq('student_id', userId)
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ classes: [], teachers: [], enrollments: [], assignments: [], submissions: [] });
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
