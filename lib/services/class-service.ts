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
