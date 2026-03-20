import { NextResponse } from 'next/server';
import { getPendingReviewSubmissions, getAllGradeSubmissions } from '@/lib/grade-submission-store';
import { getAttemptById, getQuizById } from '@/lib/quiz-store';
import { getUserById } from '@/lib/users';
import { getRubricByAssignmentId } from '@/lib/rubric-store';

/**
 * GET /api/instructor/grading-queue
 * Returns submissions pending instructor review (AI-graded but not yet reviewed/overridden).
 * Also returns all AI grade submissions for the full picture.
 */
export async function GET() {
  const pendingReview = getPendingReviewSubmissions();
  const allSubmissions = getAllGradeSubmissions();

  const enrichSubmission = (gs: typeof allSubmissions[0]) => {
    const attempt = getAttemptById(gs.submissionId);
    const quiz = attempt ? getQuizById(attempt.quizId) : undefined;
    const student = getUserById(gs.studentId);
    const rubric = getRubricByAssignmentId(gs.assignmentId);

    return {
      ...gs,
      studentName: student?.name || 'Unknown Student',
      quizTitle: quiz?.title || 'Unknown Quiz',
      rubricCriteria: rubric?.criteria || [],
      answers: attempt?.answers || [],
      autoScore: attempt?.score ?? null,
    };
  };

  return NextResponse.json({
    pendingReview: pendingReview.map(enrichSubmission),
    all: allSubmissions.map(enrichSubmission),
  });
}
