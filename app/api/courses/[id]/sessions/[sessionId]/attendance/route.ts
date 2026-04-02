import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidStatus } from '@/lib/attendance-store';
import type { DbAttendanceRecord } from '@/lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Cast to untyped client for tables not yet in the generated Database type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (supabase: SupabaseClient) => supabase as unknown as SupabaseClient<any>;

/**
 * POST /api/courses/[id]/sessions/[sessionId]/attendance
 * Mark attendance for a student.
 * Body: { studentId: string, status: 'present' | 'absent' | 'late' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> },
) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { studentId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.studentId || !body.status) {
    return NextResponse.json(
      { error: 'studentId and status are required' },
      { status: 400 },
    );
  }

  if (!isValidStatus(body.status)) {
    return NextResponse.json(
      { error: 'status must be one of: present, absent, late' },
      { status: 400 },
    );
  }

  const { data: record, error } = await db(supabase)
    .from('attendance_records')
    .insert({
      session_id: sessionId,
      student_id: body.studentId,
      status: body.status,
    })
    .select()
    .returns<DbAttendanceRecord[]>()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Attendance already recorded for this student in this session' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 },
    );
  }

  return NextResponse.json(record, { status: 201 });
}

/**
 * PATCH /api/courses/[id]/sessions/[sessionId]/attendance
 * Update existing attendance record.
 * Body: { recordId: string, status: 'present' | 'absent' | 'late' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> },
) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { recordId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.recordId || !body.status) {
    return NextResponse.json(
      { error: 'recordId and status are required' },
      { status: 400 },
    );
  }

  if (!isValidStatus(body.status)) {
    return NextResponse.json(
      { error: 'status must be one of: present, absent, late' },
      { status: 400 },
    );
  }

  const { data: record, error } = await db(supabase)
    .from('attendance_records')
    .update({ status: body.status })
    .eq('id', body.recordId)
    .eq('session_id', sessionId)
    .select()
    .returns<DbAttendanceRecord[]>()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
      { status: 500 },
    );
  }

  if (!record) {
    return NextResponse.json(
      { error: 'Attendance record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(record);
}
