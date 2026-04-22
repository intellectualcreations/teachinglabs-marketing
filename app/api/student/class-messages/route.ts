import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/student/class-messages?classId=<uuid>
 * Returns all messages for a class (visible to enrolled students).
 */
export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get('classId');
  if (!classId) {
    return NextResponse.json({ error: 'classId required' }, { status: 400 });
  }

  // Auth check
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch { /* try header */ }

  if (!userId) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const admin = createAdminClient();
      const { data: { user } } = await admin.auth.getUser(authHeader.slice(7));
      if (user) userId = user.id;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch messages ordered by time
  const { data: messages, error } = await admin
    .from('class_messages')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Fetch class messages error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [] });
}

/**
 * POST /api/student/class-messages
 * Body: { classId, content, targetType? }
 * Sends a message to the class message board.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { classId, content, targetType = 'class' } = body;

  if (!classId || !content?.trim()) {
    return NextResponse.json({ error: 'classId and content required' }, { status: 400 });
  }

  // Auth check
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch { /* try header */ }

  if (!userId) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const admin = createAdminClient();
      const { data: { user } } = await admin.auth.getUser(authHeader.slice(7));
      if (user) userId = user.id;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get sender info
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name, preferred_name, role')
    .eq('id', userId)
    .single();

  const senderName = (profile as any)?.preferred_name || (profile as any)?.display_name || 'Unknown';
  const senderRole = (profile as any)?.role === 'teacher' ? 'teacher' : 'student';

  // Insert message
  const { data: message, error } = await admin
    .from('class_messages')
    .insert({
      class_id: classId,
      sender_id: userId,
      sender_name: senderName,
      sender_role: senderRole,
      content: content.trim(),
      target_type: targetType,
    } as never)
    .select()
    .single();

  if (error) {
    console.error('Insert class message error:', error.message);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ message });
}
