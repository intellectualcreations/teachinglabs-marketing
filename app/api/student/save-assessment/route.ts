import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { userId, profile, preferredName, primaryIntelligence, superpowerTitle, responses } = await req.json();

    if (!userId || !profile) {
      return NextResponse.json({ error: 'Missing userId or profile' }, { status: 400 });
    }

    // Save assessment
    const { error: assessErr } = await (admin.from as any)('student_assessments').upsert(
      { student_id: userId, ...profile },
      { onConflict: 'student_id' }
    );

    if (assessErr) {
      console.error('Assessment save error:', assessErr);
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    // Save assessment responses (generic per-question capture)
    if (Array.isArray(responses) && responses.length > 0) {
      const rows = responses.map((r: any) => ({
        student_id: userId,
        category: r.category,
        question_key: r.question_key,
        question_order: r.question_order ?? null,
        question_text: r.question_text ?? null,
        question_type: r.question_type ?? null,
        options_shown: r.options_shown ?? null,
        student_answer: r.student_answer ?? null,
        correct_answer: r.correct_answer ?? null,
        signal_result: r.signal_result ?? null,
        scoring_metadata: r.scoring_metadata ?? null,
      }));
      const { error: respErr } = await (admin.from as any)('assessment_responses').upsert(
        rows, { onConflict: 'student_id,question_key' }
      );
      if (respErr) console.error('Assessment responses save error:', respErr);
    }

    // Update profile with preferred_name and superpower
    if (preferredName) {
      const profileUpdate: Record<string, unknown> = { preferred_name: preferredName };
      if (primaryIntelligence) profileUpdate.primary_intelligence = primaryIntelligence;
      if (superpowerTitle) profileUpdate.superpower_title = superpowerTitle;

      const { error: profileErr } = await admin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileErr) {
        console.error('Profile update error:', profileErr);
        // Don't fail the whole request for this
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
