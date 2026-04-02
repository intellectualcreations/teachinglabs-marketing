import { NextResponse } from 'next/server';
import { getSubmissionsForAssignment } from '@/lib/submission-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assignments/[id]/submissions
 * Lists all submissions for an assignment (instructor only).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const submissions = getSubmissionsForAssignment(id);

  return NextResponse.json({ submissions });
}
