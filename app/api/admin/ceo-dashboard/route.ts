import { NextRequest, NextResponse } from 'next/server'
import { getAdminAnalytics } from '@/lib/analytics-store'
import { users } from '@/lib/users'
import { getAllFeedback, getFeedbackStats } from '@/lib/feedback-store'
import { getTokenUsageStats } from '@/lib/token-usage-store'
import { getSessionStats } from '@/lib/session-tracking-store'

/**
 * GET /api/admin/ceo-dashboard
 * Returns combined data for the CEO dashboard.
 * Demo: no auth check (demo mode).
 */
export async function GET(_request: NextRequest) {
  const analytics = getAdminAnalytics()
  const feedbackStats = getFeedbackStats()
  const feedback = getAllFeedback()
  const tokenStats = getTokenUsageStats()
  const sessionStats = getSessionStats()

  // Calculate signup growth
  const totalUsers = users.length
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // Feature requests (filtered from feedback)
  const featureRequests = feedback
    .filter((f) => f.type === 'feature')
    .map((f) => ({
      id: f.id,
      subject: f.subject,
      message: f.message,
      userName: f.userName,
      userRole: f.userRole,
      status: f.status,
      createdAt: f.createdAt,
      votes: Math.floor(Math.random() * 25) + 1, // Simulated votes
    }))
    .sort((a, b) => b.votes - a.votes)

  return NextResponse.json({
    signups: {
      totalUsers,
      totalStudents: analytics.totalStudents,
      totalInstructors: analytics.totalInstructors,
      totalAdmins: analytics.totalAdmins,
      enrollmentsPerDay: analytics.enrollmentsPerDay,
      proSubscribers: analytics.proSubscribers,
      freeUsers: analytics.freeUsers,
      churnRate: analytics.churnRate,
    },
    engagement: {
      ...sessionStats,
      topCourses: analytics.topCoursesByEnrollment,
      totalEnrollments: analytics.totalEnrollments,
    },
    costs: {
      ...tokenStats,
    },
    feedback: {
      stats: feedbackStats,
      recent: feedback.slice(0, 10),
    },
    features: {
      requests: featureRequests,
      totalCount: featureRequests.length,
    },
  })
}
