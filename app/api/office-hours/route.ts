import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserById } from '@/lib/users';
import { getCourseById } from '@/lib/courses';
import {
  createOfficeHoursSession,
  getSessionsByCourse,
  getSessionsByInstructor,
} from '@/lib/office-hours-store';
import { getEnrollmentsByCourse } from '@/lib/enrollment-store';
import { sendOfficeHoursNotification } from '@/lib/email-service';

/**
 * POST /api/office-hours
 * Create a new office hours session and notify enrolled students.
 */
export async function POST(request: NextRequest) {
  const user = getCurrentUser('instructor');

  const body = await request.json();
  const { courseId, title, scheduledAt } = body as {
    courseId?: string;
    title?: string;
    scheduledAt?: string;
  };

  if (!courseId || !title || !scheduledAt) {
    return NextResponse.json(
      { error: 'courseId, title, and scheduledAt are required' },
      { status: 400 },
    );
  }

  const course = getCourseById(courseId);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const session = createOfficeHoursSession(courseId, user.id, title, scheduledAt);

  // Notify enrolled students
  const enrollments = getEnrollmentsByCourse(courseId);
  for (const enrollment of enrollments) {
    const student = getUserById(enrollment.studentId);
    if (student) {
      sendOfficeHoursNotification(
        student.email,
        student.name,
        title,
        course.title,
        scheduledAt,
      );
    }
  }

  return NextResponse.json({ session }, { status: 201 });
}

/**
 * GET /api/office-hours?courseId=X&instructorId=X
 * List office hours sessions with optional filters.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const instructorId = searchParams.get('instructorId');

  if (courseId) {
    return NextResponse.json({ sessions: getSessionsByCourse(courseId) });
  }

  if (instructorId) {
    return NextResponse.json({ sessions: getSessionsByInstructor(instructorId) });
  }

  // Default: return current instructor's sessions
  const user = getCurrentUser('instructor');
  return NextResponse.json({ sessions: getSessionsByInstructor(user.id) });
}
