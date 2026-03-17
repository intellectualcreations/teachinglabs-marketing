import { NextRequest, NextResponse } from 'next/server';
import { getInstructorById, getCurrentUser } from '@/lib/users';
import { getInstructorEarningsCSV } from '@/lib/analytics-store';

/**
 * GET /api/instructor/analytics/export
 * Returns CSV download of instructor earnings by course.
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

  const csv = getInstructorEarningsCSV(user.id);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="earnings-${user.id}.csv"`,
    },
  });
}
