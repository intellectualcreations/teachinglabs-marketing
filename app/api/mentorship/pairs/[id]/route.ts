import { NextResponse } from 'next/server';
import { getPairById, endPair } from '@/lib/mentorship-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/mentorship/pairs/:id
 * End an active mentorship pair.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const pair = getPairById(id);
  if (!pair) {
    return NextResponse.json({ error: 'Pair not found' }, { status: 404 });
  }

  if (!pair.active) {
    return NextResponse.json({ error: 'Pair is already ended' }, { status: 409 });
  }

  const ended = endPair(id);

  return NextResponse.json({ pair: ended });
}
