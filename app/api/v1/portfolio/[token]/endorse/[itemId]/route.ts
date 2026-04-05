import { NextRequest, NextResponse } from 'next/server';
import { getByToken, addEndorsement } from '@/lib/portfolio-store';

/** POST /api/v1/portfolio/:token/endorse/:itemId — add endorsement */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> },
) {
  const { token, itemId } = await params;

  // Verify token is valid
  const items = getByToken(token);
  if (!items) {
    return NextResponse.json({ error: 'invalid or expired token' }, { status: 404 });
  }

  const body = await req.json();
  const { instructorId, comment } = body ?? {};

  if (!instructorId || !comment) {
    return NextResponse.json(
      { error: 'instructorId and comment are required' },
      { status: 400 },
    );
  }

  // Find the item's studentId from the token's items
  const targetItem = items.find((i) => i.id === itemId);
  if (!targetItem) {
    return NextResponse.json({ error: 'item not found' }, { status: 404 });
  }

  const endorsement = addEndorsement(
    targetItem.studentId,
    itemId,
    instructorId,
    comment,
  );

  if (!endorsement) {
    return NextResponse.json({ error: 'item not found' }, { status: 404 });
  }

  return NextResponse.json(endorsement, { status: 201 });
}
