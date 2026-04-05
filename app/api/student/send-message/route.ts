import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * POST /api/student/send-message
 * Student sends a direct message to a class/teacher
 */
export async function POST(request: NextRequest) {
  const admin = createAdminClient();

  try {
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { classId, message } = body;

    if (!classId || !message) {
      return NextResponse.json({ error: 'Missing classId or message' }, { status: 400 });
    }

    // Insert message to chat_messages table (admin bypass RLS)
    const { data, error } = await (admin as any)
      .from('chat_messages')
      .insert({
        class_id: classId,
        student_id: user.id,
        message: message.trim(),
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Chat insert error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data?.[0] });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
