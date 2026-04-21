import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { className, subject, grade } = await req.json();

    if (!className) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    const prompt = `Write a short, warm, professional class description for a K-12 teacher's class page. 
Class name: "${className}"
${subject ? `Subject: ${subject}` : ''}
${grade ? `Grade level: ${grade}` : ''}

Requirements:
- 1-2 sentences only
- Warm and inviting tone for students and parents
- Mention what students will learn or explore
- Keep it under 200 characters
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
