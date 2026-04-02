import { NextResponse } from 'next/server';
import { getAttemptById, getQuizById } from '@/lib/quiz-store';
import { getRubricByAssignmentId } from '@/lib/rubric-store';
import {
  createPendingGradeSubmission,
  updateWithAIGrade,
} from '@/lib/grade-submission-store';
import { gradeWithAI } from '@/lib/ai-grading-service';

/**
 * POST /api/ai/grade
 * Internal endpoint: accepts submissionId, runs AI grading, stores result.
 */
export async function POST(request: Request) {
  let body: { submissionId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.submissionId) {
    return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
  }

  const attempt = getAttemptById(body.submissionId);
  if (!attempt) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  const quiz = getQuizById(attempt.quizId);
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  const rubric = getRubricByAssignmentId(attempt.quizId);
  if (!rubric) {
    return NextResponse.json(
      { error: 'No rubric configured for this assignment' },
      { status: 400 },
    );
  }

  // Create or get pending grade submission
  const gradeSubmission = createPendingGradeSubmission(
    body.submissionId,
    attempt.studentId,
    attempt.quizId,
  );

  if (gradeSubmission.status !== 'PENDING') {
    return NextResponse.json({ gradeSubmission, message: 'Already graded' });
  }

  // Build answer text
  const answerText = attempt.answers
    .map((a) => {
      const question = quiz.questions.find((q) => q.id === a.questionId);
      const questionText = question?.text || a.questionId;
      const answerValue =
        typeof a.answer === 'number' && question?.options
          ? question.options[a.answer] || `Option ${a.answer}`
          : String(a.answer);
      return `Q: ${questionText}\nA: ${answerValue}`;
    })
    .join('\n\n');

  const questionText = quiz.questions.map((q) => q.text).join('\n');

  try {
    const aiResult = await gradeWithAI(rubric.criteria, answerText, questionText);

    const updated = updateWithAIGrade(
      body.submissionId,
      aiResult.score,
      aiResult.criteriaScores,
      aiResult.feedback,
      aiResult.improvementSuggestions,
    );

    return NextResponse.json({
      gradeSubmission: updated,
      isMock: aiResult.isMock,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI grading failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
