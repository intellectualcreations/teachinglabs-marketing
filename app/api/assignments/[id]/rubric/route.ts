import { NextResponse } from 'next/server';
import { getRubricByAssignmentId, createOrUpdateRubric } from '@/lib/rubric-store';
import type { RubricCriterion } from '@/lib/rubric-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assignments/[id]/rubric
 * Returns the rubric for an assignment (quiz).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const rubric = getRubricByAssignmentId(id);
  if (!rubric) {
    return NextResponse.json({ error: 'No rubric found for this assignment' }, { status: 404 });
  }

  return NextResponse.json({ rubric });
}

/**
 * POST /api/assignments/[id]/rubric
 * Create or update a rubric for an assignment.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: { criteria: RubricCriterion[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(body.criteria) || body.criteria.length === 0) {
    return NextResponse.json({ error: 'criteria array is required' }, { status: 400 });
  }

  // Validate each criterion
  for (const c of body.criteria) {
    if (!c.name || typeof c.maxPoints !== 'number') {
      return NextResponse.json(
        { error: 'Each criterion must have name and maxPoints' },
        { status: 400 },
      );
    }
  }

  try {
    const rubric = createOrUpdateRubric(id, `Rubric for ${id}`, body.criteria);
    return NextResponse.json({ rubric });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create rubric';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
