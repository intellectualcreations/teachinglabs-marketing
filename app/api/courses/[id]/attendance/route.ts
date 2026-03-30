import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DbAttendanceSession, DbAttendanceRecord } from '@/lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// The attendance tables are defined in migration 006 but not yet in the
// auto-generated Database type consumed by createClient(). We cast
// through `unknown` so the Supabase query builder accepts them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (supabase: SupabaseClient) => supabase as unknown as SupabaseClient<any>;

/**
 * GET /api/courses/[id]/attendance
 * Return full attendance report for a course (all sessions, all students).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courseId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all attendance sessions for this course
  const { data: sessions, error: sessionsError } = await db(supabase)
    .from('attendance_sessions')
    .select('id, course_id, date, created_at')
    .eq('course_id', courseId)
    .order('date', { ascending: true })
    .returns<DbAttendanceSession[]>();

  if (sessionsError) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance sessions' },
      { status: 500 },
    );
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ courseId, sessions: [], records: [] });
  }

  const sessionIds = sessions.map((s) => s.id);

  // Fetch all attendance records for those sessions
  const { data: records, error: recordsError } = await db(supabase)
    .from('attendance_records')
    .select('id, session_id, student_id, status, created_at')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: true })
    .returns<DbAttendanceRecord[]>();

  if (recordsError) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    courseId,
    sessions,
    records: records ?? [],
  });
}

/**
 * POST /api/courses/[id]/attendance
 * Create a new attendance session for a course.
 * Body: { date: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courseId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { date?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 });
  }

  // Verify the course exists
  const { data: course, error: courseError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const { data: session, error: insertError } = await db(supabase)
    .from('attendance_sessions')
    .insert({ course_id: courseId, date: body.date })
    .select()
    .returns<DbAttendanceSession[]>()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to create attendance session' },
      { status: 500 },
    );
  }

  return NextResponse.json(session, { status: 201 });
}
