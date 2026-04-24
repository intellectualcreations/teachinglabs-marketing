import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';

/**
 * GET /api/teacher/courses/modules?courseId=<uuid>
 * Returns modules for a given course, ordered by sort_order.
 * Caller identity is always taken from the authenticated session; any
 * `teacherId` query param is ignored.
 */
export async function GET(request: NextRequest) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin } = auth;

  const courseId = request.nextUrl.searchParams.get('courseId');
  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
  }

  try {
    // Verify the course belongs to the authenticated teacher.
    const { data: course, error: courseError } = await (admin.from('courses') as any)
      .select('id, teacher_id')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Course lookup error:', courseError.message);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
