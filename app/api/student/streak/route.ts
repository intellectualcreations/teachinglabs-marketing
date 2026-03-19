import { NextRequest, NextResponse } from 'next/server';
import { getStreak, updateStreak } from '@/lib/streak-store';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || 'anonymous';
  return NextResponse.json(getStreak(userId));
}

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  const streak = updateStreak(userId);
  return NextResponse.json(streak);
}
