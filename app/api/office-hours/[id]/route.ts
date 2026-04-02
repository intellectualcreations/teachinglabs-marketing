import { NextResponse } from 'next/server';
import { getSessionById, getQuestionsBySession } from '@/lib/office-hours-store';
import { getCourseById } from '@/lib/courses';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/office-hours/:id
 * Get a single office hours session with its questions and course info.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = getSessionById(id);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const questions = getQuestionsBySession(id);
  const course = getCourseById(session.courseId);

  return NextResponse.json({
    session,
    questions,
    course: course ? { id: course.id, title: course.title, subject: course.subject } : null,
  });
}
