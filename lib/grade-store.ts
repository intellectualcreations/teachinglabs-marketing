import {
  getAllAttempts,
  getAttemptById,
  getQuizById,
  type QuizAttempt,
} from './quiz-store';
import { courses } from './courses';
import { getEnrollmentsByCourse } from './enrollment-store';
import { getUserById } from './users';
import { getLessonById } from './lesson-store';

// ── Types ──────────────────────────────────────────────

export interface GradedSubmission {
  submissionId: string; // maps to QuizAttempt.id
  studentId: string;
  quizId: string;
  score: number; // 0-100 instructor-assigned score
  feedback: string;
  gradedAt: string;
  gradedBy: string; // instructor id
}

export interface PendingSubmission {
  submissionId: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  courseId: string;
  courseTitle: string;
  submittedAt: string;
  autoScore: number;
  answers: { questionId: string; answer: number | string }[];
  graded: boolean;
  grade?: GradedSubmission;
}

// ── In-memory store ────────────────────────────────────

const gradedSubmissions: GradedSubmission[] = [];

// ── Helper: get courses owned by instructor ────────────

function getInstructorCourseIds(instructorId: string): string[] {
  const user = getUserById(instructorId);
  if (!user || user.role !== 'instructor') return [];
  return courses.filter((c) => c.instructor === user.name).map((c) => c.id);
}

function getCourseIdForQuiz(quizId: string): string | undefined {
  const quiz = getQuizById(quizId);
  if (!quiz) return undefined;
  const lesson = getLessonById(quiz.lessonId);
  return lesson?.courseId;
}

// ── Query functions ────────────────────────────────────

export function getGradeBySubmissionId(submissionId: string): GradedSubmission | undefined {
  return gradedSubmissions.find((g) => g.submissionId === submissionId);
}

export function getPendingSubmissions(instructorId: string): PendingSubmission[] {
  const courseIds = new Set(getInstructorCourseIds(instructorId));
  if (courseIds.size === 0) return [];

  const allAttempts = getAllAttempts();
  const results: PendingSubmission[] = [];

  for (const attempt of allAttempts) {
    const courseId = getCourseIdForQuiz(attempt.quizId);
    if (!courseId || !courseIds.has(courseId)) continue;

    // Check if student is enrolled in this course
    const enrollments = getEnrollmentsByCourse(courseId);
    const isEnrolled = enrollments.some((e) => e.studentId === attempt.studentId);
    if (!isEnrolled) continue;

    const quiz = getQuizById(attempt.quizId);
    const student = getUserById(attempt.studentId);
    const course = courses.find((c) => c.id === courseId);
    const existingGrade = getGradeBySubmissionId(attempt.id);

    results.push({
      submissionId: attempt.id,
      studentId: attempt.studentId,
      studentName: student?.name || 'Unknown Student',
      quizId: attempt.quizId,
      quizTitle: quiz?.title || 'Unknown Quiz',
      courseId,
      courseTitle: course?.title || 'Unknown Course',
      submittedAt: attempt.takenAt,
      autoScore: attempt.score,
      answers: attempt.answers,
      graded: !!existingGrade,
      grade: existingGrade,
    });
  }

  // Sort: ungraded first, then by submission date (newest first)
  results.sort((a, b) => {
    if (a.graded !== b.graded) return a.graded ? 1 : -1;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  return results;
}

// ── Mutations ──────────────────────────────────────────

export function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string,
  instructorId: string,
): GradedSubmission {
  // Validate the attempt exists
  const attempt = getAttemptById(submissionId);
  if (!attempt) throw new Error(`Submission not found: ${submissionId}`);

  // Validate score range
  if (score < 0 || score > 100) throw new Error('Score must be between 0 and 100');

  // Validate instructor owns the course
  const courseId = getCourseIdForQuiz(attempt.quizId);
  const courseIds = new Set(getInstructorCourseIds(instructorId));
  if (!courseId || !courseIds.has(courseId)) {
    throw new Error('Instructor does not own this course');
  }

  // Check if already graded, update if so
  const existing = gradedSubmissions.find((g) => g.submissionId === submissionId);
  if (existing) {
    existing.score = score;
    existing.feedback = feedback;
    existing.gradedAt = new Date().toISOString();
    existing.gradedBy = instructorId;
    return existing;
  }

  const graded: GradedSubmission = {
    submissionId,
    studentId: attempt.studentId,
    quizId: attempt.quizId,
    score,
    feedback,
    gradedAt: new Date().toISOString(),
    gradedBy: instructorId,
  };

  gradedSubmissions.push(graded);
  return graded;
}

export function getStudentGrades(studentId: string): (GradedSubmission & {
  quizTitle: string;
  courseId: string;
  courseTitle: string;
})[] {
  const studentGrades = gradedSubmissions.filter((g) => g.studentId === studentId);

  return studentGrades.map((g) => {
    const quiz = getQuizById(g.quizId);
    const courseId = getCourseIdForQuiz(g.quizId) || '';
    const course = courses.find((c) => c.id === courseId);

    return {
      ...g,
      quizTitle: quiz?.title || 'Unknown Quiz',
      courseId,
      courseTitle: course?.title || 'Unknown Course',
    };
  });
}

export function getAllGradedSubmissions(): GradedSubmission[] {
  return [...gradedSubmissions];
}

// ── Progress calculation (factors in grades) ───────────

/**
 * Get combined course progress factoring in lesson completions + graded quizzes.
 * Graded quizzes with score >= 70 count as "passed" and contribute to progress.
 * Returns a 0-100 percentage.
 */
export function getCourseProgressWithGrades(
  studentId: string,
  courseId: string,
): { lessonPct: number; quizPct: number; combinedPct: number } {
  // Import dynamically to avoid circular deps at module level
  const { getLessonProgress } = require('./lesson-store');
  const { getLessonsByCourse } = require('./lesson-store');

  const lessonProgress = getLessonProgress(studentId, courseId);
  const courseLessons = getLessonsByCourse(courseId);

  // Find quizzes for this course's lessons
  const allAttempts = getAllAttempts();
  const courseLessonIds = new Set(courseLessons.map((l: { id: string }) => l.id));

  // Get quizzes that belong to lessons in this course
  const courseQuizIds = new Set<string>();
  for (const attempt of allAttempts) {
    const quiz = getQuizById(attempt.quizId);
    if (quiz && courseLessonIds.has(quiz.lessonId)) {
      courseQuizIds.add(quiz.id);
    }
  }

  // Count graded + passed quizzes for this student
  const studentGrades = gradedSubmissions.filter(
    (g) => g.studentId === studentId && courseQuizIds.has(g.quizId) && g.score >= 70,
  );

  const totalQuizzes = courseQuizIds.size;
  const quizPct = totalQuizzes > 0
    ? Math.round((studentGrades.length / totalQuizzes) * 100)
    : 100; // If no quizzes, full credit

  // Weight: 70% lessons, 30% quizzes (if quizzes exist)
  const hasQuizzes = totalQuizzes > 0;
  const combinedPct = hasQuizzes
    ? Math.round(lessonProgress.percentage * 0.7 + quizPct * 0.3)
    : lessonProgress.percentage;

  return {
    lessonPct: lessonProgress.percentage,
    quizPct,
    combinedPct,
  };
}

// ── Seed graded data ───────────────────────────────────
// Grade the demo-student's quiz_1 attempt so there's data on the student grades page

function seedGrades() {
  // Grade demo-student's quiz_1 attempt (attempt_1)
  gradeSubmission(
    'attempt_1',
    95,
    'Excellent work! You clearly understand variables and expressions. Keep it up!',
    'instructor-park',
  );
}

seedGrades();
