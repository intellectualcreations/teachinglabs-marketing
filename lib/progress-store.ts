// FLU-346: Student Progress Dashboard — Progress Store

export interface ProgressEntry {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  score: number;       // 0-100
  maxScore: number;    // 100
  completed: boolean;
  submittedAt: string;
}

const progressEntries: ProgressEntry[] = [];
let nextId = 1;

export function addProgressEntry(entry: Omit<ProgressEntry, 'id'>): ProgressEntry {
  const record: ProgressEntry = { id: String(nextId++), ...entry };
  progressEntries.push(record);
  return record;
}

export function getProgressByStudent(studentId: string): ProgressEntry[] {
  return progressEntries.filter(e => e.studentId === studentId);
}

export function getProgressByStudentAndCourse(studentId: string, courseId: string): ProgressEntry[] {
  return progressEntries.filter(e => e.studentId === studentId && e.courseId === courseId);
}

export function getStudentIdsByCourse(courseId: string): string[] {
  return [...new Set(progressEntries.filter(e => e.courseId === courseId).map(e => e.studentId))];
}

export function getStudentProgress(studentId: string) {
  const agg = getAggregate(studentId);
  return { studentId, completionRate: agg.courseCompletion / 100, avgScore: agg.avgScore };
}

export function getAggregate(studentId: string) {
  const entries = getProgressByStudent(studentId);
  const completed = entries.filter(e => e.completed);
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((s, e) => s + e.score, 0) / completed.length)
    : 0;
  const courseCompletion = entries.length > 0
    ? Math.round((completed.length / entries.length) * 100)
    : 0;
  return {
    courseCompletion,
    totalAssignments: entries.length,
    completedAssignments: completed.length,
    avgScore,
  };
}

export function getCourseBreakdown(studentId: string) {
  const entries = getProgressByStudent(studentId);
  const byCourse: Record<string, ProgressEntry[]> = {};
  for (const e of entries) {
    if (!byCourse[e.courseId]) byCourse[e.courseId] = [];
    byCourse[e.courseId].push(e);
  }
  return Object.entries(byCourse).map(([courseId, courseEntries]) => {
    const done = courseEntries.filter(e => e.completed);
    return {
      courseId,
      totalAssignments: courseEntries.length,
      completedAssignments: done.length,
      avgScore: done.length > 0
        ? Math.round(done.reduce((s, e) => s + e.score, 0) / done.length)
        : 0,
      courseCompletion: courseEntries.length > 0
        ? Math.round((done.length / courseEntries.length) * 100)
        : 0,
    };
  });
}
