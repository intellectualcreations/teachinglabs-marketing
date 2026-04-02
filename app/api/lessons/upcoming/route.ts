/**
 * Upcoming lessons endpoint.
 * FLU-268: PWA push notifications / lesson reminders
 *
 * GET /api/lessons/upcoming — returns live sessions starting within the next 30 minutes.
 * Accepts optional ?courseId to filter by course.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingSessions } from '@/lib/live-session-store';
import { getCourseById } from '@/lib/courses';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const courseId = req.nextUrl.searchParams.get('courseId') || undefined;
  const upcoming = getUpcomingSessions(courseId);

  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;

  // Filter to only sessions starting within the next 30 minutes
  const startingSoon = upcoming.filter((session) => {
    const startTime = new Date(session.scheduledAt).getTime();
    const timeUntilStart = startTime - now;
    return timeUntilStart > 0 && timeUntilStart <= thirtyMinutes;
  });

  const enriched = startingSoon.map((session) => {
    const course = getCourseById(session.courseId);
    const minutesUntilStart = Math.round(
      (new Date(session.scheduledAt).getTime() - now) / 60000
    );
    return {
      ...session,
      courseTitle: course?.title || 'Unknown Course',
      instructor: course?.instructor || 'Unknown Instructor',
      minutesUntilStart,
    };
  });

  return NextResponse.json({ lessons: enriched });
}
