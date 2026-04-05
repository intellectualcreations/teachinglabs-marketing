import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/user-role?userId=<uuid>
 * Returns the user's role and assessment status using admin client (bypasses RLS).
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

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
