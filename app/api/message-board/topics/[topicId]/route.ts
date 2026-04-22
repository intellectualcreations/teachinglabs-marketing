import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/message-board/topics/[topicId]?userId=<uuid>&role=<teacher|student>
 * Returns a topic with all its replies and sender display names.
 * Enforces private-topic visibility for students.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const userId = request.nextUrl.searchParams.get('userId');
  const role = request.nextUrl.searchParams.get('role') || 'student';

  if (!topicId || !userId) {
    return NextResponse.json({ error: 'topicId and userId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: topic, error } = await (supabase as any)
    .from('message_board_topics')
    .select('*')
    .eq('id', topicId)
    .maybeSingle();

  if (error || !topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  // Check visibility for students on private topics
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

  const { data: replies } = await (supabase as any)
    .from('message_board_replies')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });

  // For students, hide moderation fields — only teachers see flagged reason/explanation/highlight
  const scrubbedReplies = (replies ?? []).map((r: any) => {
    if (role === 'teacher') return r;
    const { flagged_reason, flagged_explanation, flagged_highlight, flagged_dismissed_at, flagged_dismissed_by, ...rest } = r;
    return rest;
  });

  const senderIds = [...new Set((replies ?? []).map((r: any) => r.sender_id))];
  senderIds.push(topic.created_by);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .in('id', senderIds);
  const profileMap = new Map<string, { name: string; role: string }>();
  (profiles ?? []).forEach((p: any) =>
    profileMap.set(p.id, { name: p.display_name || 'User', role: p.role || 'student' })
  );

  // Participant list (only meaningful for private topics)
  let participants: any[] = [];
  if (topic.is_private) {
    const { data: parts } = await (supabase as any)
      .from('message_board_participants')
      .select('user_id, added_at')
      .eq('topic_id', topicId);
    const partIds = (parts ?? []).map((p: any) => p.user_id);
    const { data: partProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, role')
      .in('id', partIds.length ? partIds : ['00000000-0000-0000-0000-000000000000']);
    participants = (partProfiles ?? []).map((p: any) => ({
      id: p.id,
      name: p.display_name || 'Student',
      role: p.role || 'student',
    }));
  }

  return NextResponse.json({
    topic: {
      ...topic,
      created_by_name: profileMap.get(topic.created_by)?.name || 'User',
    },
    replies: scrubbedReplies.map((r: any) => ({
      ...r,
      sender_name: profileMap.get(r.sender_id)?.name || 'User',
      sender_role: profileMap.get(r.sender_id)?.role || 'student',
    })),
    participants,
  });
}

/**
 * DELETE /api/message-board/topics/[topicId]?userId=<uuid>&role=<teacher|student>
 * Teachers can delete any topic in their class. Students can only delete topics they created.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const userId = request.nextUrl.searchParams.get('userId');
  const role = request.nextUrl.searchParams.get('role') || 'student';

  if (!topicId || !userId) {
    return NextResponse.json({ error: 'topicId and userId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: topic } = await (supabase as any)
    .from('message_board_topics')
    .select('created_by')
    .eq('id', topicId)
    .maybeSingle();

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  if (role !== 'teacher' && topic.created_by !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { error } = await (supabase as any)
    .from('message_board_topics')
    .delete()
    .eq('id', topicId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
