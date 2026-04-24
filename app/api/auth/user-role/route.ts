import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

/**
 * GET /api/auth/user-role
 * Returns the authenticated user's role and assessment/onboarding status.
 * Any `userId` query param is ignored — identity is always taken from
 * the authenticated session.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { user, admin: supabase } = auth;
  const userId = user.id;

  // Get profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', userId)
    .single();

  const role = (profile as { role?: string } | null)?.role ?? null;
  const displayName = (profile as { display_name?: string } | null)?.display_name ?? null;

  // Check assessment completion for students
  let hasAssessment = false;
  if (role === 'student') {
    try {
      const { data: assessment } = await supabase
        .from('student_assessments')
        .select('completed_at')
        .eq('student_id', userId)
        .single();
      hasAssessment = !!(assessment as { completed_at?: string } | null)?.completed_at;
    } catch {
      // Table may not exist
    }
  }

  // Check onboarding completion for teachers
  let hasOnboarding = false;
  if (role === 'teacher') {
    try {
      const { data: soul } = await supabase
        .from('teacher_souls')
        .select('teacher_id')
        .eq('teacher_id', userId)
        .single();
      hasOnboarding = !!(soul as { teacher_id?: string } | null)?.teacher_id;
    } catch {
      // Table may not exist
    }
  }

  return NextResponse.json({ role, displayName, hasAssessment, hasOnboarding });
}
