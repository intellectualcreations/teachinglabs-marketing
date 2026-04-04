import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/courses?teacherId=<uuid>
 * Returns { courses[], orphanedActivities[] } for the library page.
 * Handles case where courses/modules tables don't exist yet (pre-migration).
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    // Try to fetch courses — if table doesn't exist, return empty
    let courses: any[] = [];
    let modules: any[] = [];
    let coursesExist = true;

    try {
      const { data: courseData, error: courseError } = await (admin.from('courses') as any)
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (courseError) {
        // Table doesn't exist or column error — pre-migration
        console.log('Courses table not available:', courseError.message);
        coursesExist = false;
      } else {
        courses = courseData ?? [];
      }
    } catch {
      coursesExist = false;
    }

    // Fetch modules if courses exist
    if (coursesExist && courses.length > 0) {
      const courseIds = courses.map((c: any) => c.id);
      try {
        const { data: modData, error: modError } = await (admin.from('modules') as any)
          .select('*')
          .in('course_id', courseIds)
          .order('sort_order', { ascending: true });

        if (!modError && modData) {
          modules = modData;
        }
      } catch {
        // modules table doesn't exist
      }
    }

    // Count activities per module and per course
    const moduleIds = modules.map((m: any) => m.id);
    let activityCounts: Record<string, number> = {};
    let orphanedActivities: any[] = [];

    // Fetch all teacher assignments
    const { data: allAssignments, error: assignError } = await admin
      .from('assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (assignError) {
      console.error('Assignments fetch error:', assignError.message);
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    const assignments = allAssignments ?? [];

    if (coursesExist) {
      // Try to check for course_id column on assignments
      try {
        // Count activities per module
        for (const a of assignments) {
          const moduleId = (a as any).module_id;
          const courseId = (a as any).course_id;
          if (moduleId) {
            activityCounts[moduleId] = (activityCounts[moduleId] || 0) + 1;
          }
          if (!courseId) {
            orphanedActivities.push(a);
          }
        }
      } catch {
        // course_id column doesn't exist yet — all are orphaned
        orphanedActivities = assignments;
      }
    } else {
      orphanedActivities = assignments;
    }

    // Build enriched courses with modules and counts
    const enrichedCourses = courses.map((course: any) => {
      const courseModules = modules.filter((m: any) => m.course_id === course.id);
      let totalActivities = 0;
      const enrichedModules = courseModules.map((m: any) => {
        const count = activityCounts[m.id] || 0;
        totalActivities += count;
        return { ...m, activity_count: count };
      });

      // Also count activities directly on course but no module
      const directCount = assignments.filter(
        (a: any) => (a as any).course_id === course.id && !(a as any).module_id
      ).length;
      totalActivities += directCount;

      return {
        ...course,
        modules: enrichedModules,
        module_count: enrichedModules.length,
        activity_count: totalActivities,
      };
    });

    return NextResponse.json({
      courses: enrichedCourses,
      orphanedActivities,
      coursesAvailable: coursesExist,
    });
  } catch (err) {
    console.error('Courses API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/teacher/courses
 * Create a new course.
 * Body: { title, description, subject, grade_level, teacher_id }
 */
export async function POST(request: NextRequest) {
  const admin = createAdminClient();

  try {
    const body = await request.json();
    const { title, description, subject, grade_level, standards, teacher_id } = body;

    if (!title || !teacher_id) {
      return NextResponse.json(
        { error: 'title and teacher_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await (admin.from('courses') as any)
      .insert({
        title,
        description: description || null,
        subject: subject || null,
        grade_level: grade_level || null,
        standards: standards || null,
        teacher_id,
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create course error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course: data }, { status: 201 });
  } catch (err) {
    console.error('Create course API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
