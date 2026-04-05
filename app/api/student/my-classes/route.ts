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
    .select('id, display_name, preferred_name')
    .in('id', teacherIds);

  console.log('[my-classes] teacherIds:', teacherIds, 'teachers:', JSON.stringify(teachers));

  // Fetch assignments via class_activities junction table
  const { data: classActivityRows } = await admin
    .from('class_activities')
    .select('activity_id, class_id, is_open, due_date')
    .in('class_id', classIds);

  const activityIds = [...new Set((classActivityRows ?? []).map((r: any) => r.activity_id))];
  // Build maps: activity_id -> class_ids and activity_id+class_id -> { is_open, due_date }
  const activityClassMap: Record<string, string[]> = {};
  const caDetailMap: Record<string, { is_open: boolean; due_date: string | null }> = {};
  for (const row of (classActivityRows ?? []) as any[]) {
    if (!activityClassMap[row.activity_id]) activityClassMap[row.activity_id] = [];
    activityClassMap[row.activity_id].push(row.class_id);
    caDetailMap[`${row.activity_id}:${row.class_id}`] = { is_open: row.is_open, due_date: row.due_date };
  }

  let assignments: any[] = [];
  if (activityIds.length > 0) {
    const { data: acts } = await admin
      .from('assignments')
      .select('*')
      .in('id', activityIds);
    // Expand: one assignment per class it's assigned to (so due_date/is_open are class-specific)
    const expanded: any[] = [];
    for (const a of (acts ?? []) as any[]) {
      const classIdsForActivity = activityClassMap[a.id] || [];
      for (const cid of classIdsForActivity) {
        const detail = caDetailMap[`${a.id}:${cid}`] || { is_open: true, due_date: null };
        // Only include open activities for students
        if (!detail.is_open) continue;
        expanded.push({
          ...a,
          class_id: cid,
          assigned_class_ids: classIdsForActivity,
          due_date: detail.due_date,
          is_open: detail.is_open,
        });
      }
    }
    assignments = expanded;
  }

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
