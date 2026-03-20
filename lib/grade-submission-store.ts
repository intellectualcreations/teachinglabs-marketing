// ── Types ──────────────────────────────────────────────

export type GradeStatus = 'PENDING' | 'GRADED' | 'REVIEWED' | 'OVERRIDDEN';

export interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback: string;
}

export interface GradeSubmission {
  id: string;
  submissionId: string; // maps to QuizAttempt.id
  studentId: string;
  assignmentId: string; // quiz id
  aiScore: number | null; // 0-100
  aiCriteriaScores: CriteriaScore[];
  aiFeedback: string;
  improvementSuggestions: string[];
  instructorOverrideScore: number | null;
  instructorNotes: string;
  finalScore: number | null; // resolved score (override or ai)
  status: GradeStatus;
  createdAt: string;
  updatedAt: string;
}

// ── In-memory store ────────────────────────────────────

const gradeSubmissions: GradeSubmission[] = [];
let nextGradeSubmissionId = 1;

// ── Query functions ────────────────────────────────────

export function getGradeSubmissionBySubmissionId(
  submissionId: string,
): GradeSubmission | undefined {
  return gradeSubmissions.find((g) => g.submissionId === submissionId);
}

export function getGradeSubmissionById(id: string): GradeSubmission | undefined {
  return gradeSubmissions.find((g) => g.id === id);
}

export function getGradeSubmissionsByAssignment(assignmentId: string): GradeSubmission[] {
  return gradeSubmissions.filter((g) => g.assignmentId === assignmentId);
}

export function getGradeSubmissionsByStudent(studentId: string): GradeSubmission[] {
  return gradeSubmissions.filter((g) => g.studentId === studentId);
}

export function getPendingReviewSubmissions(): GradeSubmission[] {
  return gradeSubmissions.filter((g) => g.status === 'GRADED');
}

export function getAllGradeSubmissions(): GradeSubmission[] {
  return [...gradeSubmissions];
}

// ── Mutations ──────────────────────────────────────────

export function createPendingGradeSubmission(
  submissionId: string,
  studentId: string,
  assignmentId: string,
): GradeSubmission {
  // Check if already exists
  const existing = gradeSubmissions.find((g) => g.submissionId === submissionId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const gs: GradeSubmission = {
    id: `grade_sub_${nextGradeSubmissionId++}`,
    submissionId,
    studentId,
    assignmentId,
    aiScore: null,
    aiCriteriaScores: [],
    aiFeedback: '',
    improvementSuggestions: [],
    instructorOverrideScore: null,
    instructorNotes: '',
    finalScore: null,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  gradeSubmissions.push(gs);
  return gs;
}

export function updateWithAIGrade(
  submissionId: string,
  aiScore: number,
  aiCriteriaScores: CriteriaScore[],
  aiFeedback: string,
  improvementSuggestions: string[],
): GradeSubmission {
  const gs = gradeSubmissions.find((g) => g.submissionId === submissionId);
  if (!gs) throw new Error(`Grade submission not found for: ${submissionId}`);

  gs.aiScore = aiScore;
  gs.aiCriteriaScores = aiCriteriaScores;
  gs.aiFeedback = aiFeedback;
  gs.improvementSuggestions = improvementSuggestions;
  gs.finalScore = aiScore;
  gs.status = 'GRADED';
  gs.updatedAt = new Date().toISOString();

  return gs;
}

export function overrideGrade(
  submissionId: string,
  overrideScore: number,
  instructorNotes: string,
): GradeSubmission {
  const gs = gradeSubmissions.find((g) => g.submissionId === submissionId);
  if (!gs) throw new Error(`Grade submission not found for: ${submissionId}`);

  if (overrideScore < 0 || overrideScore > 100) {
    throw new Error('Override score must be between 0 and 100');
  }

  gs.instructorOverrideScore = overrideScore;
  gs.instructorNotes = instructorNotes;
  gs.finalScore = overrideScore;
  gs.status = 'OVERRIDDEN';
  gs.updatedAt = new Date().toISOString();

  return gs;
}

export function approveGrade(submissionId: string): GradeSubmission {
  const gs = gradeSubmissions.find((g) => g.submissionId === submissionId);
  if (!gs) throw new Error(`Grade submission not found for: ${submissionId}`);

  gs.status = 'REVIEWED';
  gs.updatedAt = new Date().toISOString();

  return gs;
}
