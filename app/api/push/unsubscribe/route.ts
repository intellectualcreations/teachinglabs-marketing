/**
 * Push unsubscribe endpoint.
 * FLU-268: PWA push notifications
 *
 * POST /api/push/unsubscribe — removes a push subscription for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { removePushSubscription } from '@/lib/push-subscription-store';
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

  let body: { endpoint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { endpoint } = body;
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing required field: endpoint' }, { status: 400 });
  }

  const removed = removePushSubscription(user.id, endpoint);

  return NextResponse.json({ success: true, removed });
}
