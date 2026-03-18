import { NextResponse } from 'next/server';
import { users, getSubscriptionStats } from '@/lib/users';
import { courses } from '@/lib/courses';
import { getAllEnrollments } from '@/lib/enrollment-store';
import { getAllPayments } from '@/lib/payment-store';

/**
 * GET /api/admin/stats
 * Returns aggregate stats for the admin dashboard, including subscription metrics.
 */
export async function GET() {
  const enrollments = getAllEnrollments();
  const payments = getAllPayments();
  const subscriptionStats = getSubscriptionStats();
  const totalRevenueCents = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amountCents, 0);

  return NextResponse.json({
    totalUsers: users.length,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    publishedCourses: courses.filter((c) => c.published).length,
    totalStudents: users.filter((u) => u.role === 'student').length,
    totalInstructors: users.filter((u) => u.role === 'instructor').length,
    // Subscription & revenue metrics (FLU-224)
    totalRevenueCents,
    mrrCents: subscriptionStats.mrrCents,
    proSubscribers: subscriptionStats.proCount,
    freeUsers: subscriptionStats.freeCount,
    churnRate: subscriptionStats.churnRate,
  });
}
