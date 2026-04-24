import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

/**
 * GET /api/student/my-classes
 * Returns the authenticated user's enrolled classes with teacher info,
 * assignments, and submissions. Caller identity comes only from the
 * authenticated session (cookie or Bearer token); any `userId` query
 * param is ignored.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { user, admin } = auth;
  const userId = user.id;

  // Fetch enrollments (active + pending)
  // Note: 'pending' may not exist in the DB enum yet, so fetch active first, then try pending
  const { data: activeEnrollments } = await admin
    .from('enrollments')
    .select('class_id, status')
    .eq('student_id', userId)
    .eq('status', 'active');

  let pendingEnrollments: { class_id: string; status: string }[] = [];
  try {
    const { data: pending } = await admin
      .from('enrollments')
      .select('class_id, status')
      .eq('student_id', userId)
      .eq('status', 'pending' as any);
    pendingEnrollments = pending ?? [];
  } catch { /* pending enum may not exist yet */ }

  const enrollments = [...(activeEnrollments ?? []), ...pendingEnrollments];

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ classes: [], teachers: [], enrollments: [], assignments: [], submissions: [] });
  }

  const enrollmentStatusMap = new Map(enrollments.map((e: { class_id: string; status: string }) => [e.class_id, e.status]));
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

  // Add enrollment_status to each class
  const classesWithStatus = (classes ?? []).map((c: { id: string }) => ({
    ...c,
    enrollment_status: enrollmentStatusMap.get(c.id) || 'active',
  }));

  return NextResponse.json({
    classes: classesWithStatus,
    teachers: teachers ?? [],
    enrollments: enrollments ?? [],
    assignments: assignments ?? [],
    submissions: submissions ?? [],
  });
}
