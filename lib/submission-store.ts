// ── Types ──────────────────────────────────────────────

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  filename: string;
  fileContent: string; // base64-encoded
  mimeType: string;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
}

// ── In-memory store ────────────────────────────────────

const submissions = new Map<string, Submission>();

let nextSubmissionId = 1;

// ── Mutations ──────────────────────────────────────────

export function createSubmission(
  assignmentId: string,
  studentId: string,
  filename: string,
  fileContent: string,
  mimeType: string,
): Submission {
  const submission: Submission = {
    id: `submission_${nextSubmissionId++}`,
    assignmentId,
    studentId,
    filename,
    fileContent,
    mimeType,
    submittedAt: new Date().toISOString(),
    grade: null,
    feedback: null,
  };
  submissions.set(submission.id, submission);
  return submission;
}

export function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
): Submission | undefined {
  const submission = submissions.get(submissionId);
  if (!submission) return undefined;
  submission.grade = grade;
  submission.feedback = feedback;
  return submission;
}

// ── Queries ────────────────────────────────────────────

export function getSubmission(submissionId: string): Submission | undefined {
  return submissions.get(submissionId);
}

export function getSubmissionsForAssignment(assignmentId: string): Submission[] {
  return Array.from(submissions.values())
    .filter((s) => s.assignmentId === assignmentId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function getSubmissionsByStudent(studentId: string): Submission[] {
  return Array.from(submissions.values())
    .filter((s) => s.studentId === studentId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
