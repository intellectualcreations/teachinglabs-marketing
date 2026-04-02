import { NextResponse } from 'next/server';
import { createQuiz, getQuizByLessonId } from '@/lib/quiz-store';
import { getCurrentUser } from '@/lib/users';
import { getLessonById } from '@/lib/lesson-store';

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (user.role !== 'instructor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let body: {
    lessonId: string;
    title: string;
    passingScore: number;
    questions: {
      text: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer';
      options: string[];
      correctIndex: number;
      correctAnswer?: string;
    }[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.lessonId || !body.title || !body.questions || body.questions.length === 0) {
    return NextResponse.json(
      { error: 'lessonId, title, and at least one question are required' },
      { status: 400 },
    );
  }

  // Verify lesson exists
  const lesson = getLessonById(body.lessonId);
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Check if quiz already exists for this lesson
  const existing = getQuizByLessonId(body.lessonId);
  if (existing) {
    return NextResponse.json(
      { error: 'A quiz already exists for this lesson' },
      { status: 409 },
    );
  }

  const quiz = createQuiz(
    body.lessonId,
    body.title,
    body.passingScore ?? 70,
    body.questions,
  );

  return NextResponse.json({ quiz }, { status: 201 });
}
