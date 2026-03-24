import { NextResponse } from 'next/server';
import { submitAssignmentForReview } from '@/lib/peer-review-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/assignments/[id]/peer-review-submit
 * Marks an assignment as submitted for peer review.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
  }

  try {
    submitAssignmentForReview(id);
    return NextResponse.json({ success: true, assignment_id: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit assignment for review';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
