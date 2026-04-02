// ── Types ──────────────────────────────────────────────

export interface PeerReview {
  id: string;
  assignment_id: string;
  reviewer_id: string;
  rubric_scores: Record<string, number>;
  feedback: string;
  grade: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentReviewState {
  assignment_id: string;
  submitted_for_review: boolean;
}

// ── In-memory stores ───────────────────────────────────

const peerReviews: PeerReview[] = [];
const assignmentReviewStates: AssignmentReviewState[] = [];

let nextPeerReviewId = 1;

// ── Assignment review state ────────────────────────────

export function getAssignmentReviewState(
  assignment_id: string,
): AssignmentReviewState | undefined {
  return assignmentReviewStates.find((s) => s.assignment_id === assignment_id);
}

export function submitAssignmentForReview(assignment_id: string): AssignmentReviewState {
  const existing = assignmentReviewStates.find((s) => s.assignment_id === assignment_id);
  if (existing) {
    existing.submitted_for_review = true;
    return existing;
  }

  const state: AssignmentReviewState = {
    assignment_id,
    submitted_for_review: true,
  };
  assignmentReviewStates.push(state);
  return state;
}

// ── Peer review mutations ──────────────────────────────

export function createPeerReview(
  assignment_id: string,
  reviewer_id: string,
  rubric_scores: Record<string, number>,
  feedback: string,
): PeerReview {
  const scores = Object.values(rubric_scores);
  const grade =
    scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

  const now = new Date().toISOString();
  const review: PeerReview = {
    id: `peer_review_${nextPeerReviewId++}`,
    assignment_id,
    reviewer_id,
    rubric_scores,
    feedback,
    grade,
    created_at: now,
    updated_at: now,
  };

  peerReviews.push(review);
  return review;
}

// ── Peer review queries ────────────────────────────────

export function getPeerReviewsByAssignment(assignment_id: string): PeerReview[] {
  return peerReviews
    .filter((r) => r.assignment_id === assignment_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
