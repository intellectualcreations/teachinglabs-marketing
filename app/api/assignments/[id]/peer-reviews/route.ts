import { NextResponse } from 'next/server';
import { getPeerReviewsByAssignment } from '@/lib/peer-review-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assignments/[id]/peer-reviews
 * Returns all peer reviews for a given assignment, ordered by created_at desc.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const reviews = getPeerReviewsByAssignment(id);

  return NextResponse.json({ reviews });
}
