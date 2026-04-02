import { NextResponse } from 'next/server';
import { getOpenRequestsByCourse, getAllOpenRequests } from '@/lib/mentorship-store';

/**
 * GET /api/mentorship/requests?courseId=X
 * List open mentorship requests, optionally filtered by course.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  const requests = courseId
    ? getOpenRequestsByCourse(courseId)
    : getAllOpenRequests();

  return NextResponse.json({ requests, total: requests.length });
}
