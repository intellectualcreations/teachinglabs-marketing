import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';

/**
 * GET /api/teacher/courses/[courseId]/modules
 * Returns modules for a specific course, ordered by sort_order.
 * Caller identity comes from the authenticated session; any `teacherId`
 * query param is ignored.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin } = auth;

  const { courseId } = await params;

  try {
    // Verify course ownership against the authenticated teacher.
    const { data: course, error: courseError } = await (admin.from('courses') as any)
      .select('id, teacher_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
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
    console.error('Modules GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/teacher/courses/[courseId]/modules
 * Create a new module in the specified course.
 * Body: { title, description?, sort_order }
 * Caller identity comes from the authenticated session.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin } = auth;

  const { courseId } = await params;

  try {
    const body = await request.json();
    const { title, description, sort_order } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    // Verify course exists and belongs to the authenticated teacher.
    const { data: course, error: courseError } = await (admin.from('courses') as any)
      .select('id, teacher_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await (admin.from('modules') as any)
      .insert({
        course_id: courseId,
        title,
        description: description || null,
        sort_order: sort_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create module error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ module: data }, { status: 201 });
  } catch (err) {
    console.error('Module POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
