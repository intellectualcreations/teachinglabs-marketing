import { NextResponse } from 'next/server';
import {
  getRequestById,
  updateRequestStatus,
  createPair,
} from '@/lib/mentorship-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/mentorship/requests/:id/accept
 * Mentor accepts an open mentorship request.
 * Body: { mentorId }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: { mentorId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.mentorId) {
    return NextResponse.json({ error: 'mentorId is required' }, { status: 400 });
  }

  const mentorshipRequest = getRequestById(id);
  if (!mentorshipRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  if (mentorshipRequest.status !== 'OPEN') {
    return NextResponse.json(
      { error: `Request is already ${mentorshipRequest.status.toLowerCase()}` },
      { status: 409 },
    );
  }

  if (mentorshipRequest.studentId === body.mentorId) {
    return NextResponse.json(
      { error: 'A student cannot mentor themselves' },
      { status: 400 },
    );
  }

  // Mark request accepted
  updateRequestStatus(id, 'ACCEPTED');

  // Create active pair
  const pair = createPair({
    requestId: id,
    studentId: mentorshipRequest.studentId,
    mentorId: body.mentorId,
    courseId: mentorshipRequest.courseId,
    topic: mentorshipRequest.topic,
  });

  return NextResponse.json({ pair }, { status: 201 });
}
