import { NextRequest, NextResponse } from 'next/server';
import { markPayoutPaid, getPayoutById } from '@/lib/payout-store';

/**
 * POST /api/admin/payouts/[id]/mark-paid
 * Admin marks an instructor payout as paid.
 * FLU-242: Instructor revenue analytics.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const existing = getPayoutById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
  }

  if (existing.status === 'paid') {
    return NextResponse.json(
      { error: 'Already marked as paid', payout: existing },
      { status: 409 },
    );
  }

  let note: string | undefined;
  try {
    const body = await request.json();
    note = body.note;
  } catch {
    // No body is fine
  }

  const updated = markPayoutPaid(id, note);

  return NextResponse.json({
    message: 'Payout marked as paid',
    payout: updated
      ? {
          id: updated.id,
          instructorId: updated.instructorId,
          amount: updated.amountCents,
          status: updated.status,
          paidAt: updated.paidAt,
          note: updated.note,
        }
      : null,
  });
}
