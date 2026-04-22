import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { moderateMessageBoardReply } from '@/lib/message-board-moderation';
import { shouldTwinRespond, generateTwinReply } from '@/lib/teacher-twin-responder';

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

  // Verify topic exists + visibility. Pull Twin metadata too for the async responder.
  const { data: topic } = await (supabase as any)
    .from('message_board_topics')
    .select('id, class_id, is_private, title, created_by, twin_enabled')
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

  // ── Teacher Twin auto-responder ─────────────────────────────────────────────────────────────────
  // Only fires for student replies, when Twin is enabled for the topic.
  // Runs asynchronously after we respond to the student — fire and forget.
  if (role === 'student' && topic.twin_enabled !== false && moderation.reason === null) {
    // Don't await — let it complete in the background.
    void runTwinReply({ supabase, topicId, topic });
  }

  return NextResponse.json({ reply: responseReply });
}

// Generate + persist a Twin reply in the background. Errors are logged and
// swallowed so they never impact the student's experience.
async function runTwinReply({ supabase, topicId, topic }: { supabase: any; topicId: string; topic: any }) {
  try {
    // Load all replies + sender metadata to pass to decision function.
    const { data: allReplies } = await (supabase as any)
      .from('message_board_replies')
      .select('id, sender_id, content, is_twin, created_at')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    if (!allReplies || allReplies.length === 0) return;

    const senderIds = [...new Set(allReplies.map((r: any) => r.sender_id))];
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('id, display_name, preferred_name, role')
      .in('id', senderIds);
    const profileMap = new Map<string, { name: string; role: string }>();
    (profiles ?? []).forEach((p: any) => {
      profileMap.set(p.id, { name: p.preferred_name || p.display_name || 'User', role: p.role || 'student' });
    });

    const replyCtx = allReplies.map((r: any) => {
      const senderIsTeacher = r.sender_id === topic.created_by;
      const role: 'student' | 'teacher' | 'twin' = r.is_twin ? 'twin' : senderIsTeacher ? 'teacher' : 'student';
      const info = profileMap.get(r.sender_id);
      return {
        id: r.id,
        sender_id: r.sender_id,
        sender_name: info?.name || 'User',
        sender_role: role,
        content: r.content,
        created_at: r.created_at,
      };
    });

    const decision = shouldTwinRespond(replyCtx);
    console.log(`[twin] topic=${topicId} decision=${decision.shouldRespond} reason="${decision.reason}"`);
    if (!decision.shouldRespond) return;

    // Pull class + teacher identity for the Twin's context.
    const { data: cls } = await (supabase as any)
      .from('classes').select('name, subject').eq('id', topic.class_id).maybeSingle();
    const { data: teacherProf } = await (supabase as any)
      .from('profiles').select('display_name, preferred_name, first_name, last_name, classroom_name, classroom_title, classroom_surname, twin_name, twin_clarifier, twin_unique_name').eq('id', topic.created_by).maybeSingle();
    const { teacherClassroomName, teacherTwinName } = await import('@/lib/teacher-identity');

    const twinReply = await generateTwinReply({
      topic: {
        id: topic.id,
        title: topic.title,
        class_id: topic.class_id,
        class_name: cls?.name ?? 'Class',
        class_subject: cls?.subject ?? null,
        is_private: topic.is_private,
        created_by: topic.created_by,
        teacher_classroom_name: teacherClassroomName(teacherProf),
        twin_name: teacherTwinName(teacherProf),
      },
      replies: replyCtx,
    });
    if (!twinReply?.content) return;

    // Persist as a Twin reply under the teacher's sender_id so FKs hold.
    await (supabase as any).from('message_board_replies').insert({
      topic_id: topicId,
      sender_id: topic.created_by,
      content: twinReply.content,
      is_twin: true,
    });
  } catch (err) {
    console.error('[twin] runTwinReply error:', (err as Error).message);
  }
}
