/**
 * Lesson reminder notification service.
 * FLU-268: PWA push notifications
 *
 * Checks for upcoming live sessions and sends push notifications
 * to enrolled students. Designed to be called periodically (e.g., every 5 minutes).
 */

import { getUpcomingSessions } from './live-session-store';
import { getCourseById } from './courses';
import { getEnrollmentsByCourse } from './enrollment-store';
import { sendPushToUser } from './push-service';

// Track which sessions we've already sent reminders for to avoid duplicates
const sentReminders = new Set<string>();

/**
 * Check for upcoming lessons and send push reminders to enrolled students.
 * Sends notifications for sessions starting within the next 30 minutes.
 * Each session only triggers reminders once.
 *
 * Returns the number of notifications sent.
 */
export async function checkAndSendLessonReminders(): Promise<number> {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  const upcoming = getUpcomingSessions();

  let totalSent = 0;

  for (const session of upcoming) {
    const startTime = new Date(session.scheduledAt).getTime();
    const timeUntilStart = startTime - now;

    // Only sessions starting within 30 minutes that we haven't reminded about
    if (timeUntilStart <= 0 || timeUntilStart > thirtyMinutes) continue;
    if (sentReminders.has(session.id)) continue;

    sentReminders.add(session.id);

    const course = getCourseById(session.courseId);
    if (!course) continue;

    const minutesUntilStart = Math.round(timeUntilStart / 60000);
    const enrollments = getEnrollmentsByCourse(session.courseId);

    // Send notification to each enrolled student
    const results = await Promise.allSettled(
      enrollments.map((enrollment) =>
        sendPushToUser(enrollment.studentId, {
          title: session.title,
          body: `${course.instructor} — Starting in ${minutesUntilStart} minute${minutesUntilStart === 1 ? '' : 's'}`,
          url: `/student/courses/${course.id}`,
          icon: '/images/icon-192.png',
        })
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        totalSent += result.value;
      }
    }
  }

  // Clean up old reminders (sessions that started more than 1 hour ago)
  const oneHourAgo = now - 60 * 60 * 1000;
  const allSessions = getUpcomingSessions();
  const activeIds = new Set(allSessions.map((s) => s.id));
  for (const id of sentReminders) {
    if (!activeIds.has(id)) {
      sentReminders.delete(id);
    }
  }

  return totalSent;
}
