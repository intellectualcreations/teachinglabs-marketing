import { NextResponse } from 'next/server';
import { getAttemptById, getQuizById } from '@/lib/quiz-store';
import { getRubricByAssignmentId } from '@/lib/rubric-store';
import {
  getGradeSubmissionBySubmissionId,
  createPendingGradeSubmission,
  updateWithAIGrade,
} from '@/lib/grade-submission-store';
import { gradeWithAI } from '@/lib/ai-grading-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/submissions/[id]/grade
 * Trigger AI grading for a submission.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const { id: submissionId } = await params;

  const attempt = getAttemptById(submissionId);
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
      { error: 'No rubric configured for this assignment. Create a rubric first.' },
      { status: 400 },
    );
  }

  // Create pending grade submission if it doesn't exist
  const gradeSubmission = createPendingGradeSubmission(
    submissionId,
    attempt.studentId,
    attempt.quizId,
  );

  // If already graded, return existing
  if (gradeSubmission.status !== 'PENDING') {
    return NextResponse.json({ gradeSubmission });
  }

  // Build student answer text from attempt answers
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
      submissionId,
      aiResult.score,
      aiResult.criteriaScores,
      aiResult.feedback,
      aiResult.improvementSuggestions,
    );

    return NextResponse.json({ gradeSubmission: updated, isMock: aiResult.isMock });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI grading failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/submissions/[id]/grade
 * Get the grade result for a submission (student view).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id: submissionId } = await params;

  const gradeSubmission = getGradeSubmissionBySubmissionId(submissionId);
  if (!gradeSubmission) {
    return NextResponse.json({ error: 'No grade found for this submission' }, { status: 404 });
  }

  return NextResponse.json({ gradeSubmission });
}
