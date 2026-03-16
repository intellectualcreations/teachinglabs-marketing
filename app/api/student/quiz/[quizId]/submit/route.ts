import { NextResponse } from 'next/server';
import { getQuizById, submitQuiz } from '@/lib/quiz-store';
import { getCurrentUser } from '@/lib/users';

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { quizId } = await params;
  const user = getCurrentUser('student');

  const quiz = getQuizById(quizId);
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  let body: { answers: { questionId: string; answer: number | string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.answers || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'answers array is required' }, { status: 400 });
  }

  const attempt = submitQuiz(user.id, quizId, body.answers);

  // Build per-question results with correct answers revealed
  const results = quiz.questions.map((q) => {
    const studentAnswer = body.answers.find((a) => a.questionId === q.id);
    let correct = false;

    if (q.type === 'short-answer') {
      const sa = String(studentAnswer?.answer || '').toLowerCase().trim();
      const expected = (q.correctAnswer || '').toLowerCase().trim();
      correct = sa === expected || sa.includes(expected);
    } else {
      correct = Number(studentAnswer?.answer) === q.correctIndex;
    }

    return {
      questionId: q.id,
      correct,
      correctAnswer:
        q.type === 'short-answer'
          ? q.correctAnswer
          : q.options[q.correctIndex],
    };
  });

  return NextResponse.json({
    score: attempt.score,
    passed: attempt.passed,
    passingScore: quiz.passingScore,
    results,
  });
}
