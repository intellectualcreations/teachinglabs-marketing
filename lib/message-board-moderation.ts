import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type FlagReason = 'content' | 'question' | 'urgent' | null;

export interface ModerationResult {
  reason: FlagReason;
  explanation: string | null;
  highlight: string | null;
}

/**
 * Moderate a student/teacher message-board reply.
 *
 * Flag categories (all teacher-facing, never shown to students):
 *   - content: safety/appropriateness concerns (bullying, self-harm, inappropriate)
 *   - question: an unanswered question the AI can't/shouldn't answer, needs teacher
 *   - urgent:  time-sensitive or emotionally heavy content requiring teacher attention
 *
 * Returns reason=null when nothing needs teacher attention.
 */
export async function moderateMessageBoardReply(content: string): Promise<ModerationResult> {
  const trimmed = content.trim();
  if (!trimmed) {
    return { reason: null, explanation: null, highlight: null };
  }

  // Skip AI call if no key — fail safe, don't block posting
  if (!process.env.ANTHROPIC_API_KEY) {
    return { reason: null, explanation: null, highlight: null };
  }

  const system = `You are a safety and triage monitor for a K-12 class message board.
You review a single student or teacher post and decide whether the classroom teacher needs to be alerted.

Return JSON with this exact shape and nothing else:
{
  "reason": "content" | "question" | "urgent" | null,
  "explanation": string,
  "highlight": string
}

Reason definitions:
- "content": bullying, inappropriate language, unsafe behavior, self-harm/suicide signals, harassment, discrimination, or anything the teacher needs to see for safety/appropriateness.
- "question": the student asks something substantive the AI shouldn't fully answer on its own (opinion on the student's personal life, medical/legal question, complex disagreement between students, or a direct ask for the teacher).
- "urgent": time-sensitive or emotionally heavy — a student in distress, a deadline or test-day problem, a conflict escalating in real time.
- null: normal classroom conversation, on-topic discussion, friendly chat, routine questions the AI can handle. DO NOT flag benign posts.

"explanation" = one short sentence (max 15 words) a teacher can scan.
"highlight" = the single most important substring from the original post (verbatim, max ~120 chars) that the teacher should look at. If nothing specific stands out, return an empty string.

If nothing is wrong, return: { "reason": null, "explanation": "", "highlight": "" }
Never invent quotes. Never include anything other than the JSON object.`;

  try {
    const resp = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 250,
      system,
      messages: [{ role: 'user', content: trimmed }],
    });
    const text = (resp.content[0] as any)?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { reason: null, explanation: null, highlight: null };

    const parsed = JSON.parse(match[0]);
    let reason: FlagReason = null;
    if (parsed.reason === 'content' || parsed.reason === 'question' || parsed.reason === 'urgent') {
      reason = parsed.reason;
    }

    if (!reason) return { reason: null, explanation: null, highlight: null };

    return {
      reason,
      explanation: typeof parsed.explanation === 'string' && parsed.explanation.trim()
        ? parsed.explanation.trim().slice(0, 200)
        : null,
      highlight: typeof parsed.highlight === 'string' && parsed.highlight.trim()
        ? parsed.highlight.trim().slice(0, 300)
        : null,
    };
  } catch (err) {
    console.error('[mb-moderation] error:', (err as Error).message);
    return { reason: null, explanation: null, highlight: null };
  }
}
