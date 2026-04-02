import { NextResponse } from 'next/server';
import { getSubmission, gradeSubmission } from '@/lib/submission-store';

interface RouteParams {
  params: Promise<{ id: string; submissionId: string }>;
}

/**
 * GET /api/assignments/[id]/submissions/[submissionId]
 * Returns a single submission.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { submissionId } = await params;

  const submission = getSubmission(submissionId);
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  return NextResponse.json({ submission });
}

/**
 * PATCH /api/assignments/[id]/submissions/[submissionId]
 * Grades a submission (instructor only). Accepts { grade, feedback }.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { submissionId } = await params;

  const body = await request.json();
  const { grade, feedback } = body;

  if (grade === undefined || feedback === undefined) {
    return NextResponse.json(
      { error: 'grade and feedback are required' },
      { status: 400 },
    );
  }

  const submission = gradeSubmission(submissionId, grade, feedback);
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  return NextResponse.json({ submission });
}
