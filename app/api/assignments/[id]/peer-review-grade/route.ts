import { NextResponse } from 'next/server';
import { createPeerReview } from '@/lib/peer-review-store';
import { getCurrentUser } from '@/lib/users';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PeerReviewGradeBody {
  rubric_scores: Record<string, number>;
  feedback: string;
}

/**
 * POST /api/assignments/[id]/peer-review-grade
 * Creates a peer review grade for an assignment.
 * Body: { rubric_scores: Record<string, number>, feedback: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: PeerReviewGradeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.rubric_scores || typeof body.rubric_scores !== 'object') {
    return NextResponse.json({ error: 'rubric_scores is required' }, { status: 400 });
  }

  if (!body.feedback || typeof body.feedback !== 'string') {
    return NextResponse.json({ error: 'feedback is required' }, { status: 400 });
  }

  const reviewer = getCurrentUser();

  try {
    const review = createPeerReview(id, reviewer.id, body.rubric_scores, body.feedback);
    return NextResponse.json({
      success: true,
      grade: review.grade,
      peer_review_id: review.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create peer review';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
