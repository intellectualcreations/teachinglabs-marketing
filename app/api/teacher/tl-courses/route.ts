import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/teacher/tl-courses — fetch all published/template courses (Teaching Labs catalog)
export async function GET(request: NextRequest) {
  try {
    const admin = createAdminClient();

    // Get all published courses (is_published = true) that are templates (is_template = true)
    // or just all published courses for now
    const { data: courses, error } = await (admin.from('courses') as any)
      .select('*')
      .eq('is_published', true)
      .order('subject', { ascending: true })
      .order('grade_level', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch modules for these courses
    const courseIds = (courses ?? []).map((c: any) => c.id);
    let modules: any[] = [];
    if (courseIds.length > 0) {
      const { data: mods } = await (admin.from('modules') as any)
        .select('id, title, description, course_id')
        .in('course_id', courseIds);
      modules = mods ?? [];
    }

    // Enrich courses with module info
    const enriched = (courses ?? []).map((course: any) => {
      const courseModules = modules.filter((m: any) => m.course_id === course.id);
      return {
        ...course,
        modules: courseModules,
        module_count: courseModules.length,
        activity_count: 0, // TODO: count activities per course
      };
    });

    return NextResponse.json({ courses: enriched });
  } catch (err) {
    console.error('TL courses API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/teacher/tl-courses/import — copy a TL course to teacher's library
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_id, teacher_id } = body;

    if (!course_id || !teacher_id) {
      return NextResponse.json({ error: 'course_id and teacher_id required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch the source course
    const { data: source, error: srcErr } = await (admin.from('courses') as any)
      .select('*')
      .eq('id', course_id)
      .single();

    if (srcErr || !source) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Create a copy for the teacher
    const { data: newCourse, error: createErr } = await (admin.from('courses') as any)
      .insert({
        title: source.title,
        description: source.description,
        subject: source.subject,
        grade_level: source.grade_level,
        teacher_id,
        is_published: false,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }

    // Copy modules
    const { data: srcModules } = await (admin.from('modules') as any)
      .select('*')
      .eq('course_id', course_id)
      .order('created_at', { ascending: true });

    if (srcModules && srcModules.length > 0) {
      for (const mod of srcModules) {
        const { data: newMod } = await (admin.from('modules') as any)
          .insert({
            title: mod.title,
            description: mod.description,
            course_id: newCourse.id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        // Copy activities for this module
        if (newMod) {
          const { data: srcActivities } = await (admin.from('assignments') as any)
            .select('*')
            .eq('module_id', mod.id)
            .eq('course_id', course_id);

          if (srcActivities && srcActivities.length > 0) {
            for (const act of srcActivities) {
              await (admin.from('assignments') as any).insert({
                title: act.title,
                description: act.description,
                type: act.type || 'activity',
                teacher_id,
                course_id: newCourse.id,
                module_id: newMod.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (err) {
    console.error('Import TL course error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
