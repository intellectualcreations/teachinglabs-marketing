import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/courses/[courseId]/modules?teacherId=<uuid>
 * Returns modules for a specific course, ordered by sort_order.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  const admin = createAdminClient();

  try {
    // Verify course ownership if teacherId provided
    if (teacherId) {
      const { data: course, error: courseError } = await (admin.from('courses') as any)
        .select('id, teacher_id')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
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
    console.error('Modules GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/teacher/courses/[courseId]/modules
 * Create a new module in the specified course.
 * Body: { title, description?, sort_order, teacher_id }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const admin = createAdminClient();

  try {
    const body = await request.json();
    const { title, description, sort_order, teacher_id } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    // Verify course exists and belongs to teacher
    if (teacher_id) {
      const { data: course, error: courseError } = await (admin.from('courses') as any)
        .select('id, teacher_id')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      if (course.teacher_id !== teacher_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
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
