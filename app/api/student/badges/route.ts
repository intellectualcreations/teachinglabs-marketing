import { NextRequest, NextResponse } from 'next/server';
import { getUserBadges, awardBadge } from '@/lib/badge-store';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || 'anonymous';
  return NextResponse.json(getUserBadges(userId));
}

export async function POST(request: NextRequest) {
  const { userId, type, courseId } = await request.json();
  const badge = awardBadge(userId, type, courseId);
  return NextResponse.json(badge);
}
