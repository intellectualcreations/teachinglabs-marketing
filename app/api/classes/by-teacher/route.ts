import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';

/**
 * GET /api/classes/by-teacher
 * Returns the authenticated teacher's classes with enrollment and
 * assignment counts. Any `teacherId` query param is IGNORED — the
 * caller's identity is always taken from the authenticated session.
 */
export async function GET(request: NextRequest) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin: supabase } = auth;
  const teacherId = user.id;
  const includeArchived = request.nextUrl.searchParams.get('includeArchived') === 'true';
  const sidebarOnly = request.nextUrl.searchParams.get('sidebarOnly') === 'true';

  // Fetch classes. Gracefully fall back if the new columns aren't migrated yet.
  let classes: any[] | null = null;
  let classError: any = null;
  {
    let q = (supabase as any).from('classes').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false });
    if (!includeArchived) q = q.eq('is_archived', false);
    if (sidebarOnly)      q = q.eq('show_in_sidebar', true);
    const res = await q;
    if (res.error && /(is_archived|show_in_sidebar)/.test(String(res.error.message || ''))) {
      // Columns missing — fall back to unfiltered (pre-migration 021 state)
      const res2 = await supabase.from('classes').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false });
      classes = res2.data;
      classError = res2.error;
    } else {
      classes = res.data;
      classError = res.error;
    }
  }

  if (classError) {
    console.error('by-teacher classes error:', classError.message);
    return NextResponse.json({ error: classError.message }, { status: 500 });
  }

  if (!classes || classes.length === 0) {
    return NextResponse.json([]);
  }

  const classIds = classes.map((c: { id: string }) => c.id);

  // Parallelize enrollments + class_activities — they don't depend on each other.
  // This halves the API latency on warm calls (~2 serial queries → 1 parallel round-trip).
  const [enrollmentsRes, classActivitiesRes] = await Promise.all([
    supabase.from('enrollments').select('class_id').in('class_id', classIds).eq('status', 'active'),
    supabase.from('class_activities').select('class_id').in('class_id', classIds),
  ]);

  const enrollCounts = new Map<string, number>();
  (enrollmentsRes.data ?? []).forEach((e: { class_id: string }) => {
    enrollCounts.set(e.class_id, (enrollCounts.get(e.class_id) ?? 0) + 1);
  });

  const assignCounts = new Map<string, number>();
  (classActivitiesRes.data ?? []).forEach((a: { class_id: string }) => {
    assignCounts.set(a.class_id, (assignCounts.get(a.class_id) ?? 0) + 1);
  });

  const result = classes.map((c: { id: string }) => ({
    ...c,
    studentCount: enrollCounts.get(c.id) ?? 0,
    assignmentCount: assignCounts.get(c.id) ?? 0,
  }));

  return NextResponse.json(result, {
    headers: {
      // Short cache + stale-while-revalidate so repeat loads feel instant.
      'Cache-Control': 'private, max-age=5, stale-while-revalidate=30',
    },
  });
}
