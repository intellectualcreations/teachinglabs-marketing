import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/student-conversations?studentId=<uuid>&teacherId=<uuid>
 * Returns the student's AI tutor conversations grouped into sessions,
 * plus activity chats. Teacher-authorized: must have the student in a class.
 *
 * Response shape:
 * {
 *   sessions: [
 *     {
 *       id: string,                // synthetic session id (date bucket or activity id)
 *       type: 'chat' | 'activity',
 *       title: string,             // e.g. "Free chat · Mar 14" or "Fractions Lesson"
 *       class_name?: string,
 *       first_at: string,
 *       last_at: string,
 *       message_count: number,
 *       preview: string,           // first user message or summary
 *       messages: [{ id, role, content, created_at }]
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId');
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!studentId || !teacherId) {
    return NextResponse.json({ error: 'studentId and teacherId required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Authorize
  const { data: teacherClasses } = await (admin as any)
    .from('classes')
    .select('id, name')
    .eq('teacher_id', teacherId);
  const classIds = (teacherClasses ?? []).map((c: any) => c.id);
  if (classIds.length === 0) return NextResponse.json({ sessions: [] });

  const { data: enrollment } = await (admin as any)
    .from('enrollments')
    .select('class_id')
    .eq('student_id', studentId)
    .in('class_id', classIds);
  if (!enrollment || enrollment.length === 0) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const classNameMap = new Map<string, string>();
  (teacherClasses ?? []).forEach((c: any) => classNameMap.set(c.id, c.name));
  const studentClassIds = enrollment.map((e: any) => e.class_id);

  // Free-form chat messages
  const { data: chatMsgs } = await (admin as any)
    .from('chat_messages')
    .select('*')
    .eq('sender_id', studentId)
    .in('class_id', studentClassIds)
    .order('created_at', { ascending: true })
    .limit(500);

  // Include AI replies (sender_id differs) by fetching messages for each class where this student was involved
  // Simpler: fetch all messages in those classes and filter to ones involving this student
  const { data: allClassMsgs } = await (admin as any)
    .from('chat_messages')
    .select('*')
    .in('class_id', studentClassIds)
    .order('created_at', { ascending: true })
    .limit(2000);

  // Group chat_messages into day-level sessions per class. Each gap >2hr starts a new session.
  const sessions: any[] = [];
  const byClass = new Map<string, any[]>();
  (allClassMsgs ?? []).forEach((m: any) => {
    // Only include sessions where THIS student participated
    const arr = byClass.get(m.class_id) ?? [];
    arr.push(m);
    byClass.set(m.class_id, arr);
  });

  byClass.forEach((msgs, classId) => {
    // Walk messages; build sessions that contain at least one message from this student
    let current: any[] = [];
    let lastTime = 0;
    for (const m of msgs) {
      const t = new Date(m.created_at).getTime();
      if (current.length > 0 && (t - lastTime) > 2 * 60 * 60 * 1000) {
        // Flush
        if (current.some((x) => x.sender_id === studentId)) {
          sessions.push(buildChatSession(current, classNameMap.get(classId) || 'Class'));
        }
        current = [];
      }
      current.push(m);
      lastTime = t;
    }
    if (current.length && current.some((x) => x.sender_id === studentId)) {
      sessions.push(buildChatSession(current, classNameMap.get(classId) || 'Class'));
    }
  });

  // Activity chats — one session per (activity_id, student_id)
  const { data: classActivities } = await (admin as any)
    .from('class_activities')
    .select('activity_id, class_id')
    .in('class_id', studentClassIds);
  const activityIds = [...new Set((classActivities ?? []).map((ca: any) => ca.activity_id))];
  if (activityIds.length > 0) {
    const activityClassMap = new Map<string, string>();
    (classActivities ?? []).forEach((ca: any) => activityClassMap.set(ca.activity_id, ca.class_id));

    const { data: activities } = await (admin as any)
      .from('activities')
      .select('id, title')
      .in('id', activityIds);
    const activityTitleMap = new Map<string, string>();
    (activities ?? []).forEach((a: any) => activityTitleMap.set(a.id, a.title));

    const { data: actChats } = await (admin as any)
      .from('activity_chats')
      .select('*')
      .eq('student_id', studentId)
      .in('activity_id', activityIds)
      .order('created_at', { ascending: true });

    const byActivity = new Map<string, any[]>();
    (actChats ?? []).forEach((ac: any) => {
      const arr = byActivity.get(ac.activity_id) ?? [];
      arr.push(ac);
      byActivity.set(ac.activity_id, arr);
    });
    byActivity.forEach((msgs, activityId) => {
      sessions.push({
        id: `activity:${activityId}`,
        type: 'activity',
        title: activityTitleMap.get(activityId) || 'Activity',
        class_name: classNameMap.get(activityClassMap.get(activityId) || '') || 'Class',
        first_at: msgs[0]?.created_at,
        last_at: msgs[msgs.length - 1]?.created_at,
        message_count: msgs.length,
        preview: (msgs.find((m: any) => m.role === 'user')?.content || msgs[0]?.content || '').slice(0, 160),
        messages: msgs.map((m: any) => ({ id: m.id, role: m.role, content: m.content, created_at: m.created_at })),
      });
    });
  }

  // Sort newest first
  sessions.sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());

  return NextResponse.json({ sessions });
}

function buildChatSession(msgs: any[], className: string) {
  const first = msgs[0];
  const last = msgs[msgs.length - 1];
  const firstUserMsg = msgs.find((m: any) => m.sender_id && !m.sender_id.includes('ai') && m.content);
  return {
    id: `chat:${first.class_id}:${first.created_at}`,
    type: 'chat',
    title: `Chat · ${new Date(first.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    class_name: className,
    first_at: first.created_at,
    last_at: last.created_at,
    message_count: msgs.length,
    preview: (firstUserMsg?.content || first.content || '').slice(0, 160),
    messages: msgs.map((m: any) => ({
      id: m.id,
      role: m.role || (m.sender_id && m.sender_id.includes('ai') ? 'assistant' : 'user'),
      content: m.content,
      created_at: m.created_at,
    })),
  };
}
