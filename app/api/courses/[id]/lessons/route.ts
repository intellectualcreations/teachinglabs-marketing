import { NextResponse } from 'next/server';
import { getLessonsByCourse } from '@/lib/lesson-store';
import { getCourseById } from '@/lib/courses';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const course = getCourseById(id);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const lessons = getLessonsByCourse(id);

  return NextResponse.json({
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      moduleTitle: l.moduleTitle,
      order: l.order,
    })),
  });
}
