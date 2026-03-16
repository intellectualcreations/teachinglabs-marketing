import { NextResponse } from 'next/server';
import { createLiveSession, getSessionsByCourse } from '@/lib/live-session-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const sessions = getSessionsByCourse(courseId);
  return NextResponse.json({ sessions });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const body = await request.json();
  const { title, url, scheduledAt, duration } = body;

  if (!title || !url || !scheduledAt || !duration) {
    return NextResponse.json(
      { error: 'Missing required fields: title, url, scheduledAt, duration' },
      { status: 400 },
    );
  }

  const session = createLiveSession(courseId, title, url, scheduledAt, Number(duration));
  return NextResponse.json({ session }, { status: 201 });
}
