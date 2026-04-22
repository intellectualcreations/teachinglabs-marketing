import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/message-board/topics?classId=<uuid>&userId=<uuid>&role=<teacher|student>
 * Lists topics for a class. Students only see public topics + private topics they're a participant in.
 * Teachers see all topics.
 */
export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get('classId');
  const userId = request.nextUrl.searchParams.get('userId');
  const role = request.nextUrl.searchParams.get('role') || 'student';

  if (!classId || !userId) {
    return NextResponse.json({ error: 'classId and userId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Load topics
  const { data: topics, error } = await (supabase as any)
    .from('message_board_topics')
    .select('*')
    .eq('class_id', classId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allTopics = topics ?? [];
  if (allTopics.length === 0) {
    return NextResponse.json({ topics: [] });
  }

  // For students, filter private topics to only those they participate in
  let visible = allTopics;
  if (role === 'student') {
    const privateIds = allTopics.filter((t: any) => t.is_private).map((t: any) => t.id);
    let allowedPrivate = new Set<string>();
    if (privateIds.length > 0) {
      const { data: parts } = await (supabase as any)
        .from('message_board_participants')
        .select('topic_id')
        .eq('user_id', userId)
        .in('topic_id', privateIds);
      allowedPrivate = new Set((parts ?? []).map((p: any) => p.topic_id));
    }
    visible = allTopics.filter((t: any) => !t.is_private || allowedPrivate.has(t.id));
  }

  const topicIds = visible.map((t: any) => t.id);

  // Reply counts + last reply per topic
  const { data: replies } = await (supabase as any)
    .from('message_board_replies')
    .select('id, topic_id, content, sender_id, created_at, flagged_reason, flagged_dismissed_at')
    .in('topic_id', topicIds.length ? topicIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: true });

  const replyMap = new Map<string, any[]>();
  (replies ?? []).forEach((r: any) => {
    const arr = replyMap.get(r.topic_id) ?? [];
    arr.push(r);
    replyMap.set(r.topic_id, arr);
  });

  // Creator display names — for student callers, use classroom_name so kids see 'Mrs. Stewart' not 'Dottie Stewart'.
  const creatorIds = [...new Set(visible.map((t: any) => t.created_by))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, preferred_name, first_name, last_name, classroom_name, classroom_title, classroom_surname, role')
    .in('id', creatorIds.length ? creatorIds : ['00000000-0000-0000-0000-000000000000']);
  const { teacherClassroomName } = await import('@/lib/teacher-identity');
  const nameMap = new Map<string, string>();
  (profiles ?? []).forEach((p: any) => {
    const name = p.role === 'teacher' ? teacherClassroomName(p) : (p.preferred_name || p.display_name || 'User');
    nameMap.set(p.id, name);
  });

  const result = visible.map((t: any) => {
    const rs = replyMap.get(t.id) ?? [];
    const last = rs[rs.length - 1];
    const openFlags = rs.filter((r: any) => r.flagged_reason && !r.flagged_dismissed_at).length;
    return {
      ...t,
      created_by_name: nameMap.get(t.created_by) || 'User', // Teacher's classroom_name for student consumers
      reply_count: rs.length,
      last_reply_at: last?.created_at ?? t.created_at,
      last_reply_preview: last?.content?.slice(0, 120) ?? null,
      open_flag_count: openFlags,
    };
  });

  return NextResponse.json({ topics: result });
}

/**
 * POST /api/message-board/topics
 * Body: { classId, userId, role, title, is_private?, participant_ids? }
 * Creates a new topic. Students only allowed if class.allow_student_topics = true.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { classId, userId, role, title, is_private, participant_ids } = body || {};

  if (!classId || !userId || !title?.trim()) {
    return NextResponse.json({ error: 'classId, userId, title required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Check class setting for students
  if (role !== 'teacher') {
    const { data: cls } = await (supabase as any)
      .from('classes')
      .select('allow_student_topics')
      .eq('id', classId)
      .maybeSingle();
    if (cls && cls.allow_student_topics === false) {
      return NextResponse.json({ error: 'Student topics are disabled for this class' }, { status: 403 });
    }
  }

  // Students can't create private topics
  const privateFlag = role === 'teacher' ? !!is_private : false;

  const { data: topic, error } = await (supabase as any)
    .from('message_board_topics')
    .insert({
      class_id: classId,
      title: title.trim().slice(0, 200),
      created_by: userId,
      is_private: privateFlag,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (privateFlag && Array.isArray(participant_ids) && participant_ids.length > 0) {
    const rows = participant_ids.map((pid: string) => ({ topic_id: topic.id, user_id: pid }));
    // Always include the creating teacher as a participant so they can see it everywhere
    rows.push({ topic_id: topic.id, user_id: userId });
    await (supabase as any).from('message_board_participants').upsert(rows);
  }

  return NextResponse.json({ topic });
}
