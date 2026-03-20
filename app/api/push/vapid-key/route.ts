/**
 * VAPID public key endpoint.
 * FLU-268: PWA push notifications
 *
 * GET /api/push/vapid-key — returns the public VAPID key for client-side subscription.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/push-service';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const key = getVapidPublicKey();

  if (!key) {
    return NextResponse.json(
      { error: 'VAPID key not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json({ publicKey: key });
}
