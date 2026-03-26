import { NextResponse } from 'next/server';
import { getActivePairs, getActivePairsByCourse } from '@/lib/mentorship-store';

/**
 * GET /api/mentorship/pairs?courseId=X
 * List active mentorship pairs, optionally filtered by course.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  const pairs = courseId ? getActivePairsByCourse(courseId) : getActivePairs();

  return NextResponse.json({ pairs, total: pairs.length });
}
