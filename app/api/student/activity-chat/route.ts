import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/student/activity-chat?activityId=<uuid>&studentId=<uuid>
 * Returns chat messages for a student's activity session.
 *
 * POST /api/student/activity-chat
 * Body: { activityId, studentId, message, activityTitle?, activityDescription? }
 * Saves message and returns AI reply.
 */

export async function GET(request: NextRequest) {
  const activityId = request.nextUrl.searchParams.get('activityId');
  const studentId = request.nextUrl.searchParams.get('studentId');

  if (!activityId || !studentId) {
    return NextResponse.json({ error: 'activityId and studentId required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: messages } = await (supabase as any)
    .from('activity_chats')
    .select('*')
    .eq('activity_id', activityId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, studentId, message, activityTitle, activityDescription } = body;

    if (!activityId || !studentId || !message) {
      return NextResponse.json({ error: 'activityId, studentId, and message required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Save user message
    await (supabase as any)
      .from('activity_chats')
      .insert({
        activity_id: activityId,
        student_id: studentId,
        role: 'user',
        content: message,
      });

    // Get student name and teacher name for personalization
    const { data: studentProfile } = await (supabase as any)
      .from('profiles')
      .select('display_name, preferred_name')
      .eq('id', studentId)
      .single();
    const studentName = studentProfile?.preferred_name || studentProfile?.display_name?.split(' ')[0] || 'there';

    // Get teacher name from the activity's teacher_id. Use classroom_name for student-facing AI.
    let teacherName = 'your teacher';
    if (body.teacherId) {
      const { data: teacherProfile } = await (supabase as any)
        .from('profiles')
        .select('display_name, preferred_name, first_name, last_name, classroom_name, classroom_title, classroom_surname')
        .eq('id', body.teacherId)
        .single();
      const { teacherClassroomName } = await import('@/lib/teacher-identity');
      teacherName = teacherClassroomName(teacherProfile);
    }

    const systemPrompt = `You are an awesome AI tutor named Spark who works with K-12 students. You're friendly, fun, encouraging, and make learning feel like an adventure — not a chore.

You're helping ${studentName} with an activity called "${activityTitle || 'this activity'}".
${activityDescription ? `Here's what the activity is about: ${activityDescription}` : ''}
${body.objective ? `The learning objective is: ${body.objective}` : ''}
${body.directions ? `The directions are: ${body.directions}` : ''}

Your #1 job: GET THE STUDENT TALKING. You are not here to lecture or show off knowledge.

Your style:
- Ask questions. Then ask more questions. Your main tool is questions.
- Keep your responses SHORT. 1-3 sentences max. Then ask a question.
- Talk like a friendly tutor, not a textbook. Casual, age-appropriate language.
- Do NOT use roleplay actions like *smiles* or *waves* or *appears*. Just write naturally.
- Minimal emojis (one or two per message max)
- NEVER give long explanations unless the student specifically asks for one
- When the student answers, acknowledge briefly ("Cool!" "Nice!") then ask a follow-up to go deeper
- If the student seems stuck, give ONE small hint, then ask a question about it
- Draw out what the STUDENT knows and thinks. Don't tell them what YOU know.
- If something is beyond your ability to help with, say "Great question! Let's bring in ${teacherName} for that one."
- NEVER be condescending. Treat the student as capable and smart.
- Write at a reading level appropriate for the grade (simple words, short sentences)

FORMATTING RULES (very important):
- Break your response into short paragraphs (2-3 sentences max each)
- Put a blank line between each paragraph
- Use bullet points or numbered lists when explaining steps
- Never write a wall of text. If a kid sees a big block of text, they'll tune out.

IMPORTANT: If this is the very first message in the conversation:
- DO NOT introduce yourself. No "I'm Spark" or "I'm here to help."
- Greet the student by name with ONE short, warm sentence.
- Then immediately ask them a question to get them talking about the activity.
- Example: "Hey Samantha! So you've been learning about geometry — what's one thing that really clicked for you?"
- That's it. Short greeting + question. Let THEM do the talking.

For ALL messages:
- Never re-introduce yourself
- Keep it brief. Ask questions. Listen. Follow up.
- The student should be writing more than you are.`;

    // Fetch recent messages for context
    const { data: history } = await (supabase as any)
      .from('activity_chats')
      .select('role, content')
      .eq('activity_id', activityId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentMessages = (history ?? []).reverse();

    // Call AI API
    let reply = "I'm here to help! What would you like to know about this activity?";

    try {
      const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
      
      if (process.env.ANTHROPIC_API_KEY) {
        // Use Claude
        console.log('[activity-chat] Calling Anthropic API');
        console.log('[activity-chat] Messages count:', recentMessages.length);
        // Anthropic requires at least one message
        const apiMessages = recentMessages.length > 0
          ? recentMessages.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
          : [{ role: 'user' as const, content: message }];
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 300,
            system: systemPrompt,
            messages: apiMessages,
          }),
        });
        console.log('[activity-chat] Anthropic response status:', aiRes.status);
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          reply = aiData.content?.[0]?.text || reply;
          console.log('[activity-chat] Got AI reply, length:', reply.length);
        } else {
          const errText = await aiRes.text();
          console.error('[activity-chat] Anthropic error:', errText);
        }
      } else if (process.env.OPENAI_API_KEY) {
        // Use OpenAI
        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 300,
            messages: [
              { role: 'system', content: systemPrompt },
              ...recentMessages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
              })),
            ],
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          reply = aiData.choices?.[0]?.message?.content || reply;
        }
      }
    } catch (aiErr) {
      console.error('AI response error:', aiErr);
    }

    // Save AI reply
    await (supabase as any)
      .from('activity_chats')
      .insert({
        activity_id: activityId,
        student_id: studentId,
        role: 'assistant',
        content: reply,
      });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Activity chat error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
