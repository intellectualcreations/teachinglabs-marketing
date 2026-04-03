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

    if (messages.length === 0) {
      return NextResponse.json({ classes: teacherClasses, chatMessages: [], studentProfiles: [] });
    }

    // Get unique sender IDs (exclude the teacher)
    const senderIds = [...new Set(
      messages
        .filter((m: { sender_id: string }) => m.sender_id !== teacherId)
        .map((m: { sender_id: string }) => m.sender_id)
    )];

    if (senderIds.length === 0) {
      return NextResponse.json({ classes: teacherClasses, chatMessages: messages, studentProfiles: [] });
    }

    // Fetch sender profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', senderIds);

    return NextResponse.json({
      classes: teacherClasses,
      chatMessages: messages,
      studentProfiles: profileData ?? [],
    });
  } catch (err) {
    console.error('Student-data API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
