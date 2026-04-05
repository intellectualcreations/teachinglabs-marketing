import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/library?teacherId=<uuid>
 * Returns { classes, assignments[] } for the library page.
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
      .eq('teacher_id', teacherId);

    if (classError) {
      console.error('Library classes error:', classError.message);
      return NextResponse.json({ error: classError.message }, { status: 500 });
    }

    const teacherClasses = classes ?? [];

    if (teacherClasses.length === 0) {
      return NextResponse.json({ classes: [], assignments: [] });
    }

    // Fetch teacher's OWN activities (not TL Content)
    const { data: ownAssignments, error: assignError } = await supabase
      .from('assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_tl_content', false)
      .order('created_at', { ascending: false });

    if (assignError) {
      console.error('Library assignments error:', assignError.message);
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    const assignments = ownAssignments ?? [];

    // Enrich with course and module titles
    const enriched = assignments ?? [];
    const courseIds = [...new Set(enriched.map((a: any) => a.course_id).filter(Boolean))];
    const moduleIds = [...new Set(enriched.map((a: any) => a.module_id).filter(Boolean))];

    let courseMap = new Map<string, string>();
    let moduleMap = new Map<string, string>();

    if (courseIds.length > 0) {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', courseIds);
      (courses || []).forEach((c: any) => courseMap.set(c.id, c.title));
    }

    if (moduleIds.length > 0) {
      const { data: modules } = await supabase
        .from('modules')
        .select('id, title')
        .in('id', moduleIds);
      (modules || []).forEach((m: any) => moduleMap.set(m.id, m.title));
    }

    const withTitles = enriched.map((a: any) => ({
      ...a,
      course_title: a.course_id ? courseMap.get(a.course_id) || null : null,
      module_title: a.module_id ? moduleMap.get(a.module_id) || null : null,
    }));

    // Fetch class_activities assignments for all teacher's activities
    const activityIds = enriched.map((a: any) => a.id);
    let classActivities: Record<string, string[]> = {};
    if (activityIds.length > 0) {
      const { data: caRows } = await supabase
        .from('class_activities')
        .select('activity_id, class_id')
        .in('activity_id', activityIds);
      for (const row of (caRows || []) as any[]) {
        if (!classActivities[row.activity_id]) classActivities[row.activity_id] = [];
        classActivities[row.activity_id].push(row.class_id);
      }
    }

    return NextResponse.json({
      classes: teacherClasses,
      assignments: withTitles,
      classActivities,
    });
  } catch (err) {
    console.error('Library API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
