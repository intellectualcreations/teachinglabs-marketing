import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Class, Enrollment, Profile } from '@/lib/supabase/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user owns this class or is enrolled
  const classResult = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  const cls = classResult.data as Class | null;

  if (!cls) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  if (cls.teacher_id !== user.id) {
    // Check if student is enrolled
    const enrollmentResult = await supabase
      .from('enrollments')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .single();

    if (!enrollmentResult.data) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Get enrolled students with profiles
  const enrollResult = await supabase
    .from('enrollments')
    .select('student_id, enrolled_at, status')
    .eq('class_id', classId)
    .eq('status', 'active');

  if (enrollResult.error) {
    return NextResponse.json({ error: enrollResult.error.message }, { status: 500 });
  }

  const enrollments = (enrollResult.data ?? []) as Array<Pick<Enrollment, 'student_id' | 'enrolled_at' | 'status'>>;
  const studentIds = enrollments.map((e) => e.student_id);

  if (studentIds.length === 0) {
    return NextResponse.json([]);
  }

  const profileResult = await supabase
    .from('profiles')
    .select('*')
    .in('id', studentIds);

  const profiles = (profileResult.data ?? []) as Profile[];

  // Merge enrollment info with profiles
  const students = profiles.map((p) => {
    const enrollment = enrollments.find((e) => e.student_id === p.id);
    return {
      ...p,
      enrolled_at: enrollment?.enrolled_at,
      enrollment_status: enrollment?.status,
    };
  });

  return NextResponse.json(students);
}
