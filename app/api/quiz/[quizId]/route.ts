import { NextResponse } from 'next/server';
import { getQuizById } from '@/lib/quiz-store';

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { quizId } = await params;
  const quiz = getQuizById(quizId);

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // Strip correct answers before sending to client
  const safeQuestions = quiz.questions.map((q) => ({
    id: q.id,
    quizId: q.quizId,
    text: q.text,
    type: q.type,
    options: q.options,
  }));

  return NextResponse.json({
    id: quiz.id,
    lessonId: quiz.lessonId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: safeQuestions,
  });
}
