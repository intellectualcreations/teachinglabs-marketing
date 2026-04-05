import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/teacher/activities/copy
 * Body: { activityId: string, teacherId: string }
 * Copies a TL template activity into the teacher's personal library.
 */
export async function POST(request: NextRequest) {
  try {
    const { activityId, teacherId } = await request.json();
    if (!activityId || !teacherId) {
      return NextResponse.json({ error: 'activityId and teacherId required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch the source activity
    const { data: source, error: srcErr } = await (admin.from('assignments') as any)
      .select('*')
      .eq('id', activityId)
      .eq('is_tl_content', true)
      .single();

    if (srcErr || !source) {
      return NextResponse.json({ error: 'TL activity not found' }, { status: 404 });
    }

    // Create a personal copy for the teacher
    const { data: copy, error: copyErr } = await (admin.from('assignments') as any)
      .insert({
        title: source.title,
        description: source.description,
        teacher_id: teacherId,
        subject: source.subject,
        grade_level: source.grade_level,
        activity_type: source.activity_type,
        estimated_minutes: source.estimated_minutes,
        objective: source.objective,
        directions: source.directions,
        learning_goal: source.learning_goal,
        essential_question: source.essential_question,
        vocabulary: source.vocabulary,
        hook: source.hook,
        differentiation: source.differentiation,
        materials: source.materials,
        assessment: source.assessment,
        is_published: true,
        is_template: false,
        is_tl_content: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (copyErr) {
      return NextResponse.json({ error: copyErr.message }, { status: 500 });
    }

    return NextResponse.json({ activity: copy }, { status: 201 });
  } catch (err) {
    console.error('Copy activity error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
