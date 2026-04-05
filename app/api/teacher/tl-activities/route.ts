import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/tl-activities
 * Returns all Teaching Labs template activities (is_tl_content = true)
 * available to all teachers in the library.
 */
export async function GET() {
  try {
    const admin = createAdminClient();

    const { data, error } = await (admin.from('assignments') as any)
      .select('id, title, description, subject, grade_level, activity_type, estimated_minutes, objective, directions, learning_goal, essential_question, grade_level')
      .eq('is_tl_content', true)
      .order('subject', { ascending: true })
      .order('grade_level', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activities: data ?? [] });
  } catch (err) {
    console.error('TL activities API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
