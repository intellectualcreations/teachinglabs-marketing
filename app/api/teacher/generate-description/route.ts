import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { className, subject, grade, rawDescription } = await req.json() as {
      className: string; subject: string; grade: string; rawDescription?: string;
    };

    if (!className) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    const prompt = rawDescription
      ? `A teacher wrote this rough class description:
"${rawDescription}"

Class name: "${className}"
${subject ? `Subject: ${subject}` : ''}
${grade ? `Grade level: ${grade}` : ''}

Rewrite it to sound exciting and fun for students. Make it feel like an amazing adventure they can't wait to join. Keep the teacher's original intent and topics but make it sparkle.

Requirements:
- 2-3 sentences max
- Energetic, student-facing tone
- Make learning sound like an epic adventure
- Keep it under 300 characters
- Do not use quotes around the response
- Just return the polished description text, nothing else`
      : `Write a short, exciting class description for students.
Class name: "${className}"
${subject ? `Subject: ${subject}` : ''}
${grade ? `Grade level: ${grade}` : ''}

Requirements:
- 2-3 sentences max
- Make it sound like an amazing adventure
- Keep it under 300 characters
- Do not use quotes around the response
- Just return the description text, nothing else`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    return NextResponse.json({ description: text });
  } catch (error) {
    console.error('Generate description error:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}
