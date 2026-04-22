import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type NameVerdict = 'safe' | 'borderline' | 'inappropriate';

export interface NameCheckResult {
  verdict: NameVerdict;
  reason: string;
}

/**
 * Check whether a student-chosen preferred name is appropriate for a K-12 classroom.
 *
 *   safe         → allow, no highlight
 *   borderline   → allow but amber-highlight + surface to teacher (e.g. "DiaperBreath")
 *   inappropriate → hard reject at signup (profanity, slurs, sexually explicit)
 *
 * Runs a quick Haiku call. Sub-300ms typical. Falls back to local blocklist on AI error.
 */
export async function checkPreferredName(name: string): Promise<NameCheckResult> {
  const trimmed = (name || '').trim();
  if (!trimmed) return { verdict: 'safe', reason: '' };

  // Local hard-block list as a belt-and-suspenders
  const lower = trimmed.toLowerCase();
  const hardBlock = [
    'fuck', 'shit', 'bitch', 'cunt', 'nigger', 'faggot', 'retard',
    'cock', 'dick', 'pussy', 'whore', 'slut', 'rape',
  ];
  if (hardBlock.some((w) => lower.includes(w))) {
    return { verdict: 'inappropriate', reason: 'Contains language that is never allowed as a preferred name.' };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Graceful degrade — trust the hard list and let everything else pass
    return { verdict: 'safe', reason: '' };
  }

  const system = `You check whether a student-chosen preferred name (nickname) is appropriate for a K-12 classroom.

Return JSON with this exact shape and nothing else:
{ "verdict": "safe" | "borderline" | "inappropriate", "reason": string }

Definitions:
- "safe": a real name, normal nickname, or playful-but-classroom-appropriate handle. Examples: Aaliyah, Sophie, Jay, Sparky, Pikachu, NinjaFox, ElectricDragon.
- "borderline": not explicitly harmful but odd, silly-in-a-way-that-might-derail-class, potty-humor, intentionally embarrassing, or that a teacher would likely want to quietly redirect. Examples: DiaperBreath, FartMaster, ButtHead, BabyBoy42, SmellySocks.
- "inappropriate": profanity, slurs, sexually explicit, drug references, violence, harassment of real people, or bypasses-blocklist-with-creative-spelling.

"reason" = one short sentence (max 12 words) a teacher can scan. Empty string if verdict is safe.

Never invent context. Judge only the submitted name. Respond ONLY with the JSON object.`;

  try {
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 120,
      system,
      messages: [{ role: 'user', content: `Preferred name: ${trimmed}` }],
    });
    const text = (resp.content[0] as any)?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { verdict: 'safe', reason: '' };
    const parsed = JSON.parse(match[0]);
    const verdict: NameVerdict =
      parsed.verdict === 'inappropriate' ? 'inappropriate'
      : parsed.verdict === 'borderline' ? 'borderline'
      : 'safe';
    const reason = typeof parsed.reason === 'string' ? parsed.reason.slice(0, 200) : '';
    return { verdict, reason };
  } catch (err) {
    console.error('[preferred-name-check] AI error:', (err as Error).message);
    return { verdict: 'safe', reason: '' };
  }
}
