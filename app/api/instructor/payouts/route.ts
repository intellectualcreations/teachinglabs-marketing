import { NextRequest, NextResponse } from 'next/server';
import { getInstructorById, getCurrentUser } from '@/lib/users';
import {
  getPayoutsByInstructor,
  getPayoutSummary,
} from '@/lib/payout-store';

/**
 * GET /api/instructor/payouts?instructorId=xxx
 * Returns payout history and summary for an instructor.
 * FLU-242: Instructor revenue analytics.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('instructorId');

  const user = instructorId
    ? getInstructorById(instructorId)
    : getCurrentUser('instructor');

  if (!user || user.role !== 'instructor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const payouts = getPayoutsByInstructor(user.id);
  const summary = getPayoutSummary(user.id);

  return NextResponse.json({
    instructor: { id: user.id, name: user.name },
    summary: {
      totalEarned: summary.totalEarnedCents,
      totalPaid: summary.totalPaidCents,
      pending: summary.pendingCents,
      payoutCount: summary.payoutCount,
    },
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: p.amountCents,
      status: p.status,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      paidAt: p.paidAt || null,
      note: p.note || null,
      createdAt: p.createdAt,
    })),
  });
}
