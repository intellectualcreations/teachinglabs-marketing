import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getEnrollments } from '@/lib/enrollment-store';
import { getCourseById } from '@/lib/courses';
import { getLessonProgress } from '@/lib/lesson-store';

export async function GET() {
  const user = getCurrentUser('student');
  const enrollments = getEnrollments(user.id);

  const result = enrollments.map((e) => {
    const course = getCourseById(e.courseId);
    const progress = getLessonProgress(user.id, e.courseId);
    return {
      ...e,
      lessonProgress: progress,
      course: course
        ? {
            id: course.id,
            title: course.title,
            subject: course.subject,
            instructor: course.instructor,
            gradeLevel: course.gradeLevel,
            thumbnail: course.thumbnail,
            modules: course.modules,
          }
        : null,
    };
  });

  return NextResponse.json({ enrollments: result });
}
