import { NextResponse } from 'next/server';
import {
  getGradeSubmissionBySubmissionId,
  overrideGrade,
  approveGrade,
} from '@/lib/grade-submission-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/submissions/[id]/grade/override
 * Instructor overrides or approves an AI grade.
 * Body: { action: 'override' | 'approve', score?: number, notes?: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: submissionId } = await params;

  let body: { action: 'override' | 'approve'; score?: number; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existing = getGradeSubmissionBySubmissionId(submissionId);
  if (!existing) {
    return NextResponse.json({ error: 'No grade submission found' }, { status: 404 });
  }

  if (existing.status === 'PENDING') {
    return NextResponse.json(
      { error: 'Cannot override a submission that has not been graded yet' },
      { status: 400 },
    );
  }

  try {
    if (body.action === 'approve') {
      const updated = approveGrade(submissionId);
      return NextResponse.json({ gradeSubmission: updated });
    }

    if (body.action === 'override') {
      if (typeof body.score !== 'number') {
        return NextResponse.json({ error: 'score is required for override' }, { status: 400 });
      }
      const updated = overrideGrade(submissionId, body.score, body.notes || '');
      return NextResponse.json({ gradeSubmission: updated });
    }

    return NextResponse.json({ error: 'action must be "override" or "approve"' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Override failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
