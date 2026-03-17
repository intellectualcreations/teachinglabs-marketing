import { NextRequest, NextResponse } from 'next/server';
import { getInstructorById, getCurrentUser } from '@/lib/users';
import { getInstructorAnalytics } from '@/lib/analytics-store';

/**
 * GET /api/instructor/analytics
 * Returns analytics for the instructor's courses.
 * Demo: accepts ?instructorId= query param, defaults to demo instructor.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('instructorId');

  const user = instructorId
    ? getInstructorById(instructorId)
    : getCurrentUser('instructor');

  if (!user || user.role !== 'instructor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const analytics = getInstructorAnalytics(user.id);
  return NextResponse.json({ analytics, instructor: user });
}
