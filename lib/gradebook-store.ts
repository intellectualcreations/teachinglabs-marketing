// ── Types ──────────────────────────────────────────────

export type GradeCategory = "assignment" | "quiz" | "exam";

export interface GradingConfig {
  courseId: string;
  weights: Record<GradeCategory, number>; // percentages that should sum to 100
  updatedAt: string;
}

export interface GradeRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  score: number;
  maxScore: number;
  category: GradeCategory;
  recordedAt: string;
}

export interface StudentCourseGrade {
  studentId: string;
  courseId: string;
  weightedPercentage: number;
  letterGrade: string;
  gpa: number;
  breakdown: Record<GradeCategory, { earned: number; max: number; percentage: number; weight: number }>;
}

export interface StudentGPA {
  studentId: string;
  courseGPAs: { courseId: string; gpa: number; letterGrade: string; weightedPercentage: number }[];
  cumulativeGPA: number;
}

// ── In-memory stores ───────────────────────────────────

const gradingConfigs = new Map<string, GradingConfig>();
const gradeRecords = new Map<string, GradeRecord>();

let nextGradeId = 1;

// ── GPA Scale ──────────────────────────────────────────

export function percentageToLetterGrade(pct: number): string {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

export function letterGradeToGPA(letter: string): number {
  switch (letter) {
    case "A": return 4.0;
    case "B": return 3.0;
    case "C": return 2.0;
    case "D": return 1.0;
    default: return 0.0;
  }
}

export function percentageToGPA(pct: number): number {
  return letterGradeToGPA(percentageToLetterGrade(pct));
}

// ── Config mutations ───────────────────────────────────

export function setGradingConfig(
  courseId: string,
  weights: Record<GradeCategory, number>,
): GradingConfig {
  const config: GradingConfig = {
    courseId,
    weights,
    updatedAt: new Date().toISOString(),
  };
  gradingConfigs.set(courseId, config);
  return config;
}

export function getGradingConfig(courseId: string): GradingConfig | undefined {
  return gradingConfigs.get(courseId);
}

// ── Grade mutations ────────────────────────────────────

export function recordGrade(
  assignmentId: string,
  studentId: string,
  courseId: string,
  score: number,
  maxScore: number,
  category: GradeCategory,
): GradeRecord {
  // Upsert: same assignment + student → update
  for (const rec of gradeRecords.values()) {
    if (rec.assignmentId === assignmentId && rec.studentId === studentId) {
      rec.score = score;
      rec.maxScore = maxScore;
      rec.category = category;
      rec.courseId = courseId;
      rec.recordedAt = new Date().toISOString();
      return rec;
    }
  }
  const record: GradeRecord = {
    id: `grade_${nextGradeId++}`,
    assignmentId,
    studentId,
    courseId,
    score,
    maxScore,
    category,
    recordedAt: new Date().toISOString(),
  };
  gradeRecords.set(record.id, record);
  return record;
}

// ── Grade queries ──────────────────────────────────────

export function getGradesForStudentInCourse(
  courseId: string,
  studentId: string,
): GradeRecord[] {
  return Array.from(gradeRecords.values())
    .filter((g) => g.courseId === courseId && g.studentId === studentId)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
}

export function getGradesForCourse(courseId: string): GradeRecord[] {
  return Array.from(gradeRecords.values())
    .filter((g) => g.courseId === courseId);
}

export function getCoursesWithGradesForStudent(studentId: string): string[] {
  const courseIds = new Set<string>();
  for (const rec of gradeRecords.values()) {
    if (rec.studentId === studentId) {
      courseIds.add(rec.courseId);
    }
  }
  return Array.from(courseIds);
}

// ── Weighted grade calculation ─────────────────────────

export function calculateWeightedGrade(
  courseId: string,
  studentId: string,
): StudentCourseGrade | null {
  const config = gradingConfigs.get(courseId);
  if (!config) return null;

  const grades = getGradesForStudentInCourse(courseId, studentId);
  if (grades.length === 0) return null;

  const categories: GradeCategory[] = ["assignment", "quiz", "exam"];
  const breakdown = {} as Record<GradeCategory, { earned: number; max: number; percentage: number; weight: number }>;

  let weightedTotal = 0;
  let totalWeight = 0;

  for (const cat of categories) {
    const catGrades = grades.filter((g) => g.category === cat);
    const earned = catGrades.reduce((sum, g) => sum + g.score, 0);
    const max = catGrades.reduce((sum, g) => sum + g.maxScore, 0);
    const percentage = max > 0 ? (earned / max) * 100 : 0;
    const weight = config.weights[cat] || 0;

    breakdown[cat] = { earned, max, percentage: Math.round(percentage * 100) / 100, weight };

    if (max > 0) {
      weightedTotal += (percentage * weight) / 100;
      totalWeight += weight;
    }
  }

  // Normalize if not all categories have grades
  const weightedPercentage = totalWeight > 0
    ? Math.round((weightedTotal / totalWeight) * 100 * 100) / 100
    : 0;

  const letterGrade = percentageToLetterGrade(weightedPercentage);
  const gpa = letterGradeToGPA(letterGrade);

  return { studentId, courseId, weightedPercentage, letterGrade, gpa, breakdown };
}

// ── GPA calculation ────────────────────────────────────

export function calculateStudentGPA(studentId: string): StudentGPA {
  const courseIds = getCoursesWithGradesForStudent(studentId);
  const courseGPAs: StudentGPA["courseGPAs"] = [];

  for (const courseId of courseIds) {
    const grade = calculateWeightedGrade(courseId, studentId);
    if (grade) {
      courseGPAs.push({
        courseId,
        gpa: grade.gpa,
        letterGrade: grade.letterGrade,
        weightedPercentage: grade.weightedPercentage,
      });
    }
  }

  const cumulativeGPA = courseGPAs.length > 0
    ? Math.round((courseGPAs.reduce((sum, c) => sum + c.gpa, 0) / courseGPAs.length) * 100) / 100
    : 0;

  return { studentId, courseGPAs, cumulativeGPA };
}
