import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { updateSessionStatus } from '@/lib/office-hours-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/office-hours/:id/status
 * Update session status (scheduled → live → ended).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = getCurrentUser('instructor');

  if (user.role !== 'instructor') {
    return NextResponse.json(
      { error: 'Only instructors can update session status' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { status } = body as { status?: string };

  if (!status || !['scheduled', 'live', 'ended'].includes(status)) {
    return NextResponse.json(
      { error: 'status must be one of: scheduled, live, ended' },
      { status: 400 },
    );
  }

  const updated = updateSessionStatus(id, status as 'scheduled' | 'live' | 'ended');

  if (!updated) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ session: updated });
}
