import { NextResponse } from 'next/server';
import { getCurrentUser, getInstructorById } from '@/lib/users';
import { gradeSubmission } from '@/lib/grade-store';
import { createNotification } from '@/lib/notification-store';
import { getAttemptById, getQuizById } from '@/lib/quiz-store';

interface RouteParams {
  params: Promise<{ submissionId: string }>;
}

/**
 * POST /api/instructor/grade/[submissionId]
 * Assign score (0-100) and text feedback to a submission.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { submissionId } = await params;

  let body: { score: number; feedback: string; instructorId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const user = body.instructorId
    ? getInstructorById(body.instructorId)
    : getCurrentUser('instructor');

  if (!user || user.role !== 'instructor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (body.score === undefined || body.score === null) {
    return NextResponse.json({ error: 'score is required' }, { status: 400 });
  }

  if (typeof body.score !== 'number' || body.score < 0 || body.score > 100) {
    return NextResponse.json({ error: 'score must be a number between 0 and 100' }, { status: 400 });
  }

  try {
    const graded = gradeSubmission(
      submissionId,
      body.score,
      body.feedback || '',
      user.id,
    );

    // Notify the student about the grade
    const attempt = getAttemptById(submissionId);
    if (attempt) {
      const quiz = getQuizById(attempt.quizId);
      createNotification(
        graded.studentId,
        'quiz_graded',
        `Your quiz "${quiz?.title || 'Quiz'}" was graded: ${body.score}%`,
        {
          quizId: graded.quizId,
          submissionId: graded.submissionId,
          score: String(body.score),
        },
      );
    }

    return NextResponse.json({ submission: graded });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Grading failed';
    const status = message.includes('not found') ? 404 : message.includes('does not own') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
