/**
 * Pre-generate AI overview paragraphs for all seeded Coach Stewart students.
 * Writes to student_assessments.ai_overview so the teacher panel shows them
 * immediately without waiting for the first-open generation.
 *
 * Run: npx tsx scripts/backfill-ai-overviews.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You write ONE concise paragraph (3-5 sentences, max 100 words) introducing a K-12 student to their teacher based on their baseline assessment data.

Requirements:
- Write in a warm, professional, teacher-to-teacher tone. You are the AI co-teacher briefing the human teacher.
- Start with the student's first name. Include age only if relevant.
- Mention 2-3 SPECIFIC things — actual interests, strengths, or struggles grounded in their answers. Quote short phrases when powerful.
- Be honest about where they need support without being clinical or reductive.
- End with one concrete teaching suggestion or opening for the teacher.
- Do NOT include scores, levels, or percentages — the teacher can see those elsewhere.
- Do NOT use filler like "Overall" or "In summary." Just the paragraph.
- Never say "This student" — use their name.`;

async function generate(studentId: string): Promise<string | null> {
  const [{ data: assessment }, { data: profile }, { data: responses }] = await Promise.all([
    (admin as any).from('student_assessments').select('*').eq('student_id', studentId).maybeSingle(),
    (admin as any).from('profiles').select('first_name, last_name, preferred_name, age, baseline_level, primary_intelligence, superpower_title').eq('id', studentId).maybeSingle(),
    (admin as any).from('assessment_responses').select('category, question_text, student_answer, correct_answer, signal_result').eq('student_id', studentId).order('question_order', { ascending: true }),
  ]);

  if (!assessment) return null;

  const transcript = (responses ?? []).map((r: any) => {
    const a = r.student_answer || '(blank)';
    const c = r.correct_answer ? ` | Correct: ${r.correct_answer}` : '';
    const s = r.signal_result ? ` | Signal: ${r.signal_result}` : '';
    return `[${r.category.toUpperCase()}] Q: ${r.question_text}\n    Student answer: ${a}${c}${s}`;
  }).join('\n\n');

  const name = profile?.preferred_name || profile?.first_name || assessment.preferred_name || 'the student';
  const userMsg = `Student profile:
Name: ${name}
Age: ${profile?.age || assessment.age || 'unknown'}
Baseline level: ${profile?.baseline_level || 'Not yet assessed'}
Primary intelligence: ${profile?.primary_intelligence || 'not set'}
Superpower: ${profile?.superpower_title || 'not set'}
Theme chosen: ${assessment.theme || 'not set'}
Interests: ${(assessment.interests ?? []).join(', ') || 'none recorded'}

Assessment transcript:
${transcript || '(no responses yet)'}`;

  const resp = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  });
  return ((resp.content[0] as any)?.text || '').trim();
}

async function main() {
  const { data: users } = await (admin.auth as any).admin.listUsers({ page: 1, perPage: 1000 });
  const seeded = (users.users as any[]).filter(u => /^imastudent\d+@stewart\.in$/i.test(u.email || ''));
  console.log(`Found ${seeded.length} seeded students. Generating overviews...`);

  let ok = 0, fail = 0;
  for (const u of seeded) {
    process.stdout.write(`  ${u.email}... `);
    try {
      const overview = await generate(u.id);
      if (!overview) { console.log('skip (no assessment)'); continue; }
      await (admin as any).from('student_assessments').update({
        ai_overview: overview,
        ai_overview_generated_at: new Date().toISOString(),
      }).eq('student_id', u.id);
      console.log('ok');
      ok++;
    } catch (e) {
      console.log('ERR:', (e as Error).message);
      fail++;
    }
  }
  console.log(`\nDone. ${ok} generated, ${fail} failed.`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
