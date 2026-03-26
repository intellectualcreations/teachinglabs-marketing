import { NextResponse } from 'next/server';
import { createRequest } from '@/lib/mentorship-store';

/**
 * POST /api/mentorship/request
 * Student requests a mentor.
 * Body: { studentId, courseId, topic }
 */
export async function POST(request: Request) {
  let body: { studentId: string; courseId: string; topic: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.studentId || !body.courseId || !body.topic) {
    return NextResponse.json(
      { error: 'studentId, courseId, and topic are required' },
      { status: 400 },
    );
  }

  const mentorshipRequest = createRequest({
    studentId: body.studentId,
    courseId: body.courseId,
    topic: body.topic,
  });

  return NextResponse.json(mentorshipRequest, { status: 201 });
}
