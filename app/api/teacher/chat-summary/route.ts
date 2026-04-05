import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/teacher/chat-summary
 * Body: { messages: Array<{ role: string, content: string }> }
 * Returns an AI-generated summary of a student chat conversation.
 */
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ summary: 'No messages to summarize.' });
    }

    // Build a condensed transcript
    const transcript = messages
      .map((m: any) => `${m.role === 'user' || m.role === 'student' ? 'Student' : 'AI Tutor'}: ${m.content}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      system: `You are a teaching assistant. Summarize this student-AI tutor conversation in 2-3 sentences for the teacher. Focus on: what topic was discussed, how the student engaged (questions asked, understanding shown), and any areas where the student may need help. Be concise and professional.`,
      messages: [{ role: 'user', content: transcript }],
    });

    const summary = (response.content[0] as any).text || 'Unable to generate summary.';
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('[chat-summary] Error:', err);
    return NextResponse.json({ summary: 'Summary unavailable.' });
  }
}
