import { getAllCourses, getCourseById, type Course } from './courses';
import { getAllEnrollments, getEnrollments, getEnrollmentsByCourse, type Enrollment } from './enrollment-store';
import { getLessonsByCourse, getCompletedLessons, type LessonCompletion } from './lesson-store';
import { getAllAttempts, getAttempts, type QuizAttempt } from './quiz-store';
import { getAllPayments, type PaymentRecord } from './payment-store';
import { getStudentGrades } from './grade-store';
import { users, getSubscriptionStats } from './users';

// ── Types ──────────────────────────────────────────────

export interface EnrollmentTrend {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface CourseCompletionRate {
  courseId: string;
  courseTitle: string;
  totalEnrolled: number;
  completedCount: number;
  rate: number; // 0-100
}

export interface CourseRevenue {
  courseId: string;
  courseTitle: string;
  totalCents: number;
  enrollments: number;
}

export interface InstructorAnalytics {
  instructorId: string;
  enrollmentTrends: EnrollmentTrend[];
  completionRates: CourseCompletionRate[];
  revenuePerCourse: CourseRevenue[];
  totalStudents: number;
  totalRevenueCents: number;
}

export interface QuizScoreTrend {
  quizId: string;
  quizTitle: string;
  score: number;
  takenAt: string;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface StudentAnalytics {
  studentId: string;
  learningStreak: number; // consecutive days with completions
  quizScoreTrends: QuizScoreTrend[];
  courseProgress: CourseProgress[];
}

export interface AdminAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  mrrCents: number;
  totalEnrollments: number;
  enrollmentsPerDay: EnrollmentTrend[];
  topCoursesByEnrollment: { courseId: string; courseTitle: string; count: number }[];
  // Subscription metrics (FLU-224)
  proSubscribers: number;
  freeUsers: number;
  churnRate: number;
  totalRevenueCents: number;
}

// ── Seed analytics data ────────────────────────────────
// Add spread-out enrollment dates for realistic trends

const analyticsEnrollments: { studentId: string; courseId: string; enrolledAt: string }[] = [];

function seedAnalyticsData() {
  const now = new Date();
  const students = ['demo-student', 'student-emma', 'student-liam', 'student-mia', 'student-noah'];
  const courseIds = ['algebra-1', 'biology', 'creative-writing', 'geometry', 'us-history', 'computer-science', 'pre-calculus', 'physics'];

  // Spread enrollments across last 30 days
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(10, 0, 0, 0);

    // Variable enrollment count per day (1-4)
    const enrollCount = daysAgo % 7 === 0 ? 3 : daysAgo % 3 === 0 ? 2 : 1;

    for (let i = 0; i < enrollCount; i++) {
      const student = students[(daysAgo + i) % students.length];
      const course = courseIds[(daysAgo + i * 3) % courseIds.length];
      analyticsEnrollments.push({
        studentId: student,
        courseId: course,
        enrolledAt: date.toISOString(),
      });
    }
  }
}

seedAnalyticsData();

// Seed quiz score progression (improvement over time)
const analyticsQuizScores: { studentId: string; quizId: string; score: number; takenAt: string }[] = [];

function seedQuizScores() {
  const now = new Date();
  const baseScores = [55, 62, 68, 72, 78, 85, 88, 91, 94];

  for (let i = 0; i < baseScores.length; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (baseScores.length - 1 - i) * 3);

    analyticsQuizScores.push({
      studentId: 'demo-student',
      quizId: `quiz_${(i % 3) + 1}`,
      score: baseScores[i],
      takenAt: date.toISOString(),
    });
  }

  // Also add scores for other students
  const otherStudents = ['student-emma', 'student-liam'];
  for (const sid of otherStudents) {
    for (let i = 0; i < 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (4 - i) * 4);
      analyticsQuizScores.push({
        studentId: sid,
        quizId: `quiz_${(i % 3) + 1}`,
        score: 50 + i * 10 + Math.floor(Math.random() * 5),
        takenAt: date.toISOString(),
      });
    }
  }
}

seedQuizScores();

// Seed lesson completions over time for streak calculation
const analyticsCompletions: { studentId: string; completedAt: string }[] = [];

function seedCompletionDates() {
  const now = new Date();
  // demo-student has a 7-day streak
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(14, 30, 0, 0);
    analyticsCompletions.push({
      studentId: 'demo-student',
      completedAt: date.toISOString(),
    });
  }

  // student-emma has a 3-day streak
  for (let daysAgo = 2; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(16, 0, 0, 0);
    analyticsCompletions.push({
      studentId: 'student-emma',
      completedAt: date.toISOString(),
    });
  }
}

seedCompletionDates();

// Seed payment records for revenue analytics
const analyticsPayments: PaymentRecord[] = [];

function seedPaymentData() {
  const now = new Date();
  const paidCourses = [
    { courseId: 'pre-calculus', price: 2999 },
    { courseId: 'physics', price: 4999 },
    { courseId: 'computer-science', price: 1999 },
  ];
  const students = ['demo-student', 'student-emma', 'student-liam', 'student-mia', 'student-noah'];

  let payId = 100;
  for (let daysAgo = 29; daysAgo >= 0; daysAgo -= 3) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const course = paidCourses[daysAgo % paidCourses.length];
    const student = students[daysAgo % students.length];

    analyticsPayments.push({
      id: `pay_analytics_${payId++}`,
      studentId: student,
      courseId: course.courseId,
      amountCents: course.price,
      status: 'completed',
      createdAt: date.toISOString(),
    });
  }
}

seedPaymentData();

// ── Helper functions ───────────────────────────────────

function getInstructorCourses(instructorId: string): Course[] {
  const user = users.find((u) => u.id === instructorId);
  if (!user || user.role !== 'instructor') return [];
  return getAllCourses().filter((c) => c.instructor === user.name);
}

function getLast30DaysDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function calculateStreak(studentId: string): number {
  // Combine real completions with analytics seed data
  const completionDates = new Set<string>();

  // From analytics seed data
  for (const c of analyticsCompletions) {
    if (c.studentId === studentId) {
      completionDates.add(c.completedAt.slice(0, 10));
    }
  }

  if (completionDates.size === 0) return 0;

  const today = new Date();
  let streak = 0;
  for (let daysAgo = 0; daysAgo < 365; daysAgo++) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().slice(0, 10);
    if (completionDates.has(dateStr)) {
      streak++;
    } else if (daysAgo > 0) {
      // Allow skipping today (might not have completed yet)
      break;
    }
  }

  return streak;
}

// ── Public analytics functions ─────────────────────────

export function getInstructorAnalytics(instructorId: string): InstructorAnalytics {
  const instructorCourses = getInstructorCourses(instructorId);
  const courseIds = new Set(instructorCourses.map((c) => c.id));

  // Enrollment trends (last 30 days)
  const last30 = getLast30DaysDates();
  const allEnrollments = getAllEnrollments();
  const relevantEnrollments = [
    ...allEnrollments.filter((e) => courseIds.has(e.courseId)),
    ...analyticsEnrollments.filter((e) => courseIds.has(e.courseId)),
  ];

  const enrollmentByDate = new Map<string, number>();
  for (const d of last30) enrollmentByDate.set(d, 0);
  for (const e of relevantEnrollments) {
    const date = e.enrolledAt.slice(0, 10);
    if (enrollmentByDate.has(date)) {
      enrollmentByDate.set(date, (enrollmentByDate.get(date) || 0) + 1);
    }
  }
  const enrollmentTrends: EnrollmentTrend[] = last30.map((d) => ({
    date: d,
    count: enrollmentByDate.get(d) || 0,
  }));

  // Completion rates
  const completionRates: CourseCompletionRate[] = instructorCourses.map((course) => {
    const courseEnrollments = allEnrollments.filter((e) => e.courseId === course.id);
    const totalEnrolled = courseEnrollments.length;
    const completedCount = courseEnrollments.filter((e) => e.status === 'completed').length;
    return {
      courseId: course.id,
      courseTitle: course.title,
      totalEnrolled,
      completedCount,
      rate: totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0,
    };
  });

  // Revenue per course
  const allPayments = [...getAllPayments(), ...analyticsPayments];
  const revenuePerCourse: CourseRevenue[] = instructorCourses
    .filter((c) => c.price > 0)
    .map((course) => {
      const coursePayments = allPayments.filter(
        (p) => p.courseId === course.id && p.status === 'completed'
      );
      return {
        courseId: course.id,
        courseTitle: course.title,
        totalCents: coursePayments.reduce((sum, p) => sum + p.amountCents, 0),
        enrollments: coursePayments.length,
      };
    });

  // Add free courses with $0 revenue
  for (const course of instructorCourses.filter((c) => c.price === 0)) {
    revenuePerCourse.push({
      courseId: course.id,
      courseTitle: course.title,
      totalCents: 0,
      enrollments: allEnrollments.filter((e) => e.courseId === course.id).length,
    });
  }

  const uniqueStudents = new Set(relevantEnrollments.map((e) => e.studentId));
  const totalRevenueCents = revenuePerCourse.reduce((sum, r) => sum + r.totalCents, 0);

  return {
    instructorId,
    enrollmentTrends,
    completionRates,
    revenuePerCourse,
    totalStudents: uniqueStudents.size,
    totalRevenueCents,
  };
}

export function getStudentAnalytics(studentId: string): StudentAnalytics {
  const learningStreak = calculateStreak(studentId);

  // Quiz score trends from seed data + real attempts
  const realAttempts = getAllAttempts().filter((a) => a.studentId === studentId);
  const seedScores = analyticsQuizScores.filter((s) => s.studentId === studentId);

  const quizScoreTrends: QuizScoreTrend[] = [
    ...seedScores.map((s) => ({
      quizId: s.quizId,
      quizTitle: `Quiz ${s.quizId.replace('quiz_', '')}`,
      score: s.score,
      takenAt: s.takenAt,
    })),
    ...realAttempts.map((a) => ({
      quizId: a.quizId,
      quizTitle: `Quiz ${a.quizId.replace('quiz_', '')}`,
      score: a.score,
      takenAt: a.takenAt,
    })),
  ].sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());

  // Course progress
  const enrollments = getEnrollments(studentId);
  const courseProgress: CourseProgress[] = enrollments.map((e) => {
    const course = getCourseById(e.courseId);
    const lessons = getLessonsByCourse(e.courseId);
    const completed = getCompletedLessons(studentId, e.courseId);
    const total = lessons.length;
    return {
      courseId: e.courseId,
      courseTitle: course?.title || 'Unknown Course',
      completedLessons: completed.length,
      totalLessons: total,
      percentage: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    };
  });

  return {
    studentId,
    learningStreak,
    quizScoreTrends,
    courseProgress,
  };
}

export function getAdminAnalytics(): AdminAnalytics {
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalInstructors = users.filter((u) => u.role === 'instructor').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  // MRR from all payments in the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const allPayments = [...getAllPayments(), ...analyticsPayments];
  const recentPayments = allPayments.filter(
    (p) => p.status === 'completed' && new Date(p.createdAt) >= thirtyDaysAgo
  );
  const mrrCents = recentPayments.reduce((sum, p) => sum + p.amountCents, 0);

  // Total enrollments
  const allEnrollments = getAllEnrollments();
  const totalEnrollments = allEnrollments.length + analyticsEnrollments.length;

  // Enrollments per day (last 30 days)
  const last30 = getLast30DaysDates();
  const allEnrollmentDates = [
    ...allEnrollments.map((e) => e.enrolledAt),
    ...analyticsEnrollments.map((e) => e.enrolledAt),
  ];

  const enrollmentByDate = new Map<string, number>();
  for (const d of last30) enrollmentByDate.set(d, 0);
  for (const date of allEnrollmentDates) {
    const dateStr = date.slice(0, 10);
    if (enrollmentByDate.has(dateStr)) {
      enrollmentByDate.set(dateStr, (enrollmentByDate.get(dateStr) || 0) + 1);
    }
  }
  const enrollmentsPerDay: EnrollmentTrend[] = last30.map((d) => ({
    date: d,
    count: enrollmentByDate.get(d) || 0,
  }));

  // Top courses by enrollment
  const courseEnrollmentCount = new Map<string, number>();
  for (const e of [...allEnrollments, ...analyticsEnrollments]) {
    const count = courseEnrollmentCount.get(e.courseId) || 0;
    courseEnrollmentCount.set(e.courseId, count + 1);
  }

  const topCoursesByEnrollment = Array.from(courseEnrollmentCount.entries())
    .map(([courseId, count]) => {
      const course = getCourseById(courseId);
      return { courseId, courseTitle: course?.title || courseId, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Subscription metrics (FLU-224)
  const subStats = getSubscriptionStats();
  const totalRevenueCents = allPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amountCents, 0);

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,
    mrrCents: subStats.mrrCents || mrrCents,
    totalEnrollments,
    enrollmentsPerDay,
    topCoursesByEnrollment,
    proSubscribers: subStats.proCount,
    freeUsers: subStats.freeCount,
    churnRate: subStats.churnRate,
    totalRevenueCents,
  };
}

export function getInstructorEarningsCSV(instructorId: string): string {
  const analytics = getInstructorAnalytics(instructorId);

  const rows = [
    ['Course', 'Enrollments', 'Revenue ($)'].join(','),
    ...analytics.revenuePerCourse.map((r) =>
      [`"${r.courseTitle}"`, r.enrollments, (r.totalCents / 100).toFixed(2)].join(',')
    ),
    ['', '', ''],
    ['Total', '', (analytics.totalRevenueCents / 100).toFixed(2)].join(','),
  ];

  return rows.join('\n');
}
