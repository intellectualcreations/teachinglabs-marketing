import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function check(name: string): Promise<{ verdict: string; reason: string }> {
  if (!name?.trim()) return { verdict: 'safe', reason: '' };
  const system = `You check whether a student-chosen preferred name (nickname) is appropriate for a K-12 classroom.
Return JSON {"verdict":"safe"|"borderline"|"inappropriate","reason":string}.
safe: real name, normal nickname, or playful classroom-appropriate handle (e.g. Aaliyah, Sophie, Jay, Sparky, NinjaFox).
borderline: odd, silly-in-a-disruptive-way, potty-humor, intentionally embarrassing (e.g. DiaperBreath, FartMaster, ButtHead).
inappropriate: profanity, slurs, sexually explicit, drug refs.
"reason" = one short sentence max 12 words. Empty if safe.
Respond ONLY with the JSON object.`;
  try {
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 120,
      system,
      messages: [{ role: 'user', content: `Preferred name: ${name}` }],
    });
    const text = (resp.content[0] as any)?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { verdict: 'safe', reason: '' };
    const p = JSON.parse(match[0]);
    return { verdict: p.verdict || 'safe', reason: p.reason || '' };
  } catch {
    return { verdict: 'safe', reason: '' };
  }
}

(async () => {
  const { data: users } = await (admin.auth as any).admin.listUsers({ page: 1, perPage: 1000 });
  const seeded = users.users.filter((u: any) => /^imastudent\d+@stewart\.in$/.test(u.email || ''));
  const ids = seeded.map((u: any) => u.id);
  const { data: profiles } = await (admin as any).from('profiles').select('id, preferred_name').in('id', ids);
  let flaggedCount = 0;
  for (const p of profiles || []) {
    const res = await check(p.preferred_name || '');
    const flag = res.verdict === 'borderline';
    await (admin as any).from('profiles').update({
      name_flagged: flag,
      preferred_name_borderline_reason: flag ? res.reason : null,
    }).eq('id', p.id);
    if (flag) { flaggedCount++; console.log(`  ${p.preferred_name} → BORDERLINE: ${res.reason}`); }
  }
  console.log(`\nTotal borderline after AI check: ${flaggedCount} / ${profiles?.length}`);
})();
