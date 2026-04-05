import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/student-detail?studentId=<uuid>&teacherId=<uuid>
 * Returns { profile, assessment, enrollments: [{class_id, class_name, enrolled_at}] }
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId');
  const teacherId = request.nextUrl.searchParams.get('teacherId');

  if (!studentId || !teacherId) {
    return NextResponse.json(
      { error: 'studentId and teacherId are required' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    // 1. Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 2. Get student assessment data (table may not exist yet)
    let assessment = null;
    try {
      const { data: assessmentData } = await supabase
        .from('student_assessments')
        .select('*')
        .eq('student_id', studentId)
        .single();
      assessment = assessmentData;
    } catch {
      // Table may not exist yet
    }

    // 3. Get enrollments for this student in this teacher's classes
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', teacherId);

    const teacherClasses = classes ?? [];
    let enrollments: { class_id: string; class_name: string; enrolled_at: string }[] = [];

    if (teacherClasses.length > 0) {
      const classIds = teacherClasses.map((c: { id: string }) => c.id);
      const classMap = new Map(teacherClasses.map((c: { id: string; name: string }) => [c.id, c.name]));

      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('class_id, enrolled_at')
        .eq('student_id', studentId)
        .in('class_id', classIds)
        .eq('status', 'active');

      enrollments = (enrollmentData ?? []).map((e: { class_id: string; enrolled_at: string }) => ({
        class_id: e.class_id,
        class_name: classMap.get(e.class_id) || 'Unknown Class',
        enrolled_at: e.enrolled_at,
      }));
    }

    return NextResponse.json({ profile, assessment, enrollments });
  } catch (err) {
    console.error('Student detail API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
