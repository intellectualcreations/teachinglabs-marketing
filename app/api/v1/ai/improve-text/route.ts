import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { text, context, type } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Text too short to improve' }, { status: 400 });
    }

    const systemPrompt = `You are a writing assistant for K-12 teachers. Your job is to polish and improve text while keeping the teacher's authentic voice.

Rules:
- Keep the same meaning and intent
- Fix grammar, spelling, and punctuation
- Make it clearer and more professional
- Keep it warm and approachable (not corporate)
- Keep roughly the same length (don't over-expand)
- Return ONLY the improved text, no explanations`;

    const userPrompt = type === 'class-description'
      ? `Improve this class description for a K-12 classroom.\n\nContext: ${context || 'N/A'}\n\nOriginal:\n${text}`
      : `Improve this text for a K-12 teaching context.\n\nOriginal:\n${text}`;

    let improved: string | null = null;

    // Try Anthropic first, fall back to OpenAI
    if (ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20250315',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        improved = data.content?.[0]?.text || null;
      }
    }

    if (!improved && OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        improved = data.choices?.[0]?.message?.content || null;
      }
    }

    if (!improved) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    return NextResponse.json({ improved: improved.trim() });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
