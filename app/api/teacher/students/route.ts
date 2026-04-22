import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/students?teacherId=<uuid>
 * Returns { classes, students[], enrollments[] } for the students page.
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

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

    // Fetch enrollments — return everything except 'rejected' (those stay hidden by default).
    // The UI filters further by status (active / pending / archived).
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('student_id, class_id, enrolled_at, status')
      .in('class_id', classIds)
      .neq('status', 'rejected');

    const enrollments = enrollmentData ?? [];

    if (enrollments.length === 0) {
      return NextResponse.json({ classes: teacherClasses, students: [], enrollments: [] });
    }

    // Get unique student IDs and fetch their profiles
    const studentIds = [...new Set(enrollments.map((e: { student_id: string }) => e.student_id))];
    const { data: studentProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', studentIds);

    // Pull email addresses from auth.users (not stored on profiles)
    const emailMap = new Map<string, string>();
    try {
      let page = 1;
      const ids = new Set(studentIds);
      while (ids.size > 0) {
        const { data } = await (supabase as any).auth.admin.listUsers({ page, perPage: 1000 });
        if (!data?.users?.length) break;
        for (const u of data.users) {
          if (ids.has(u.id)) { emailMap.set(u.id, u.email || ''); ids.delete(u.id); }
        }
        if (data.users.length < 1000) break;
        page++;
      }
    } catch (e) {
      console.warn('email lookup failed:', (e as Error).message);
    }
    const profilesWithEmail = (studentProfiles ?? []).map((p: any) => ({ ...p, email: emailMap.get(p.id) || '' }));

    // Fetch baseline assessment completion dates (table may not exist yet)
    let assessments: { student_id: string; completed_at: string }[] = [];
    try {
      const { data: assessmentData } = await supabase
        .from('student_assessments')
        .select('student_id, completed_at, preferred_name')
        .in('student_id', studentIds);
      assessments = (assessmentData ?? []) as { student_id: string; completed_at: string }[];
    } catch {
      // Table may not exist yet — return empty
    }

    return NextResponse.json({
      classes: teacherClasses,
      students: profilesWithEmail,
      enrollments,
      assessments: assessments ?? [],
    });
  } catch (err) {
    console.error('Students API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
