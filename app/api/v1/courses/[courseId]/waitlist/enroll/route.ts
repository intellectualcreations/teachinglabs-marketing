import { NextResponse } from 'next/server';
import { enrollFromWaitlist } from '@/lib/waitlist-store';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * POST /api/v1/courses/:courseId/waitlist/enroll
 * Auto-enroll the next student from the waitlist.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const { courseId } = await params;

  try {
    const result = enrollFromWaitlist(courseId);

    if (!result.enrolled) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
