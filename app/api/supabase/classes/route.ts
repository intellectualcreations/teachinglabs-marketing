import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClassesByTeacher, createClass } from '@/lib/services/class-service';
import { getProfile } from '@/lib/services/profile-service';
import type { Class, Enrollment } from '@/lib/supabase/types';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile.role === 'teacher' || profile.role === 'admin') {
    const classes = await getClassesByTeacher(user.id);
    return NextResponse.json(classes);
  }

  // Students: get classes via enrollments
  const enrollResult = await supabase
    .from('enrollments')
    .select('class_id')
    .eq('student_id', user.id)
    .eq('status', 'active');

  const enrollments = (enrollResult.data ?? []) as Array<Pick<Enrollment, 'class_id'>>;
  const classIds = enrollments.map((e) => e.class_id);
  if (classIds.length === 0) {
    return NextResponse.json([]);
  }

  const classResult = await supabase
    .from('classes')
    .select('*')
    .in('id', classIds);

  const classes = (classResult.data ?? []) as Class[];
  return NextResponse.json(classes);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newClass = await createClass({
    ...body,
    teacher_id: user.id,
  });

  if (!newClass) {
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }

  return NextResponse.json(newClass, { status: 201 });
}
