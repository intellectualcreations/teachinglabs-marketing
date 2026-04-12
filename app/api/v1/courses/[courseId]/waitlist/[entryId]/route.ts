import { NextResponse } from 'next/server';
import { removeFromWaitlist } from '@/lib/waitlist-store';

interface RouteParams {
  params: Promise<{ courseId: string; entryId: string }>;
}

/**
 * DELETE /api/v1/courses/:courseId/waitlist/:entryId
 * Remove a student from the waitlist.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { entryId } = await params;

  try {
    const removed = removeFromWaitlist(entryId);
    return NextResponse.json({
      message: 'Removed from waitlist',
      entry: removed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
