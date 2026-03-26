// ── Types ──────────────────────────────────────────────

export interface RubricAnalysisItem {
  criterionName: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback: string;
}

export interface GradingSuggestion {
  id: string;
  submissionId: string;
  assignmentId: string;
  studentId: string;
  suggestedScore: number; // 0-100
  feedback: string;
  rubricAnalysis: RubricAnalysisItem[];
  improvementSuggestions: string[];
  isMock: boolean;
  accepted: boolean; // instructor accepted this suggestion
  createdAt: string;
}

// ── In-memory store ────────────────────────────────────

const suggestions: GradingSuggestion[] = [];
let nextSuggestionId = 1;

// ── Query functions ────────────────────────────────────

export function getSuggestionById(id: string): GradingSuggestion | undefined {
  return suggestions.find((s) => s.id === id);
}

export function getSuggestionBySubmissionId(
  submissionId: string,
): GradingSuggestion | undefined {
  return suggestions.find((s) => s.submissionId === submissionId);
}

export function getSuggestionsByAssignment(assignmentId: string): GradingSuggestion[] {
  return suggestions.filter((s) => s.assignmentId === assignmentId);
}

export function getAllSuggestions(): GradingSuggestion[] {
  return [...suggestions];
}

// ── Mutations ──────────────────────────────────────────

export function createSuggestion(data: {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  suggestedScore: number;
  feedback: string;
  rubricAnalysis: RubricAnalysisItem[];
  improvementSuggestions: string[];
  isMock: boolean;
}): GradingSuggestion {
  const suggestion: GradingSuggestion = {
    id: `gs-${nextSuggestionId++}`,
    submissionId: data.submissionId,
    assignmentId: data.assignmentId,
    studentId: data.studentId,
    suggestedScore: data.suggestedScore,
    feedback: data.feedback,
    rubricAnalysis: data.rubricAnalysis,
    improvementSuggestions: data.improvementSuggestions,
    isMock: data.isMock,
    accepted: false,
    createdAt: new Date().toISOString(),
  };
  suggestions.push(suggestion);
  return suggestion;
}

export function acceptSuggestion(id: string): GradingSuggestion | undefined {
  const suggestion = suggestions.find((s) => s.id === id);
  if (suggestion) {
    suggestion.accepted = true;
  }
  return suggestion;
}
