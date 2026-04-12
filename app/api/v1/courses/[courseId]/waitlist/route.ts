import { NextResponse } from 'next/server';
import { getWaitlist, addToWaitlist } from '@/lib/waitlist-store';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/v1/courses/:courseId/waitlist
 * Returns the waitlist info and entries for a course.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { courseId } = await params;

  try {
    const result = getWaitlist(courseId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

/**
 * POST /api/v1/courses/:courseId/waitlist
 * Add a student to the waitlist.
 * Body: { studentId: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { courseId } = await params;

  try {
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 },
      );
    }

    const entry = addToWaitlist(courseId, studentId);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('not found') ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
