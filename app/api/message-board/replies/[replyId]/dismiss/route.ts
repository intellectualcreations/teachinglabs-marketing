import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/message-board/replies/[replyId]/dismiss
 * Body: { userId }
 * Teacher dismisses a flag. Clears the flag fields while preserving the reply.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  const { replyId } = await params;
  const body = await request.json();
  const { userId } = body || {};

  if (!replyId || !userId) {
    return NextResponse.json({ error: 'replyId, userId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from('message_board_replies')
    .update({
      flagged_dismissed_at: new Date().toISOString(),
      flagged_dismissed_by: userId,
    })
    .eq('id', replyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
