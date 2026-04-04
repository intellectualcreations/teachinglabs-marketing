import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/courses/modules?courseId=<uuid>&teacherId=<uuid>
 * Returns modules for a given course, ordered by sort_order.
 * Falls back to teacherId query param if no Supabase session cookie.
 */
export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get('courseId');
  const teacherId = request.nextUrl.searchParams.get('teacherId');

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    // Verify the course belongs to the teacher (if teacherId provided)
    if (teacherId) {
      const { data: course, error: courseError } = await (admin.from('courses') as any)
        .select('id, teacher_id')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Course lookup error:', courseError.message);
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      if (course.teacher_id !== teacherId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const { data: modules, error: modError } = await (admin.from('modules') as any)
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    if (modError) {
      console.error('Modules fetch error:', modError.message);
      return NextResponse.json({ error: modError.message }, { status: 500 });
    }

    return NextResponse.json({ modules: modules ?? [] });
  } catch (err) {
    console.error('Modules API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
