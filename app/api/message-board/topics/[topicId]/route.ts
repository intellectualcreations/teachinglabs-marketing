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
  // Also attach a computed role: twin > teacher > student so the UI can style accordingly.
  const scrubbedReplies = (replies ?? []).map((r: any) => {
    const scrubbed = role === 'teacher' ? r : (() => {
      const { flagged_reason, flagged_explanation, flagged_highlight, flagged_dismissed_at, flagged_dismissed_by, ...rest } = r;
      return rest;
    })();
    return scrubbed;
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

  // Participant list. For private topics: the specifically-added participants.
  // For public topics: the whole class roster (so teacher sees who can see it).
  let participants: any[] = [];
  if (topic.is_private) {
    const { data: parts } = await (supabase as any)
      .from('message_board_participants')
      .select('user_id, added_at')
      .eq('topic_id', topicId);
    const partIds = (parts ?? []).map((p: any) => p.user_id);
    const { data: partProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, preferred_name, role')
      .in('id', partIds.length ? partIds : ['00000000-0000-0000-0000-000000000000']);
    participants = (partProfiles ?? []).map((p: any) => ({
      id: p.id,
      name: p.preferred_name || p.display_name || 'Student',
      role: p.role || 'student',
    }));
  } else {
    // Public topic: show the entire class roster as implicit participants.
    const { data: enrolls } = await (supabase as any)
      .from('enrollments')
      .select('student_id')
      .eq('class_id', topic.class_id)
      .eq('status', 'active');
    const studentIds = (enrolls ?? []).map((e: any) => e.student_id);
    if (studentIds.length > 0) {
      const { data: rosterProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, preferred_name, role')
        .in('id', studentIds);
      participants = (rosterProfiles ?? []).map((p: any) => ({
        id: p.id,
        name: p.preferred_name || p.display_name || 'Student',
        role: p.role || 'student',
      }));
    }
  }

  // Also fetch the class name for header context
  const { data: cls } = await (supabase as any)
    .from('classes')
    .select('name')
    .eq('id', topic.class_id)
    .maybeSingle();

  return NextResponse.json({
    topic: {
      ...topic,
      class_name: cls?.name || null,
      created_by_name: profileMap.get(topic.created_by)?.name || 'User',
    },
    replies: scrubbedReplies.map((r: any) => ({
      ...r,
      sender_name: r.is_twin ? 'AI Teacher Twin' : (profileMap.get(r.sender_id)?.name || 'User'),
      sender_role: r.is_twin ? 'twin' : (profileMap.get(r.sender_id)?.role || 'student'),
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
