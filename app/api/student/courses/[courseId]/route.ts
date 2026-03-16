import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getEnrollments } from '@/lib/enrollment-store';
import { getCourseById } from '@/lib/courses';
import {
  getLessonsByModule,
  isLessonCompleted,
  getLessonProgress,
} from '@/lib/lesson-store';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

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

  const progress = getLessonProgress(user.id, courseId);

  const modules = course.modules.map((mod) => {
    const moduleLessons = getLessonsByModule(courseId, mod.title);
    const lessonsWithStatus = moduleLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      order: lesson.order,
      content: lesson.content,
      completed: isLessonCompleted(user.id, lesson.id),
    }));

    const completedCount = lessonsWithStatus.filter((l) => l.completed).length;

    return {
      title: mod.title,
      lessonCount: mod.lessonCount,
      lessons: lessonsWithStatus,
      completedCount,
    };
  });

  return NextResponse.json({
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      instructor: course.instructor,
      gradeLevel: course.gradeLevel,
      thumbnail: course.thumbnail,
    },
    modules,
    progress,
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    },
  });
}
