import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { answerQuestion } from '@/lib/office-hours-store';

interface RouteParams {
  params: Promise<{ id: string; qid: string }>;
}

/**
 * PATCH /api/office-hours/:id/questions/:qid
 * Mark a question as answered.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { qid } = await params;
  const user = getCurrentUser('instructor');

  if (user.role !== 'instructor') {
    return NextResponse.json(
      { error: 'Only instructors can answer questions' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { answer } = body as { answer?: string };

  if (!answer || !answer.trim()) {
    return NextResponse.json({ error: 'answer is required' }, { status: 400 });
  }

  const updated = answerQuestion(qid, answer.trim());

  if (!updated) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  return NextResponse.json({ question: updated });
}
