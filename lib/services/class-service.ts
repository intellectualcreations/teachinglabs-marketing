import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Class } from '@/lib/supabase/types';

export async function getClassesByTeacher(teacherId: string): Promise<Class[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getClassesByTeacher error:', error.message);
    return [];
  }
  return (data ?? []) as Class[];
}

export async function getClassByJoinCode(code: string): Promise<Class | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('join_code', code)
    .single();

  if (error) {
    console.error('getClassByJoinCode error:', error.message);
    return null;
  }
  return data as Class | null;
}

export async function createClass(classData: {
  name: string;
  subject?: string;
  grade_level?: string;
  teacher_id: string;
  school_id?: string;
}): Promise<Class | null> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('classes') as any)
    .insert(classData)
    .select()
    .single();

  if (error) {
    console.error('createClass error:', error.message);
    return null;
  }
  return data as Class | null;
}

export async function enrollStudent(
  classId: string,
  studentId: string
): Promise<boolean> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('enrollments') as any)
    .insert({ class_id: classId, student_id: studentId, status: 'active' });

  if (error) {
    console.error('enrollStudent error:', error.message);
    return false;
  }
  return true;
}
