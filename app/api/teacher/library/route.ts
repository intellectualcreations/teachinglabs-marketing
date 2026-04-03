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

    // Fetch assignments for teacher
    const { data: assignments, error: assignError } = await supabase
      .from('assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (assignError) {
      console.error('Library assignments error:', assignError.message);
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    return NextResponse.json({
      classes: teacherClasses,
      assignments: assignments ?? [],
    });
  } catch (err) {
    console.error('Library API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
