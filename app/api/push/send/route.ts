/**
 * Internal push notification send endpoint.
 * FLU-268: PWA push notifications
 *
 * POST /api/push/send — sends a push notification to a specific user.
 * Body: { userId, title, body, url? }
 *
 * This is an internal endpoint; in production, secure with an API key or auth check.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/push-service';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let body: { userId?: string; title?: string; body?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { userId, title, body: notifBody, url } = body;
  if (!userId || !title || !notifBody) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, title, body' },
      { status: 400 }
    );
  }

  const sent = await sendPushToUser(userId, {
    title,
    body: notifBody,
    url,
  });

  return NextResponse.json({ success: true, sent });
}
