import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

async function authorize(admin: any, teacherId: string, studentId: string): Promise<boolean> {
  const { data: teacherClasses } = await admin.from('classes').select('id').eq('teacher_id', teacherId);
  const classIds = (teacherClasses ?? []).map((c: any) => c.id);
  if (classIds.length === 0) return false;
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('student_id')
    .eq('student_id', studentId)
    .in('class_id', classIds)
    .maybeSingle();
  return !!enrollment;
}

/**
 * GET /api/teacher/notes?teacherId=<uuid>&studentId=<uuid>&from=<ISO>&to=<ISO>
 * Returns this teacher's notes about this student, newest first.
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  const studentId = request.nextUrl.searchParams.get('studentId');
  const from = request.nextUrl.searchParams.get('from');
  const to = request.nextUrl.searchParams.get('to');
  if (!teacherId || !studentId) {
    return NextResponse.json({ error: 'teacherId and studentId required' }, { status: 400 });
  }
  const admin = createAdminClient();
  if (!(await authorize(admin, teacherId, studentId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

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
  const body = await request.json();
  const { teacherId, studentId, content } = body || {};
  if (!teacherId || !studentId || !content?.trim()) {
    return NextResponse.json({ error: 'teacherId, studentId, and content required' }, { status: 400 });
  }
  const admin = createAdminClient();
  if (!(await authorize(admin, teacherId, studentId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
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
  const id = request.nextUrl.searchParams.get('id');
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!id || !teacherId) {
    return NextResponse.json({ error: 'id and teacherId required' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await (admin as any).from('teacher_notes')
    .delete()
    .eq('id', id)
    .eq('teacher_id', teacherId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
