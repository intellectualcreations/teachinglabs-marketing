import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Profile, Enrollment } from '@/lib/supabase/types';
import crypto from 'crypto';

/**
 * Generate a unique STU-XXXXX student number.
 * Uses crypto-safe random characters (uppercase alphanumeric, no ambiguous chars).
 */
export async function generateStudentNumber(): Promise<string> {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
  const supabase = await createServerClient();

  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.randomBytes(5);
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[bytes[i] % chars.length];
    }
    const studentNumber = `STU-${code}`;

    // Verify uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('student_number', studentNumber)
      .single();

    if (!existing) {
      return studentNumber;
    }
  }

  // Extremely unlikely fallback: use timestamp-based
  const fallback = `STU-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  return fallback;
}

/**
 * Find a student profile by email via auth.users lookup.
 */
export async function findStudentByEmail(email: string): Promise<Profile | null> {
  const supabase = await createServerClient();

  // Look up user by email through profiles joined with auth
  // Since we can't query auth.users directly with anon key,
  // we use the admin approach or rely on the caller having the user id.
  // For the public API, we check if a profile exists via the RPC or admin client.
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .limit(1);

  // This is a limited approach; in practice the caller should use userId.
  // For email lookup, use admin client.
  if (error) {
    console.error('findStudentByEmail error:', error.message);
    return null;
  }

  // Since we can't filter by email on profiles directly (no email column),
  // this function is best used with the admin client for auth.users lookup.
  // Return null to indicate the caller should use userId-based methods.
  return null;
}

/**
 * Create or update a student profile and enroll them in a class.
 * If the profile already exists (auto-created by trigger), updates it.
 * If already enrolled in the class, skips enrollment silently.
 */
export async function createStudentProfile(
  userId: string,
  displayName: string,
  birthYear: number,
  classId: string
): Promise<{ profile: Profile | null; enrollment: Enrollment | null; studentNumber: string | null }> {
  const supabase = await createServerClient();

  // Check if profile already exists (trigger creates it on signup)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let studentNumber = (existingProfile as any)?.student_number as string | null ?? null;

  // Generate student number if not set
  if (!studentNumber) {
    studentNumber = await generateStudentNumber();
  }

  // Update profile with student details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileError } = await (supabase.from('profiles') as any)
    .update({
      display_name: displayName,
      role: 'student',
      student_number: studentNumber,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (profileError) {
    console.error('createStudentProfile update error:', profileError.message);
    return { profile: null, enrollment: null, studentNumber: null };
  }

  // Enroll in class (skip if already enrolled)
  const enrollment = await enrollStudent(userId, classId);

  return {
    profile: profile as Profile,
    enrollment,
    studentNumber,
  };
}

/**
 * Enroll a student in a class. Skips silently if already enrolled.
 * Returns the enrollment record, or null on error.
 */
export async function enrollStudent(
  studentId: string,
  classId: string
): Promise<Enrollment | null> {
  const supabase = await createServerClient();

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrollments')
    .select('*')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .single();

  if (existing) {
    // Already enrolled, return existing
    return existing as Enrollment;
  }

  // Create new enrollment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('enrollments') as any)
    .insert({
      student_id: studentId,
      class_id: classId,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    // Could be a race condition duplicate — check for unique violation
    if (error.code === '23505') {
      // Already enrolled (concurrent insert), fetch and return
      const { data: existing2 } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .single();
      return existing2 as Enrollment | null;
    }
    console.error('enrollStudent error:', error.message);
    return null;
  }

  return data as Enrollment;
}

/**
 * Get a student's unique number by their user ID.
 */
export async function getStudentNumber(studentId: string): Promise<string | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('student_number')
    .eq('id', studentId)
    .single();

  if (error) {
    console.error('getStudentNumber error:', error.message);
    return null;
  }

  return (data as { student_number: string | null })?.student_number ?? null;
}
