import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createStudentProfile } from '@/lib/services/student-service';

/**
 * POST /api/student/complete-signup
 *
 * Called after a student clicks the magic link and lands on onboarding.
 * Generates a student number, updates profile, and creates enrollment.
 *
 * Body: { class_id: string, birth_year: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { class_id, birth_year } = body as { class_id?: string; birth_year?: number };

    if (!class_id) {
      return NextResponse.json(
        { error: 'class_id is required' },
        { status: 400 }
      );
    }

    // Validate class exists
    const { data: classData } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', class_id)
      .single();

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Get display name from profile or auth metadata
    const displayName =
      user.user_metadata?.display_name ??
      user.email ??
      'Student';

    const parsedBirthYear = birth_year ? Number(birth_year) : 2010;

    // Create/update profile and enroll
    const result = await createStudentProfile(
      user.id,
      displayName,
      parsedBirthYear,
      class_id
    );

    if (!result.profile) {
      return NextResponse.json(
        { error: 'Failed to create student profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
      enrollment: result.enrollment,
      student_number: result.studentNumber,
    });
  } catch (err) {
    console.error('complete-signup error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
