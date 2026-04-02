import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getEnrollments } from '@/lib/enrollment-store';
import { getLessonById, markLessonComplete, getLessonProgress } from '@/lib/lesson-store';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { lessonId } = await params;
  const user = getCurrentUser('student');

  const lesson = getLessonById(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Check enrollment
  const enrollments = getEnrollments(user.id);
  const enrollment = enrollments.find((e) => e.courseId === lesson.courseId);
  if (!enrollment) {
    return NextResponse.json(
      { error: 'Not enrolled in this course' },
      { status: 403 },
    );
  }

  const completion = markLessonComplete(user.id, lessonId);
  const progress = getLessonProgress(user.id, lesson.courseId);

  return NextResponse.json({ completion, progress });
}
