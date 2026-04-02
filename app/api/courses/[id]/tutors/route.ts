import { NextResponse } from 'next/server';
import { getTutorsByCourse, optInAsTutor, optOutAsTutor } from '@/lib/peer-tutor-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const tutors = getTutorsByCourse(courseId);
  return NextResponse.json({ tutors });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const body = await request.json();
  const { userId, userName, bio, optOut } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
  }

  if (optOut) {
    const removed = optOutAsTutor(userId, courseId);
    if (!removed) {
      return NextResponse.json({ error: 'Not currently a tutor for this course' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  if (!userName) {
    return NextResponse.json({ error: 'Missing required field: userName' }, { status: 400 });
  }

  const tutor = optInAsTutor(userId, userName, courseId, bio ?? '');
  return NextResponse.json({ tutor }, { status: 201 });
}
