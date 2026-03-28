// Phase 39 — Student Progress Store

import { getGradesByStudent, type RubricGrade } from './rubric-store';

export interface ProgressEntry {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  completed: boolean;
  score: number;        // 0-100, 0 if not graded
  submittedAt: string;
}

const entries: ProgressEntry[] = [];
let nextId = 1;

export function addProgressEntry(entry: Omit<ProgressEntry, 'id'>): ProgressEntry {
  const record: ProgressEntry = { id: String(nextId++), ...entry };
  entries.push(record);
  return record;
}

export function getEntriesByStudent(studentId: string): ProgressEntry[] {
  return entries.filter(e => e.studentId === studentId);
}

export function getEntriesByCourse(courseId: string): ProgressEntry[] {
  return entries.filter(e => e.courseId === courseId);
}

export interface StudentProgress {
  studentId: string;
  assignmentsTotal: number;
  assignmentsCompleted: number;
  completionRate: number;
  avgScore: number;
  recentGrades: { assignmentId: string; score: number; gradedAt: string }[];
}

export function getStudentProgress(studentId: string): StudentProgress {
  const studentEntries = getEntriesByStudent(studentId);
  const completed = studentEntries.filter(e => e.completed);

  // Pull rubric grades for avg score calculation
  const rubricGrades: RubricGrade[] = getGradesByStudent(studentId);
  const gradedAssignments = rubricGrades.filter(g => g.maxTotal > 0);

  const avgScore = gradedAssignments.length > 0
    ? Math.round(
        gradedAssignments.reduce((sum, g) => sum + (g.total / g.maxTotal) * 100, 0) /
        gradedAssignments.length
      )
    : 0;

  const recentGrades = rubricGrades
    .sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime())
    .slice(0, 5)
    .map(g => ({
      assignmentId: g.assignmentId,
      score: g.maxTotal > 0 ? Math.round((g.total / g.maxTotal) * 100) : 0,
      gradedAt: g.gradedAt,
    }));

  return {
    studentId,
    assignmentsTotal: studentEntries.length,
    assignmentsCompleted: completed.length,
    completionRate: studentEntries.length > 0
      ? Math.round((completed.length / studentEntries.length) * 100) / 100
      : 0,
    avgScore,
    recentGrades,
  };
}

/** Get all unique student IDs that have progress entries for a given course */
export function getStudentIdsByCourse(courseId: string): string[] {
  const ids = new Set<string>();
  for (const e of entries) {
    if (e.courseId === courseId) ids.add(e.studentId);
  }
  return Array.from(ids);
}
