/**
 * Teacher Twin auto-responder for Message Board threads.
 *
 * Decides whether to respond to a student message and composes the reply
 * using the teacher's persona + class context. Keeps the AI out of the
 * way when peers are already engaging productively.
 *
 * Design principles:
 *  - Twin is NOT the teacher. It's a scaffolding peer that keeps discussion alive.
 *  - Twin encourages student-to-student dialogue over student-to-AI.
 *  - Twin asks open questions; doesn't lecture or give complete answers.
 *  - Twin uses the student's preferred name.
 *  - Twin stays age-appropriate for K-12.
 *  - Twin knows the class subject and topic title.
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TopicContext {
  id: string;
  title: string;
  class_id: string;
  class_name: string;
  class_subject: string | null;
  is_private: boolean;
  created_by: string;          // teacher user id
  created_by_name: string;     // teacher display name
}

export interface ReplyContext {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'student' | 'teacher' | 'twin';
  content: string;
  created_at: string;
}

export interface TwinDecision {
  shouldRespond: boolean;
  reason: string; // why we decided; for logging / eventual teacher feedback
}

export interface TwinReply {
  content: string;
}

/**
 * Decide whether the Twin should respond after this latest message.
 *
 * Logic:
 *  - Skip if latest reply is from Twin or Teacher.
 *  - ALWAYS respond if this is the first student reply in the thread (icebreaker).
 *  - ALWAYS respond if the student asks a direct question (?).
 *  - RESPOND if the last 2 replies are both from the same student (no peer response yet).
 *  - STAY SILENT if peers are already replying to each other productively.
 *  - STAY SILENT if Twin has posted 2+ times without a student reply in between (avoid monologue).
 */
export function shouldTwinRespond(replies: ReplyContext[]): TwinDecision {
  if (replies.length === 0) {
    return { shouldRespond: false, reason: 'No replies yet' };
  }
  const latest = replies[replies.length - 1];
  if (latest.sender_role === 'twin') {
    return { shouldRespond: false, reason: 'Latest reply is from Twin' };
  }
  if (latest.sender_role === 'teacher') {
    return { shouldRespond: false, reason: 'Teacher is driving the thread' };
  }

  // Student-authored. Count prior student replies.
  const studentReplies = replies.filter(r => r.sender_role === 'student');
  const twinReplies = replies.filter(r => r.sender_role === 'twin');

  // First student ever in this thread — Twin should welcome them.
  if (studentReplies.length === 1) {
    return { shouldRespond: true, reason: 'First student reply \u2014 icebreaker' };
  }

  // Latest message is a direct question — Twin answers (scaffolds).
  if (/\?\s*$/.test(latest.content) || /^(what|why|how|when|where|who|does|can|could|would|should)\b/i.test(latest.content)) {
    return { shouldRespond: true, reason: 'Student asked a direct question' };
  }

  // Avoid Twin monologue: if last 2 messages are Twin posts (no student between), stay silent.
  const lastTwoNonCurrent = replies.slice(-3, -1);
  if (lastTwoNonCurrent.filter(r => r.sender_role === 'twin').length >= 1 && twinReplies.length >= studentReplies.length) {
    return { shouldRespond: false, reason: 'Avoid Twin monologue \u2014 let peers respond' };
  }

  // If the same student has posted 2+ in a row with no peer reply, Twin nudges to invite peers.
  const lastTwoStudents = replies.slice(-2);
  if (lastTwoStudents.length === 2 && lastTwoStudents.every(r => r.sender_role === 'student' && r.sender_id === latest.sender_id)) {
    return { shouldRespond: true, reason: 'Same student twice in a row \u2014 nudge peers' };
  }

  // Healthy peer-to-peer dialogue? Stay out of the way.
  return { shouldRespond: false, reason: 'Peers engaging productively' };
}

/**
 * Generate the Twin's reply given context.
 * Returns null if AI call fails (caller should skip silently).
 */
export async function generateTwinReply(params: {
  topic: TopicContext;
  replies: ReplyContext[];
  teacherTwinPersona?: string | null;
}): Promise<TwinReply | null> {
  const { topic, replies, teacherTwinPersona } = params;

  if (!process.env.ANTHROPIC_API_KEY) return null;

  const latest = replies[replies.length - 1];
  const transcript = replies.map(r => {
    const who =
      r.sender_role === 'twin' ? 'AI Twin'
      : r.sender_role === 'teacher' ? `${topic.created_by_name} (teacher)`
      : r.sender_name;
    return `${who}: ${r.content}`;
  }).join('\n');

  const system = `You are the AI Teacher Twin assistant in a K-12 class message board. You support ${topic.created_by_name}'s class. This topic is in "${topic.class_name}"${topic.class_subject ? ` (${topic.class_subject})` : ''} and is titled "${topic.title}".

Your role:
- You are NOT the teacher. You are a co-teacher AI that scaffolds student discussion.
- Keep students talking to each OTHER, not to you.
- Ask open, thought-provoking questions. Don't lecture. Don't give complete answers.
- Use the student's name when addressing them.
- Celebrate specific moves when warranted ("I love how you connected X to Y").
- Stay age-appropriate for K-12 and classroom-friendly.
- Stay on the topic; redirect gently if the conversation drifts.
- Keep replies SHORT: 2-4 sentences max. One question is enough.
- Sound warm, curious, and encouraging \u2014 never stiff or corporate.
${teacherTwinPersona ? `\nYou embody this teacher's persona: ${teacherTwinPersona}\n` : ''}

Do NOT repeat yourself or what the teacher already said.
Do NOT sign off with "Teacher Twin" or any name \u2014 the UI will label you.
Reply with ONLY the reply text, nothing else.`;

  const userPrompt = `Topic: "${topic.title}"

Conversation so far:
${transcript}

The latest message is from ${latest.sender_name} (student). Write a warm, short reply that either:
  (a) asks a follow-up question that keeps the discussion going, or
  (b) invites other students to join in and share their thoughts, or
  (c) connects ${latest.sender_name}'s idea to something else worth exploring.

Pick whichever fits best. Keep it 2-4 sentences max.`;

  try {
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 180,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = ((resp.content[0] as any)?.text || '').trim();
    if (!text) return null;
    return { content: text };
  } catch (err) {
    console.error('[teacher-twin] generate error:', (err as Error).message);
    return null;
  }
}
