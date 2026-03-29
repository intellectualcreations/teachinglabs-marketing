import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Class } from '@/lib/supabase/types';
import crypto from 'crypto';

/**
 * Generate a unique, readable join code like "TL-7K3M-X9P2".
 * Uses crypto-safe random characters (no ambiguous chars: 0/O, 1/I/L).
 */
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `TL-${code.slice(0, 4)}-${code.slice(4)}`;
}

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
    .ilike('join_code', code.trim())
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

  // Generate a unique join code with collision retry
  let joinCode = generateJoinCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from('classes')
      .select('id')
      .eq('join_code', joinCode)
      .single();
    if (!existing) break;
    joinCode = generateJoinCode();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('classes') as any)
    .insert({ ...classData, join_code: joinCode })
    .select()
    .single();

  if (error) {
    console.error('createClass error:', error.message);
    return null;
  }
  return data as Class | null;
}

export async function enrollStudentInClass(
  classId: string,
  studentId: string
): Promise<boolean> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('enrollments') as any)
    .insert({ class_id: classId, student_id: studentId, status: 'active' });

  if (error) {
    console.error('enrollStudentInClass error:', error.message);
    return false;
  }
  return true;
}

/**
 * Get all enrolled students for a class with their profile info.
 */
export async function getClassStudents(classId: string): Promise<
  Array<{ enrollment_id: string; student_id: string; enrolled_at: string; status: string; profile: { id: string; display_name: string | null; student_number: string | null; avatar_url: string | null } }>
> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from('enrollments') as any)
    .select('id, student_id, enrolled_at, status, profiles:student_id(id, display_name, student_number, avatar_url)')
    .eq('class_id', classId)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: true });

  if (error) {
    console.error('getClassStudents error:', error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    enrollment_id: row.id,
    student_id: row.student_id,
    enrolled_at: row.enrolled_at,
    status: row.status,
    profile: row.profiles ?? { id: row.student_id, display_name: null, student_number: null, avatar_url: null },
  }));
}

/**
 * Get all classes for a teacher with enrollment counts.
 */
export async function getTeacherClasses(teacherId: string): Promise<
  Array<Class & { enrollment_count: number }>
> {
  const supabase = await createServerClient();

  // Get classes
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (classError || !classes) {
    console.error('getTeacherClasses error:', classError?.message);
    return [];
  }

  // Get enrollment counts for each class
  const classIds = (classes as Class[]).map(c => c.id);
  if (classIds.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: enrollments, error: enrollError } = await (supabase
    .from('enrollments')
    .select('class_id') as any)
    .in('class_id', classIds)
    .eq('status', 'active');

  if (enrollError) {
    console.error('getTeacherClasses enrollment count error:', enrollError.message);
    // Return classes without counts
    return (classes as Class[]).map(c => ({ ...c, enrollment_count: 0 }));
  }

  // Count enrollments per class
  const countMap = new Map<string, number>();
  for (const e of ((enrollments ?? []) as Array<{ class_id: string }>)) {
    countMap.set(e.class_id, (countMap.get(e.class_id) ?? 0) + 1);
  }

  return (classes as Class[]).map(c => ({
    ...c,
    enrollment_count: countMap.get(c.id) ?? 0,
  }));
}

/**
 * Get all unique students across all of a teacher's classes.
 */
export async function getTeacherStudents(teacherId: string): Promise<
  Array<{ id: string; display_name: string | null; student_number: string | null; avatar_url: string | null; class_ids: string[] }>
> {
  const supabase = await createServerClient();

  // Get teacher's class IDs
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id')
    .eq('teacher_id', teacherId);

  if (classError || !classes || classes.length === 0) {
    return [];
  }

  const classIds = (classes as Array<{ id: string }>).map(c => c.id);

  // Get all enrollments for those classes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: enrollmentData, error: enrollError } = await (supabase
    .from('enrollments')
    .select('student_id, class_id') as any)
    .in('class_id', classIds)
    .eq('status', 'active');

  const enrollments = (enrollmentData ?? []) as Array<{ student_id: string; class_id: string }>;

  if (enrollError || enrollments.length === 0) {
    return [];
  }

  // Group class_ids by student
  const studentClassMap = new Map<string, string[]>();
  for (const e of enrollments) {
    const existing = studentClassMap.get(e.student_id) ?? [];
    existing.push(e.class_id);
    studentClassMap.set(e.student_id, existing);
  }

  const studentIds = Array.from(studentClassMap.keys());

  // Fetch profiles for all students
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles, error: profileError } = await (supabase
    .from('profiles')
    .select('id, display_name, student_number, avatar_url') as any)
    .in('id', studentIds);

  if (profileError) {
    console.error('getTeacherStudents profile error:', profileError.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (profiles ?? []).map((p: any) => ({
    id: p.id,
    display_name: p.display_name,
    student_number: p.student_number,
    avatar_url: p.avatar_url,
    class_ids: studentClassMap.get(p.id) ?? [],
  }));
}
