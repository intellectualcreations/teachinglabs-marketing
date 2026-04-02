import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { markAllRead } from '@/lib/notification-store';

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for the logged-in user.
 * Accepts optional JSON body { role: "student" | "instructor" }.
 */
export async function POST(request: Request) {
  let role: string | undefined;
  try {
    const body = await request.json();
    role = body.role;
  } catch {
    // no body is fine
  }

  const user = getCurrentUser(role);
  const count = markAllRead(user.id);

  return NextResponse.json({ markedRead: count });
}
