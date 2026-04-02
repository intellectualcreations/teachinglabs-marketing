import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getNotifications, getUnreadCount } from '@/lib/notification-store';

/**
 * GET /api/notifications
 * Returns all notifications for the logged-in user, sorted newest first.
 * Accepts optional ?role=student|instructor to select demo user.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || undefined;
  const user = getCurrentUser(role);

  const items = getNotifications(user.id);
  const unreadCount = getUnreadCount(user.id);

  return NextResponse.json({ notifications: items, unreadCount });
}
