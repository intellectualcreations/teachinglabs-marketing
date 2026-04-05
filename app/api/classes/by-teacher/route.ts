import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/classes/by-teacher?teacherId=<uuid>
 * Returns teacher's classes with enrollment and assignment counts.
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch classes
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (classError) {
    console.error('by-teacher classes error:', classError.message);
    return NextResponse.json({ error: classError.message }, { status: 500 });
  }

  if (!classes || classes.length === 0) {
    return NextResponse.json([]);
  }

  const classIds = classes.map((c: { id: string }) => c.id);

  // Fetch enrollment counts
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('class_id')
    .in('class_id', classIds)
    .eq('status', 'active');

  const enrollCounts = new Map<string, number>();
  (enrollments ?? []).forEach((e: { class_id: string }) => {
    enrollCounts.set(e.class_id, (enrollCounts.get(e.class_id) ?? 0) + 1);
  });

  // Fetch assignment counts from junction table
  const { data: classActivities } = await supabase
    .from('class_activities')
    .select('class_id')
    .in('class_id', classIds);

  const assignCounts = new Map<string, number>();
  (classActivities ?? []).forEach((a: { class_id: string }) => {
    assignCounts.set(a.class_id, (assignCounts.get(a.class_id) ?? 0) + 1);
  });

  // Combine
  const result = classes.map((c: { id: string }) => ({
    ...c,
    studentCount: enrollCounts.get(c.id) ?? 0,
    assignmentCount: assignCounts.get(c.id) ?? 0,
  }));

  return NextResponse.json(result);
}
