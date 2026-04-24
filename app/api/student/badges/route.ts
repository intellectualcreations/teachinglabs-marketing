import { NextRequest, NextResponse } from 'next/server';
import { getUserBadges, awardBadge } from '@/lib/badge-store';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  return NextResponse.json(getUserBadges(auth.user.id));
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { type, courseId } = await request.json();
  const badge = awardBadge(auth.user.id, type, courseId);
  return NextResponse.json(badge);
}
