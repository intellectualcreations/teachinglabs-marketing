import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';

/**
 * GET /api/message-board/flagged
 * Returns all open (not-dismissed) flagged replies across the authenticated
 * teacher's classes, grouped by topic. Any `teacherId` query param is ignored.
 */
export async function GET(request: NextRequest) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin: supabase } = auth;
  const teacherId = user.id;

  const { data: classes } = await (supabase as any)
    .from('classes')
    .select('id, name')
    .eq('teacher_id', teacherId);

  const classIds = (classes ?? []).map((c: any) => c.id);
  if (classIds.length === 0) return NextResponse.json({ flagged: [] });

  const classNameMap = new Map((classes ?? []).map((c: any) => [c.id, c.name]));

  const { data: topics } = await (supabase as any)
    .from('message_board_topics')
    .select('id, class_id, title, is_private')
    .in('class_id', classIds);

  const topicIds = (topics ?? []).map((t: any) => t.id);
  if (topicIds.length === 0) return NextResponse.json({ flagged: [] });

  const topicMap = new Map((topics ?? []).map((t: any) => [t.id, t]));

  const { data: replies } = await (supabase as any)
    .from('message_board_replies')
    .select('*')
    .in('topic_id', topicIds)
    .not('flagged_reason', 'is', null)
    .is('flagged_dismissed_at', null)
    .order('created_at', { ascending: false });

  const senderIds = [...new Set((replies ?? []).map((r: any) => r.sender_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', senderIds.length ? senderIds : ['00000000-0000-0000-0000-000000000000']);
  const nameMap = new Map<string, string>();
  (profiles ?? []).forEach((p: any) => nameMap.set(p.id, p.display_name || 'Student'));

  const flagged = (replies ?? []).map((r: any) => {
    const t: any = topicMap.get(r.topic_id);
    return {
      ...r,
      sender_name: nameMap.get(r.sender_id) || 'Student',
      topic_title: t?.title || 'Topic',
      topic_id: r.topic_id,
      class_id: t?.class_id,
      class_name: classNameMap.get(t?.class_id) || '',
    };
  });

  return NextResponse.json({ flagged });
}
