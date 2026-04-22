import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/teacher/recalibrate
 * Body: { studentId, teacherId }
 *
 * Archives the student's current baseline (assessment + all responses + AI overview)
 * into baseline_history, then clears the current assessment and responses so the
 * student will be re-onboarded on next login (the onboarding flow auto-triggers
 * when no baseline exists).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, teacherId } = body || {};
    if (!studentId || !teacherId) {
      return NextResponse.json({ error: 'studentId and teacherId required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Authorize: teacher must have the student in one of their classes
    const { data: teacherClasses } = await (admin as any)
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId);
    const classIds = (teacherClasses ?? []).map((c: any) => c.id);
    if (classIds.length === 0) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const { data: enrollment } = await (admin as any)
      .from('enrollments')
      .select('student_id')
      .eq('student_id', studentId)
      .in('class_id', classIds)
      .maybeSingle();
    if (!enrollment) {
      return NextResponse.json({ error: 'Student not in your classes' }, { status: 403 });
    }

    // Snapshot current state
    const { data: assessment } = await (admin as any)
      .from('student_assessments')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (!assessment) {
      return NextResponse.json({ error: 'No baseline to recalibrate' }, { status: 404 });
    }

    const { data: responses } = await (admin as any)
      .from('assessment_responses')
      .select('*')
      .eq('student_id', studentId)
      .order('question_order', { ascending: true });

    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('baseline_level, primary_intelligence')
      .eq('id', studentId)
      .maybeSingle();

    // Write history row
    const { error: histErr } = await (admin as any)
      .from('baseline_history')
      .insert({
        student_id: studentId,
        archived_by: teacherId,
        baseline_level: profile?.baseline_level ?? null,
        primary_intelligence: profile?.primary_intelligence ?? null,
        ai_overview: assessment.ai_overview ?? null,
        assessment_snapshot: assessment,
        responses_snapshot: responses ?? [],
        completed_at: assessment.completed_at ?? null,
      });
    if (histErr) {
      console.error('[recalibrate] history insert error:', histErr);
      return NextResponse.json({ error: histErr.message }, { status: 500 });
    }

    // Clear current assessment + responses so onboarding re-triggers
    await (admin as any).from('assessment_responses').delete().eq('student_id', studentId);
    await (admin as any).from('student_assessments').delete().eq('student_id', studentId);

    // Also null out derived profile fields so the UI reflects "no baseline yet"
    await (admin as any)
      .from('profiles')
      .update({
        baseline_level: null,
        primary_intelligence: null,
        superpower_title: null,
        baseline_assessment_at: null,
      })
      .eq('id', studentId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[recalibrate] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
