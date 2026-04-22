import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireTeacher, requireTeacherOwnsStudent } from '@/lib/api-auth';

/**
 * GET /api/teacher/notes?teacherId=<uuid>&studentId=<uuid>&from=<ISO>&to=<ISO>
 * Returns this teacher's notes about this student, newest first.
 */
export async function GET(request: NextRequest) {
  const authRes = await requireTeacher(request);
  if ('error' in authRes) return authRes.error;
  const { user, admin } = authRes;
  const teacherId = user.id;

  const studentId = request.nextUrl.searchParams.get('studentId');
  const from = request.nextUrl.searchParams.get('from');
  const to = request.nextUrl.searchParams.get('to');
  if (!studentId) {
    return NextResponse.json({ error: 'studentId required' }, { status: 400 });
  }
  const ownsErr = await requireTeacherOwnsStudent(admin, teacherId, studentId);
  if (ownsErr) return ownsErr;

  let q = (admin as any).from('teacher_notes')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (from) q = q.gte('created_at', from);
  if (to)   q = q.lte('created_at', to);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

/**
 * POST /api/teacher/notes
 * Body: { teacherId, studentId, content }
 */
export async function POST(request: NextRequest) {
  const authRes = await requireTeacher(request);
  if ('error' in authRes) return authRes.error;
  const { user, admin } = authRes;
  const teacherId = user.id;

  const body = await request.json();
  const { studentId, content } = body || {};
  if (!studentId || !content?.trim()) {
    return NextResponse.json({ error: 'studentId and content required' }, { status: 400 });
  }
  const ownsErr = await requireTeacherOwnsStudent(admin, teacherId, studentId);
  if (ownsErr) return ownsErr;
  const { data, error } = await (admin as any).from('teacher_notes')
    .insert({ teacher_id: teacherId, student_id: studentId, content: content.trim() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}

/**
 * DELETE /api/teacher/notes?id=<uuid>&teacherId=<uuid>
 */
export async function DELETE(request: NextRequest) {
  const authRes = await requireTeacher(request);
  if ('error' in authRes) return authRes.error;
  const { user, admin } = authRes;
  const teacherId = user.id;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }
  const { error } = await (admin as any).from('teacher_notes')
    .delete()
    .eq('id', id)
    .eq('teacher_id', teacherId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
