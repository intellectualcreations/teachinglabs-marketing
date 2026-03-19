/**
 * FLU-242: Instructor payout tracking.
 *
 * In-memory store for instructor payouts. Tracks pending earnings,
 * paid amounts, and payout history with admin mark-paid support.
 */

import { getAllPayments, type PaymentRecord } from './payment-store';
import { getCourseById } from './courses';
import { getInstructorByName, getAllInstructors } from './users';

export type PayoutStatus = 'pending' | 'paid' | 'processing';

export interface PayoutRecord {
  id: string;
  instructorId: string;
  amountCents: number;
  status: PayoutStatus;
  periodStart: string; // ISO date
  periodEnd: string;
  paidAt?: string;
  note?: string;
  createdAt: string;
}

// In-memory store
const payouts = new Map<string, PayoutRecord>();
let nextId = 1;

function generateId(): string {
  return `payout_${nextId++}`;
}

// Seed demo payouts
function seed() {
  const demoPayouts: Omit<PayoutRecord, 'id'>[] = [
    {
      instructorId: 'instructor-park',
      amountCents: 12500,
      status: 'paid',
      periodStart: '2026-01-01T00:00:00Z',
      periodEnd: '2026-01-31T23:59:59Z',
      paidAt: '2026-02-05T10:00:00Z',
      note: 'January earnings',
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      instructorId: 'instructor-park',
      amountCents: 18900,
      status: 'paid',
      periodStart: '2026-02-01T00:00:00Z',
      periodEnd: '2026-02-28T23:59:59Z',
      paidAt: '2026-03-05T10:00:00Z',
      note: 'February earnings',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      instructorId: 'instructor-park',
      amountCents: 9450,
      status: 'pending',
      periodStart: '2026-03-01T00:00:00Z',
      periodEnd: '2026-03-18T23:59:59Z',
      note: 'March earnings (partial)',
      createdAt: '2026-03-15T00:00:00Z',
    },
    {
      instructorId: 'instructor-torres',
      amountCents: 7500,
      status: 'paid',
      periodStart: '2026-02-01T00:00:00Z',
      periodEnd: '2026-02-28T23:59:59Z',
      paidAt: '2026-03-05T10:00:00Z',
      note: 'February earnings',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      instructorId: 'instructor-torres',
      amountCents: 4200,
      status: 'pending',
      periodStart: '2026-03-01T00:00:00Z',
      periodEnd: '2026-03-18T23:59:59Z',
      note: 'March earnings (partial)',
      createdAt: '2026-03-15T00:00:00Z',
    },
  ];

  for (const p of demoPayouts) {
    const id = generateId();
    payouts.set(id, { id, ...p });
  }
}

seed();

// ── Queries ────────────────────────────────────────────

export function getPayoutsByInstructor(instructorId: string): PayoutRecord[] {
  return Array.from(payouts.values())
    .filter((p) => p.instructorId === instructorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPayoutById(id: string): PayoutRecord | undefined {
  return payouts.get(id);
}

export function getAllPayouts(): PayoutRecord[] {
  return Array.from(payouts.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ── Mutations ──────────────────────────────────────────

export function markPayoutPaid(
  payoutId: string,
  note?: string,
): PayoutRecord | undefined {
  const payout = payouts.get(payoutId);
  if (!payout) return undefined;
  if (payout.status === 'paid') return payout; // Already paid

  payout.status = 'paid';
  payout.paidAt = new Date().toISOString();
  if (note) payout.note = note;

  return payout;
}

export function createPayout(
  instructorId: string,
  amountCents: number,
  periodStart: string,
  periodEnd: string,
  note?: string,
): PayoutRecord {
  const id = generateId();
  const record: PayoutRecord = {
    id,
    instructorId,
    amountCents,
    status: 'pending',
    periodStart,
    periodEnd,
    note,
    createdAt: new Date().toISOString(),
  };
  payouts.set(id, record);
  return record;
}

// ── Aggregations ───────────────────────────────────────

export interface PayoutSummary {
  instructorId: string;
  totalEarnedCents: number;
  totalPaidCents: number;
  pendingCents: number;
  payoutCount: number;
}

export function getPayoutSummary(instructorId: string): PayoutSummary {
  const instructorPayouts = getPayoutsByInstructor(instructorId);
  const totalPaidCents = instructorPayouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountCents, 0);
  const pendingCents = instructorPayouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amountCents, 0);

  return {
    instructorId,
    totalEarnedCents: totalPaidCents + pendingCents,
    totalPaidCents,
    pendingCents,
    payoutCount: instructorPayouts.length,
  };
}
