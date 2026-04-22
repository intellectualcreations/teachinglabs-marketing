import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireTeacher, requireTeacherOwnsStudent } from '@/lib/api-auth';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/teacher/generate-overview
 * Body: { studentId, teacherId, regenerate? }
 *
 * Returns a teacher-facing 1-paragraph overview of the student's baseline
 * assessment. Caches on student_assessments.ai_overview. If regenerate=true,
 * forces a fresh generation even if cached.
 */
export async function POST(request: NextRequest) {
  try {
    const authRes = await requireTeacher(request);
    if ('error' in authRes) return authRes.error;
    const { user, admin } = authRes;
    const teacherId = user.id;

    const body = await request.json();
    const { studentId, regenerate } = body || {};
    if (!studentId) {
      return NextResponse.json({ error: 'studentId required' }, { status: 400 });
    }

    const ownsErr = await requireTeacherOwnsStudent(admin, teacherId, studentId);
    if (ownsErr) return ownsErr;

    // Load assessment + profile + responses
    const { data: assessment } = await (admin as any)
      .from('student_assessments')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (!assessment) {
      return NextResponse.json({ error: 'No baseline assessment yet' }, { status: 404 });
    }

    // Fast path: return cached overview unless regenerate
    if (!regenerate && assessment.ai_overview) {
      return NextResponse.json({
        overview: assessment.ai_overview,
        generated_at: assessment.ai_overview_generated_at,
        cached: true,
      });
    }

    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('first_name, last_name, preferred_name, age, baseline_level, primary_intelligence, superpower_title')
      .eq('id', studentId)
      .maybeSingle();

    const { data: responses } = await (admin as any)
      .from('assessment_responses')
      .select('category, question_text, student_answer, correct_answer, signal_result')
      .eq('student_id', studentId)
      .order('question_order', { ascending: true });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI key not configured' }, { status: 500 });
    }

    // Build the transcript for the AI
    const transcript = (responses ?? []).map((r: any) => {
      const answer = r.student_answer || '(blank)';
      const correct = r.correct_answer ? ` | Correct: ${r.correct_answer}` : '';
      const signal = r.signal_result ? ` | Signal: ${r.signal_result}` : '';
      return `[${r.category.toUpperCase()}] Q: ${r.question_text}\n    Student answer: ${answer}${correct}${signal}`;
    }).join('\n\n');

    const name = profile?.preferred_name || profile?.first_name || assessment.preferred_name || 'the student';
    const age = profile?.age || assessment.age || 'unknown';
    const baseline = profile?.baseline_level || 'Not yet assessed';

    const system = `You write ONE concise paragraph (3-5 sentences, max 100 words) introducing a K-12 student to their teacher based on their baseline assessment data.

Requirements:
- Write in a warm, professional, teacher-to-teacher tone. You are the AI co-teacher briefing the human teacher.
- Start with the student's first name. Include age only if relevant.
- Mention 2-3 SPECIFIC things — actual interests, strengths, or struggles grounded in their answers. Quote short phrases when powerful.
- Be honest about where they need support without being clinical or reductive.
- End with one concrete teaching suggestion or opening for the teacher.
- Do NOT include scores, levels, or percentages — the teacher can see those elsewhere.
- Do NOT use filler like "Overall" or "In summary." Just the paragraph.
- Never say "This student" — use their name.`;

    const userMsg = `Student profile:
Name: ${name}
Age: ${age}
Baseline level: ${baseline}
Primary intelligence: ${profile?.primary_intelligence || 'not set'}
Superpower: ${profile?.superpower_title || 'not set'}
Theme chosen: ${assessment.theme || 'not set'}
Interests: ${(assessment.interests ?? []).join(', ') || 'none recorded'}

Assessment transcript:
${transcript || '(no responses yet)'}`;

    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system,
      messages: [{ role: 'user', content: userMsg }],
    });
    const overview = ((resp.content[0] as any)?.text || '').trim();
    const generated_at = new Date().toISOString();

    // Cache
    await (admin as any)
      .from('student_assessments')
      .update({ ai_overview: overview, ai_overview_generated_at: generated_at })
      .eq('student_id', studentId);

    return NextResponse.json({ overview, generated_at, cached: false });
  } catch (err) {
    console.error('[generate-overview] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
