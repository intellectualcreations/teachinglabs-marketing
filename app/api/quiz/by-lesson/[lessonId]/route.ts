import { NextResponse } from 'next/server';
import { getQuizByLessonId, getBestAttempt } from '@/lib/quiz-store';
import { getCurrentUser } from '@/lib/users';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { lessonId } = await params;
  const quiz = getQuizByLessonId(lessonId);

  if (!quiz) {
    return NextResponse.json({ error: 'No quiz for this lesson' }, { status: 404 });
  }

  // Strip correct answers before sending to client
  const safeQuestions = quiz.questions.map((q) => ({
    id: q.id,
    quizId: q.quizId,
    text: q.text,
    type: q.type,
    options: q.options,
  }));

  // Check for student's best attempt
  const user = getCurrentUser('student');
  const bestAttempt = getBestAttempt(user.id, quiz.id);

  return NextResponse.json({
    id: quiz.id,
    lessonId: quiz.lessonId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: safeQuestions,
    bestAttempt: bestAttempt
      ? { score: bestAttempt.score, passed: bestAttempt.passed, takenAt: bestAttempt.takenAt }
      : null,
  });
}
