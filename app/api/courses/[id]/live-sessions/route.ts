import { NextResponse } from 'next/server';
import { getSessionsByCourse } from '@/lib/live-session-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const sessions = getSessionsByCourse(courseId);
  return NextResponse.json({ sessions });
}
