import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessionsForCourse } from '@/lib/attendance-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const { date, topic } = await req.json();
  if (!date || !topic) {
    return NextResponse.json({ error: 'date and topic are required' }, { status: 400 });
  }
  const session = createSession(courseId, date, topic);
  return NextResponse.json(session, { status: 201 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const sessions = getSessionsForCourse(courseId);
  return NextResponse.json(sessions);
}
