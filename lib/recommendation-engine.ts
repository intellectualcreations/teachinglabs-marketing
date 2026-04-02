/**
 * FLU-248: AI-powered course recommendations and adaptive learning.
 *
 * Computes tag-based cosine similarity between courses on first call,
 * then uses student enrollment history, completion status, and quiz
 * scores to recommend the best next courses.
 */

import { courses, getAllCourses, getCourseById, type Course } from './courses';
import { getEnrollments, type Enrollment } from './enrollment-store';
import { getAllAttempts, type QuizAttempt } from './quiz-store';

// ── Config ─────────────────────────────────────────────

/** A/B test: if true, 50% of students get algorithm recs, 50% get curated */
export const AB_TEST_ENABLED = true;

/** Maximum courses to include in similarity matrix */
const MAX_SIMILARITY_COURSES = 50;

/** Quiz score threshold below which we surface remedial/foundational courses */
const WEAK_AREA_THRESHOLD = 60;

/** Number of recommendations to return */
const REC_COUNT = 3;

/** Curated fallback list for A/B test control group / cold start */
const CURATED_COURSE_IDS = ['algebra-1', 'biology', 'creative-writing'];

// ── Similarity Matrix ──────────────────────────────────

/** course id → course id → similarity score (0-1) */
let similarityMatrix: Map<string, Map<string, number>> | null = null;

/** All unique tags across courses (for vector indexing) */
let tagIndex: string[] = [];

function buildTagVector(course: Course): number[] {
  const tagSet = new Set([...course.tags, course.subject.toLowerCase()]);
  return tagIndex.map((t) => (tagSet.has(t) ? 1 : 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function ensureSimilarityMatrix(): void {
  if (similarityMatrix) return;

  const allCourses = getAllCourses().slice(0, MAX_SIMILARITY_COURSES);

  // Build tag index
  const tagSet = new Set<string>();
  for (const c of allCourses) {
    for (const t of c.tags) tagSet.add(t);
    tagSet.add(c.subject.toLowerCase());
  }
  tagIndex = Array.from(tagSet).sort();

  // Build vectors
  const vectors = new Map<string, number[]>();
  for (const c of allCourses) {
    vectors.set(c.id, buildTagVector(c));
  }

  // Compute pairwise similarity
  similarityMatrix = new Map();
  for (const c1 of allCourses) {
    const row = new Map<string, number>();
    const v1 = vectors.get(c1.id)!;
    for (const c2 of allCourses) {
      if (c1.id === c2.id) {
        row.set(c2.id, 1);
      } else {
        row.set(c2.id, cosineSimilarity(v1, vectors.get(c2.id)!));
      }
    }
    similarityMatrix.set(c1.id, row);
  }
}

/** Get courses most similar to the given course, excluding a set of ids */
export function getSimilarCourses(
  courseId: string,
  excludeIds: Set<string>,
  limit: number,
): { courseId: string; similarity: number }[] {
  ensureSimilarityMatrix();
  const row = similarityMatrix!.get(courseId);
  if (!row) return [];

  return Array.from(row.entries())
    .filter(([id]) => id !== courseId && !excludeIds.has(id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, sim]) => ({ courseId: id, similarity: sim }));
}

// ── Weak Area Detection ────────────────────────────────

interface WeakArea {
  subject: string;
  avgScore: number;
  courseIds: string[];
}

function getWeakAreas(studentId: string): WeakArea[] {
  const allAttempts = getAllAttempts().filter(
    (a) => a.studentId === studentId,
  );

  // Group scores by subject (via quiz → course mapping is indirect;
  // use course subject from enrollment context)
  const enrollments = getEnrollments(studentId);
  const courseSubjects = new Map<string, string>();
  for (const e of enrollments) {
    const course = getCourseById(e.courseId);
    if (course) courseSubjects.set(e.courseId, course.subject);
  }

  // Map quiz scores to subjects
  const subjectScores = new Map<string, number[]>();
  for (const attempt of allAttempts) {
    // Find which course this quiz belongs to by checking enrollment context
    for (const [courseId, subject] of courseSubjects) {
      // Simplified: group all attempts by their enrolled subjects
      if (!subjectScores.has(subject)) subjectScores.set(subject, []);
      subjectScores.get(subject)!.push(attempt.score);
      break; // Assign to first matched subject
    }
  }

  const weakAreas: WeakArea[] = [];
  for (const [subject, scores] of subjectScores) {
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    if (avg < WEAK_AREA_THRESHOLD) {
      // Find foundational courses in this subject
      const foundational = getAllCourses()
        .filter(
          (c) =>
            c.subject === subject &&
            c.published &&
            (c.gradeLevel.includes('7') ||
              c.gradeLevel.includes('8') ||
              c.gradeLevel.includes('6')),
        )
        .map((c) => c.id);
      weakAreas.push({ subject, avgScore: avg, courseIds: foundational });
    }
  }

  return weakAreas;
}

// ── A/B Test ───────────────────────────────────────────

/** Deterministic A/B bucket: hash student id to 0 or 1 */
function getABBucket(studentId: string): 'algorithm' | 'curated' {
  if (!AB_TEST_ENABLED) return 'algorithm';
  let hash = 0;
  for (let i = 0; i < studentId.length; i++) {
    hash = (hash * 31 + studentId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? 'algorithm' : 'curated';
}

// ── Main Recommendation Function ───────────────────────

export interface Recommendation {
  courseId: string;
  title: string;
  subject: string;
  reason: string;
  score: number; // internal ranking score
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  bucket: 'algorithm' | 'curated';
  weakAreas: WeakArea[];
  isNewUser: boolean;
}

export function getRecommendations(
  studentId: string,
  count: number = REC_COUNT,
): RecommendationResult {
  ensureSimilarityMatrix();

  const enrollments = getEnrollments(studentId);
  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const completedIds = new Set(
    enrollments.filter((e) => e.status === 'completed').map((e) => e.courseId),
  );
  const isNewUser = enrollments.length === 0;
  const bucket = getABBucket(studentId);
  const weakAreas = getWeakAreas(studentId);

  // Cold start: return top-rated curated courses
  if (isNewUser) {
    const curated = CURATED_COURSE_IDS.map((id) => getCourseById(id))
      .filter((c): c is Course => c !== null && c !== undefined && c.published)
      .slice(0, count)
      .map((c, i) => ({
        courseId: c.id,
        title: c.title,
        subject: c.subject,
        reason: 'Popular with new students',
        score: 1 - i * 0.1,
      }));
    return { recommendations: curated, bucket: 'curated', weakAreas: [], isNewUser: true };
  }

  // Curated bucket (A/B control): return curated list minus enrolled
  if (bucket === 'curated') {
    const curated = getAllCourses()
      .filter((c) => c.published && !enrolledIds.has(c.id))
      .slice(0, count)
      .map((c, i) => ({
        courseId: c.id,
        title: c.title,
        subject: c.subject,
        reason: 'Staff pick',
        score: 1 - i * 0.1,
      }));
    return { recommendations: curated, bucket, weakAreas, isNewUser: false };
  }

  // Algorithm bucket: similarity-based recs
  const candidateScores = new Map<string, { score: number; reason: string }>();

  // 1. Find courses similar to completed/active ones
  for (const enrollment of enrollments) {
    const weight = enrollment.status === 'completed' ? 1.0 : 0.6;
    const similar = getSimilarCourses(enrollment.courseId, enrolledIds, 5);
    for (const s of similar) {
      const existing = candidateScores.get(s.courseId);
      const newScore = s.similarity * weight;
      if (!existing || newScore > existing.score) {
        const course = getCourseById(enrollment.courseId);
        candidateScores.set(s.courseId, {
          score: newScore,
          reason: `Similar to ${course?.title || enrollment.courseId}`,
        });
      }
    }
  }

  // 2. Boost foundational courses for weak areas
  for (const weak of weakAreas) {
    for (const courseId of weak.courseIds) {
      if (enrolledIds.has(courseId)) continue;
      const existing = candidateScores.get(courseId);
      const boostScore = 1.5; // High priority for remedial
      if (!existing || boostScore > existing.score) {
        candidateScores.set(courseId, {
          score: boostScore,
          reason: `Strengthen your ${weak.subject} foundation (avg quiz score: ${Math.round(weak.avgScore)}%)`,
        });
      }
    }
  }

  // 3. Subject affinity boost: prefer subjects the student has taken
  const subjectCounts = new Map<string, number>();
  for (const e of enrollments) {
    const course = getCourseById(e.courseId);
    if (course) {
      subjectCounts.set(
        course.subject,
        (subjectCounts.get(course.subject) || 0) + 1,
      );
    }
  }

  for (const [courseId, entry] of candidateScores) {
    const course = getCourseById(courseId);
    if (course && subjectCounts.has(course.subject)) {
      entry.score += 0.2 * (subjectCounts.get(course.subject) || 0);
    }
  }

  // Sort and take top N
  const sorted = Array.from(candidateScores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, count);

  const recommendations: Recommendation[] = sorted.map(([courseId, entry]) => {
    const course = getCourseById(courseId);
    return {
      courseId,
      title: course?.title || courseId,
      subject: course?.subject || 'Unknown',
      reason: entry.reason,
      score: entry.score,
    };
  });

  // If not enough candidates, fill with popular courses
  if (recommendations.length < count) {
    const remaining = getAllCourses()
      .filter(
        (c) =>
          c.published &&
          !enrolledIds.has(c.id) &&
          !recommendations.some((r) => r.courseId === c.id),
      )
      .slice(0, count - recommendations.length);

    for (const c of remaining) {
      recommendations.push({
        courseId: c.id,
        title: c.title,
        subject: c.subject,
        reason: 'Explore something new',
        score: 0.1,
      });
    }
  }

  return { recommendations, bucket, weakAreas, isNewUser: false };
}

// ── Continue Learning ──────────────────────────────────

export interface ContinueLearningItem {
  courseId: string;
  title: string;
  subject: string;
  progress: number;
  nextStep: string;
}

export function getContinueLearning(studentId: string): ContinueLearningItem[] {
  const enrollments = getEnrollments(studentId);

  return enrollments
    .filter((e) => e.status === 'active' && e.progress > 0 && e.progress < 100)
    .sort((a, b) => b.progress - a.progress) // Show closest to completion first
    .slice(0, 3)
    .map((e) => {
      const course = getCourseById(e.courseId);
      const nextModule =
        course?.modules[e.completedModules.length]?.title || 'Next lesson';
      return {
        courseId: e.courseId,
        title: course?.title || e.courseId,
        subject: course?.subject || 'Unknown',
        progress: e.progress,
        nextStep: `Continue: ${nextModule}`,
      };
    });
}
