import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { moderateMessageBoardReply } from '@/lib/message-board-moderation';

/**
 * POST /api/message-board/topics/[topicId]/replies
 * Body: { userId, role, content }
 * Posts a reply. Runs AI moderation and persists any flagged_reason/explanation/highlight.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const body = await request.json();
  const { userId, role, content } = body || {};

  if (!topicId || !userId || !content?.trim()) {
    return NextResponse.json({ error: 'topicId, userId, content required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify topic exists + visibility
  const { data: topic } = await (supabase as any)
    .from('message_board_topics')
    .select('id, class_id, is_private')
    .eq('id', topicId)
    .maybeSingle();

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  if (role === 'student' && topic.is_private) {
    const { data: part } = await (supabase as any)
      .from('message_board_participants')
      .select('user_id')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!part) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
  }

  const trimmed = String(content).trim().slice(0, 5000);

  // Run moderation before insert (AI call). Never block the reply — just annotate.
  let moderation: { reason: string | null; explanation: string | null; highlight: string | null } = {
    reason: null, explanation: null, highlight: null,
  };
  try {
    moderation = await moderateMessageBoardReply(trimmed);
  } catch (e) {
    // Non-fatal — log and continue.
    console.error('[message-board] moderation failed:', (e as Error).message);
  }

  const { data: reply, error } = await (supabase as any)
    .from('message_board_replies')
    .insert({
      topic_id: topicId,
      sender_id: userId,
      content: trimmed,
      flagged_reason: moderation.reason,
      flagged_explanation: moderation.explanation,
      flagged_highlight: moderation.highlight,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For students, hide moderation fields on the response
  let responseReply = reply;
  if (role !== 'teacher') {
    const { flagged_reason, flagged_explanation, flagged_highlight, flagged_dismissed_at, flagged_dismissed_by, ...rest } = reply;
    responseReply = rest;
  }

  return NextResponse.json({ reply: responseReply });
}
