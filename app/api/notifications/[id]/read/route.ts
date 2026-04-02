import { NextResponse } from 'next/server';
import { markRead } from '@/lib/notification-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/notifications/[id]/read
 * Mark a single notification as read.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const notif = markRead(id);
  if (!notif) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  return NextResponse.json({ notification: notif });
}
