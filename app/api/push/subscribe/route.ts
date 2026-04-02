/**
 * Push subscription endpoint.
 * FLU-268: PWA push notifications
 *
 * POST /api/push/subscribe — saves a push subscription for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { savePushSubscription } from '@/lib/push-subscription-store';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const role = req.nextUrl.searchParams.get('role') || undefined;
  const user = getCurrentUser(role);

  let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: 'Missing required fields: endpoint, keys.p256dh, keys.auth' },
      { status: 400 }
    );
  }

  const record = savePushSubscription(user.id, endpoint, keys.p256dh, keys.auth);

  return NextResponse.json({ success: true, subscriptionId: record.id });
}
