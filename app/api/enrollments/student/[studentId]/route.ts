import { NextResponse } from 'next/server';
import { getEnrollments } from '@/lib/enrollment-store';
import { getCourseById } from '@/lib/courses';

interface RouteParams {
  params: Promise<{ studentId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { studentId } = await params;
  const enrollments = getEnrollments(studentId);

  const enriched = enrollments.map((e) => {
    const course = getCourseById(e.courseId);
    return {
      ...e,
      course: course
        ? {
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

  return NextResponse.json({ enrollments: enriched });
}
