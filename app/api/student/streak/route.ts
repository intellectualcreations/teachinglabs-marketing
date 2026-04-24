import { NextRequest, NextResponse } from 'next/server';
import { getStreak, updateStreak } from '@/lib/streak-store';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  return NextResponse.json(getStreak(auth.user.id));
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const streak = updateStreak(auth.user.id);
  return NextResponse.json(streak);
}
