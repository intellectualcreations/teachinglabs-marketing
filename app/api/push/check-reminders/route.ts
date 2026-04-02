/**
 * Lesson reminder check endpoint.
 * FLU-268: PWA push notifications
 *
 * GET /api/push/check-reminders — checks for upcoming lessons and sends push reminders.
 * Designed to be called by a cron job or Vercel Cron every 5 minutes.
 *
 * In production, secure this endpoint with a cron secret or auth check.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAndSendLessonReminders } from '@/lib/lesson-reminders';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const sent = await checkAndSendLessonReminders();

  return NextResponse.json({
    success: true,
    notificationsSent: sent,
    checkedAt: new Date().toISOString(),
  });
}
