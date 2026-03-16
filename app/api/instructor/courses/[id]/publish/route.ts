import { NextRequest, NextResponse } from 'next/server';
import { togglePublished, getCourseById } from '@/lib/courses';

/**
 * POST /api/instructor/courses/[id]/publish
 * Toggle the published state of a course.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const updated = togglePublished(id);
  return NextResponse.json({ course: updated });
}
