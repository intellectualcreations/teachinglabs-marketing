import { NextRequest, NextResponse } from 'next/server';
import { getCourseById } from '@/lib/courses';

/**
 * GET /api/checkout/[courseId]
 * Returns course info for the checkout page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json({
    courseId: course.id,
    title: course.title,
    price: course.price,
    instructor: course.instructor,
  });
}
