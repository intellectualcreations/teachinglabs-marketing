import { NextResponse } from 'next/server';
import { getAttemptById, getQuizById } from '@/lib/quiz-store';
import { getRubricByAssignmentId } from '@/lib/rubric-store';
import { gradeWithAI } from '@/lib/ai-grading-service';
import {
  createSuggestion,
  getSuggestionBySubmissionId,
  getSuggestionsByAssignment,
} from '@/lib/grading-suggestions-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/assignments/[id]/ai-grade
 * Generates an AI grading suggestion for a specific submission.
 * Body: { submissionId: string }
 * Returns: { suggestedScore, feedback, rubricAnalysis }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: assignmentId } = await params;

  let body: { submissionId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.submissionId) {
    return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
  }

  // Check for existing suggestion
  const existing = getSuggestionBySubmissionId(body.submissionId);
  if (existing) {
    return NextResponse.json({
      suggestedScore: existing.suggestedScore,
      feedback: existing.feedback,
      rubricAnalysis: existing.rubricAnalysis,
      improvementSuggestions: existing.improvementSuggestions,
      isMock: existing.isMock,
      suggestionId: existing.id,
      cached: true,
    });
  }

  const attempt = getAttemptById(body.submissionId);
  if (!attempt) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  if (attempt.quizId !== assignmentId) {
    return NextResponse.json(
      { error: 'Submission does not belong to this assignment' },
      { status: 400 },
    );
  }

  const quiz = getQuizById(attempt.quizId);
  if (!quiz) {
    return NextResponse.json({ error: 'Assignment/quiz not found' }, { status: 404 });
  }

  const rubric = getRubricByAssignmentId(assignmentId);
  if (!rubric) {
    return NextResponse.json(
      { error: 'No rubric configured for this assignment. Create a rubric first.' },
      { status: 400 },
    );
  }

  // Build answer text from attempt
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

    const rubricAnalysis = aiResult.criteriaScores.map((cs) => ({
      criterionName: cs.name,
      score: cs.score,
      maxScore: cs.maxScore,
      weight: cs.weight,
      feedback: cs.feedback,
    }));

    const suggestion = createSuggestion({
      submissionId: body.submissionId,
      assignmentId,
      studentId: attempt.studentId,
      suggestedScore: aiResult.score,
      feedback: aiResult.feedback,
      rubricAnalysis,
      improvementSuggestions: aiResult.improvementSuggestions,
      isMock: aiResult.isMock,
    });

    return NextResponse.json({
      suggestedScore: suggestion.suggestedScore,
      feedback: suggestion.feedback,
      rubricAnalysis: suggestion.rubricAnalysis,
      improvementSuggestions: suggestion.improvementSuggestions,
      isMock: suggestion.isMock,
      suggestionId: suggestion.id,
      cached: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI grading failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/assignments/[id]/ai-grade
 * Returns all AI grading suggestions for this assignment.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id: assignmentId } = await params;

  // Verify assignment exists
  const quiz = getQuizById(assignmentId);
  if (!quiz) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }

  const suggestions = getSuggestionsByAssignment(assignmentId);

  return NextResponse.json({
    assignmentId,
    suggestions: suggestions.map((s) => ({
      suggestionId: s.id,
      submissionId: s.submissionId,
      studentId: s.studentId,
      suggestedScore: s.suggestedScore,
      feedback: s.feedback,
      rubricAnalysis: s.rubricAnalysis,
      isMock: s.isMock,
      accepted: s.accepted,
      createdAt: s.createdAt,
    })),
    total: suggestions.length,
  });
}
