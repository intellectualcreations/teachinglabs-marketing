import { users, getUserById, getAllStudents, getAllInstructors } from '@/lib/users';
import { getEnrollments, getEnrollmentsByCourse, getAllEnrollments } from '@/lib/enrollment-store';
import { getCompletedLessons } from '@/lib/lesson-store';
import { getAllAttempts } from '@/lib/quiz-store';
import { getStudentAnalytics, getInstructorAnalytics } from '@/lib/analytics-store';
import { getAllPayments } from '@/lib/payment-store';
import { getCourseById } from '@/lib/courses';
import { getPreferences, validateUnsubscribeToken } from '@/lib/user-preferences-store';
import { sendDigestEmail } from '@/lib/email-service';

// ── Types ──────────────────────────────────────────────

interface DigestEmail {
  to: string;
  subject: string;
  body: string;
}

// ── Student digest ─────────────────────────────────────

export function generateStudentDigest(studentId: string): DigestEmail | null {
  const student = getUserById(studentId);
  if (!student) return null;

  const prefs = getPreferences(studentId);
  const enrollments = getEnrollments(studentId);
  const analytics = getStudentAnalytics(studentId);

  // Courses enrolled
  const courseList = enrollments
    .map((e) => {
      const course = getCourseById(e.courseId);
      return course ? `  • ${course.title} (${e.progress}% complete)` : null;
    })
    .filter(Boolean)
    .join('\n');

  // Quiz scores this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentScores = analytics.quizScoreTrends
    .filter((q) => q.takenAt >= oneWeekAgo)
    .map((q) => `  • ${q.quizTitle}: ${q.score}%`)
    .join('\n');

  // Learning streak
  const streak = analytics.learningStreak;

  const body = [
    `Hi ${student.name},`,
    '',
    `Here's your weekly learning digest from TeachingLabs.`,
    '',
    '📚 Your Courses:',
    courseList || '  No courses yet — browse our catalog!',
    '',
    '📝 Quiz Scores This Week:',
    recentScores || '  No quizzes taken this week.',
    '',
    `🔥 Learning Streak: ${streak} day${streak !== 1 ? 's' : ''}`,
    '',
    'Keep up the great work!',
    '',
    '— The TeachingLabs Team',
    '',
    `Unsubscribe: /api/digest/unsubscribe?token=${prefs.unsubscribeToken}`,
  ].join('\n');

  return {
    to: student.email,
    subject: `Your Weekly Learning Digest — TeachingLabs`,
    body,
  };
}

// ── Instructor digest ──────────────────────────────────

export function generateInstructorDigest(instructorId: string): DigestEmail | null {
  const instructor = getUserById(instructorId);
  if (!instructor) return null;

  const prefs = getPreferences(instructorId);
  const analytics = getInstructorAnalytics(instructorId);

  // New enrollments summary
  const enrollmentSummary = analytics.completionRates
    .map((cr) => `  • ${cr.courseTitle}: ${cr.totalEnrolled} students (${cr.rate}% completion)`)
    .join('\n');

  // Revenue summary
  const totalRevenue = (analytics.totalRevenueCents / 100).toFixed(2);
  const revenueByCourse = analytics.revenuePerCourse
    .filter((r) => r.totalCents > 0)
    .map((r) => `  • ${r.courseTitle}: $${(r.totalCents / 100).toFixed(2)}`)
    .join('\n');

  // Recent quiz submissions
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const allAttempts = getAllAttempts();
  const recentSubmissions = allAttempts.filter((a) => a.takenAt >= oneWeekAgo).length;

  const body = [
    `Hi ${instructor.name},`,
    '',
    `Here's your weekly instructor digest from TeachingLabs.`,
    '',
    '👥 Course Enrollments:',
    enrollmentSummary || '  No enrollments yet.',
    '',
    `📝 Quiz Submissions This Week: ${recentSubmissions}`,
    '',
    '💰 Revenue Summary:',
    `  Total: $${totalRevenue}`,
    revenueByCourse || '  No revenue yet.',
    '',
    'Keep inspiring your students!',
    '',
    '— The TeachingLabs Team',
    '',
    `Unsubscribe: /api/digest/unsubscribe?token=${prefs.unsubscribeToken}`,
  ].join('\n');

  return {
    to: instructor.email,
    subject: `Your Weekly Instructor Digest — TeachingLabs`,
    body,
  };
}

// ── Send all digests ───────────────────────────────────

export function sendAllDigests(): { sent: number; skipped: number } {
  let sent = 0;
  let skipped = 0;

  // Student digests
  for (const student of getAllStudents()) {
    const prefs = getPreferences(student.id);
    if (!prefs.emailDigest || prefs.digestFrequency === 'never') {
      skipped++;
      continue;
    }
    const digest = generateStudentDigest(student.id);
    if (digest) {
      sendDigestEmail(digest);
      sent++;
    }
  }

  // Instructor digests
  for (const instructor of getAllInstructors()) {
    const prefs = getPreferences(instructor.id);
    if (!prefs.emailDigest || prefs.digestFrequency === 'never') {
      skipped++;
      continue;
    }
    const digest = generateInstructorDigest(instructor.id);
    if (digest) {
      sendDigestEmail(digest);
      sent++;
    }
  }

  return { sent, skipped };
}
