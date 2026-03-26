/**
 * GET /api/sandbox/history/[lessonId]
 * FLU-319: Returns last 10 sandbox runs for current user + lessonId.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getSandboxHistory } from '@/lib/sandbox-store';
import { rateLimit } from '@/lib/rate-limit';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  const { lessonId } = await params;
  const user = getCurrentUser();
  const history = getSandboxHistory(user.id, lessonId);

  return NextResponse.json({ history });
}
