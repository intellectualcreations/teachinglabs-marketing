import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getEnrollments } from '@/lib/enrollment-store';
import { getCourseById } from '@/lib/courses';
import { getLessonProgress } from '@/lib/lesson-store';
import { createNotification, getNotifications } from '@/lib/notification-store';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/student/certificates/[courseId]
 * Validates 100% course completion and returns certificate data.
 * Auto-creates a course_completed notification if one doesn't exist yet.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { courseId } = await params;
  const user = getCurrentUser('student');

  // Check enrollment
  const enrollments = getEnrollments(user.id);
  const enrollment = enrollments.find((e) => e.courseId === courseId);
  if (!enrollment) {
    return NextResponse.json(
      { error: 'Not enrolled in this course' },
      { status: 403 },
    );
  }

  const course = getCourseById(courseId);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Check 100% lesson completion
  const progress = getLessonProgress(user.id, courseId);
  if (progress.percentage < 100) {
    return NextResponse.json(
      {
        error: 'Course not yet completed',
        progress: progress.percentage,
        completed: progress.completed,
        total: progress.total,
      },
      { status: 400 },
    );
  }

  // Auto-create course_completed notification if not already present
  const existing = getNotifications(user.id).find(
    (n) => n.type === 'course_completed' && n.metadata.courseId === courseId,
  );
  if (!existing) {
    createNotification(
      user.id,
      'course_completed',
      `Congratulations! You completed "${course.title}"`,
      { courseId },
    );
  }

  return NextResponse.json({
    certificate: {
      studentName: user.name,
      courseTitle: course.title,
      courseSubject: course.subject,
      instructor: course.instructor,
      completionDate: new Date().toISOString().split('T')[0],
      lessonCount: progress.total,
    },
  });
}
