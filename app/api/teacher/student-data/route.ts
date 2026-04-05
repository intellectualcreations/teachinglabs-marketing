import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/student-data?teacherId=<uuid>
 * Returns { classes, chatMessages[], studentProfiles[] } for the student-chats page.
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // Fetch teacher's classes
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId);

    if (classError) {
      console.error('Student-data classes error:', classError.message);
      return NextResponse.json({ error: classError.message }, { status: 500 });
    }

    const teacherClasses = classes ?? [];

    if (teacherClasses.length === 0) {
      return NextResponse.json({ classes: [], chatMessages: [], studentProfiles: [] });
    }

    const classIds = teacherClasses.map((c: { id: string }) => c.id);

    // Fetch chat messages for teacher's classes
    const { data: messageData, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .in('class_id', classIds)
      .order('created_at', { ascending: false })
      .limit(500);

    if (msgError) {
      console.error('Student-data messages error:', msgError.message);
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    const messages = messageData ?? [];

    // Also fetch activity chats (Spark conversations)
    // Get activity IDs assigned to teacher's classes
    const { data: classActivities } = await (supabase as any)
      .from('class_activities')
      .select('activity_id, class_id')
      .in('class_id', classIds);

    let activityChats: any[] = [];
    const activityClassMap = new Map<string, string>();
    if (classActivities && classActivities.length > 0) {
      const activityIds = [...new Set(classActivities.map((ca: any) => ca.activity_id))];
      classActivities.forEach((ca: any) => activityClassMap.set(ca.activity_id, ca.class_id));

      const { data: actChatData } = await (supabase as any)
        .from('activity_chats')
        .select('*')
        .in('activity_id', activityIds)
        .order('created_at', { ascending: false })
        .limit(500);

      // Get activity names for context
      const { data: activityNames } = await (supabase as any)
        .from('activities')
        .select('id, title')
        .in('id', activityIds);
      const nameMap = new Map<string, string>();
      (activityNames ?? []).forEach((a: any) => nameMap.set(a.id, a.title));

      // Normalize activity chats to match chat_messages shape
      activityChats = (actChatData ?? []).map((ac: any) => ({
        id: ac.id,
        sender_id: ac.role === 'user' ? ac.student_id : 'spark-ai',
        class_id: activityClassMap.get(ac.activity_id) || classIds[0],
        content: ac.content,
        message_type: 'activity_chat',
        created_at: ac.created_at,
        activity_id: ac.activity_id,
        activity_name: nameMap.get(ac.activity_id) || 'Activity',
        student_id: ac.student_id,
        role: ac.role,
      }));
    }

    const allMessages = [...messages, ...activityChats];

    if (allMessages.length === 0) {
      return NextResponse.json({ classes: teacherClasses, chatMessages: [], studentProfiles: [] });
    }

    // Get unique sender IDs (exclude the teacher and spark-ai)
    const senderIds = [...new Set(
      allMessages
        .filter((m: any) => m.sender_id !== teacherId && m.sender_id !== 'spark-ai')
        .map((m: any) => m.sender_id || m.student_id)
        .filter(Boolean)
    )];

    if (senderIds.length === 0) {
      return NextResponse.json({ classes: teacherClasses, chatMessages: allMessages, studentProfiles: [] });
    }

    // Fetch sender profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', senderIds);

    return NextResponse.json({
      classes: teacherClasses,
      chatMessages: allMessages,
      studentProfiles: profileData ?? [],
    });
  } catch (err) {
    console.error('Student-data API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
