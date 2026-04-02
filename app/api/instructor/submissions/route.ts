import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getInstructorById } from '@/lib/users';
import { getPendingSubmissions } from '@/lib/grade-store';

/**
 * GET /api/instructor/submissions
 * Returns all quiz submissions (pending and graded) for courses the instructor owns.
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

  const submissions = getPendingSubmissions(user.id);

  return NextResponse.json({ submissions, instructor: user });
}
