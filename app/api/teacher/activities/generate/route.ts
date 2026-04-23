import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  idea: string;
  subject?: string;
  gradeLevel?: string;
}

interface GeneratedActivity {
  title: string;
  description: string;
  objective: string;
  learning_goal: string;
  essential_question: string;
  materials: string;
  vocabulary: string;
  hook: string;
  directions: string;
  assessment: string;
  differentiation: string;
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { idea, subject, gradeLevel } = (await request.json()) as GenerateRequest;

    if (!idea?.trim()) {
      return NextResponse.json(
        { error: 'Lesson idea is required' },
        { status: 400 }
      );
    }

    const gradeLabel = gradeLevel || 'any grade level';
    const subjectLabel = subject || 'any subject';

    const prompt = `You are an expert K-12 lesson planner. Generate a complete lesson plan for the following idea:

**Idea:** ${idea}
**Subject:** ${subjectLabel}
**Grade Level:** ${gradeLabel}

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "title": "A short, catchy activity title (3-7 words, teacher-friendly, no quotes)",
  "description": "A 1-2 sentence summary of the activity for the library card view",
  "objective": "What students will accomplish (measurable, specific, 1-2 sentences)",
  "learning_goal": "The big idea students will understand (1-2 sentences)",
  "essential_question": "A driving question that frames the lesson (1 question)",
  "materials": "List of materials and resources needed (bullet points or comma-separated)",
  "vocabulary": "3-7 key terms separated by commas",
  "hook": "An engaging introduction to grab attention and set up the lesson (2-3 sentences)",
  "directions": "Step-by-step instructions for the activity (3-5 numbered steps)",
  "assessment": "How student understanding will be measured (formative and/or summative)",
  "differentiation": "Support strategies for struggling learners AND extension strategies for advanced learners"
}

Make the lesson engaging, practical, and appropriate for the grade level. All fields should be thorough but concise.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return NextResponse.json(
        { error: `AI generation failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // Parse JSON
    const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const activity = JSON.parse(jsonStr) as GeneratedActivity;

    return NextResponse.json({ activity });
  } catch (err: any) {
    console.error('Activity generation error:', err?.message || err);
    return NextResponse.json(
      { error: 'Failed to generate lesson plan', detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
