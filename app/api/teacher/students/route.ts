import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';

/**
 * GET /api/teacher/students
 * Returns { classes, students[], enrollments[] } for the authenticated teacher only.
 * Auth: session cookie or Authorization: Bearer token.
 * teacherId query param is ignored — we use the authenticated user's id.
 */
export async function GET(request: NextRequest) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin: supabase } = auth;
  const teacherId = user.id;

  try {
    // Fetch teacher's classes
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (classError) {
      console.error('Students classes error:', classError.message);
      return NextResponse.json({ error: classError.message }, { status: 500 });
    }

    const teacherClasses = classes ?? [];

    if (teacherClasses.length === 0) {
      return NextResponse.json({ classes: [], students: [], enrollments: [] });
    }

    const classIds = teacherClasses.map((c: { id: string }) => c.id);

    // Fetch enrollments. enrollment_status enum supports: active, pending, inactive,
    // and (after migration 020) archived + rejected. We fall back gracefully if
    // the enum hasn't been extended yet by trying broad → narrow.
    let enrollmentData: any[] | null = null;
    let enrollmentError: any = null;
    {
      // Try the full set first (post-migration)
      const res = await supabase
        .from('enrollments')
        .select('student_id, class_id, enrolled_at, status')
        .in('class_id', classIds)
        .in('status', ['active', 'pending', 'archived', 'inactive']);
      if (!res.error) {
        enrollmentData = res.data;
      } else {
        // Fall back to the pre-migration enum values
        const res2 = await supabase
          .from('enrollments')
          .select('student_id, class_id, enrolled_at, status')
          .in('class_id', classIds)
          .in('status', ['active', 'pending', 'inactive']);
        enrollmentData = res2.data;
        enrollmentError = res2.error;
      }
    }
    if (enrollmentError) {
      console.error('Enrollment fetch error:', enrollmentError.message);
    }

    const enrollments = enrollmentData ?? [];

    if (enrollments.length === 0) {
      return NextResponse.json({ classes: teacherClasses, students: [], enrollments: [] });
    }

    // Get unique student IDs
    const studentIds = [...new Set(enrollments.map((e: { student_id: string }) => e.student_id))];

    // Parallelize the three downstream fetches:
    //  (1) profiles for these students
    //  (2) auth.users to pull emails (single page of 1000 covers all realistic class sizes)
    //  (3) student_assessments for baseline dates + preferred names
    const [profilesRes, usersRes, assessmentsRes] = await Promise.all([
      supabase.from('profiles').select('*').in('id', studentIds),
      (supabase as any).auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from('student_assessments').select('student_id, completed_at, preferred_name').in('student_id', studentIds).then(
        (r: any) => r,
        (e: any) => ({ data: [], error: e }),
      ),
    ]);

    const studentProfiles = profilesRes.data ?? [];
    const emailMap = new Map<string, string>();
    const idSet = new Set(studentIds);
    for (const u of (usersRes?.data?.users ?? [])) {
      if (idSet.has(u.id)) emailMap.set(u.id, u.email || '');
    }
    const profilesWithEmail = studentProfiles.map((p: any) => ({ ...p, email: emailMap.get(p.id) || '' }));
    const assessments = (assessmentsRes as any)?.data ?? [];

    return NextResponse.json({
      classes: teacherClasses,
      students: profilesWithEmail,
      enrollments,
      assessments,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=5, stale-while-revalidate=30',
      },
    });
  } catch (err) {
    console.error('Students API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
