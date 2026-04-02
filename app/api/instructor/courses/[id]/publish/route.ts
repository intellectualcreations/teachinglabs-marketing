import { NextRequest, NextResponse } from 'next/server';
import { togglePublished, getCourseById } from '@/lib/courses';
import { getEnrollmentsByCourse } from '@/lib/enrollment-store';
import { createNotification } from '@/lib/notification-store';

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

  // If the course was just published, notify all enrolled students
  if (updated && updated.published) {
    const enrollments = getEnrollmentsByCourse(id);
    for (const enrollment of enrollments) {
      createNotification(
        enrollment.studentId,
        'new_lesson',
        `New content available in "${updated.title}"!`,
        { courseId: id },
      );
    }
  }

  return NextResponse.json({ course: updated });
}
