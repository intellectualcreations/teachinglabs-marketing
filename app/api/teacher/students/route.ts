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

    // Fetch enrollments
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('student_id, class_id, enrolled_at, status')
      .in('class_id', classIds)
      .eq('status', 'active');

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

    return NextResponse.json({
      classes: teacherClasses,
      students: studentProfiles ?? [],
      enrollments,
    });
  } catch (err) {
    console.error('Students API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
