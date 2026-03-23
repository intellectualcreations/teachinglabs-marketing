import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import {
  getSessionById,
  submitQuestion,
  getQuestionsBySession,
} from '@/lib/office-hours-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/office-hours/:id/questions
 * Submit a question to an office hours session.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = getCurrentUser('student');

  const session = getSessionById(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.status === 'ended') {
    return NextResponse.json(
      { error: 'This session has ended. Questions are no longer accepted.' },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { question } = body as { question?: string };

  if (!question || !question.trim()) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 });
  }

  const q = submitQuestion(id, user.id, user.name, question.trim());
  return NextResponse.json({ question: q }, { status: 201 });
}

/**
 * GET /api/office-hours/:id/questions
 * List all questions for a session.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = getSessionById(id);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ questions: getQuestionsBySession(id) });
}
