export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  maxScore: number;
  weight: number;
  description: string;
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
  createdAt: string;
}

export interface RubricGrade {
  studentId: string;
  rubricId: string;
  scores: { criterionId: string; points: number }[];
  total: number;
  maxTotal: number;
  passed: boolean;
  gradedAt: string;
}

const rubrics = new Map<string, Rubric>();
const assignmentRubrics = new Map<string, string>(); // assignmentId → rubricId
let rubricIdCtr = 1;

export function createRubric(name: string, criteria: Omit<RubricCriterion, 'id'>[]): Rubric {
  const rubric: Rubric = {
    id: String(rubricIdCtr++),
    name,
    criteria: criteria.map((c, i) => ({ ...c, id: String(i + 1) })),
    createdAt: new Date().toISOString(),
  };
  rubrics.set(rubric.id, rubric);
  return rubric;
}

export function getRubric(id: string): Rubric | undefined {
  return rubrics.get(id);
}

export function getRubricByAssignmentId(assignmentId: string): Rubric | undefined {
  const rubricId = assignmentRubrics.get(assignmentId);
  return rubricId ? rubrics.get(rubricId) : undefined;
}

export function createOrUpdateRubric(assignmentId: string, name: string, criteria: Omit<RubricCriterion, 'id'>[]): Rubric {
  const existing = getRubricByAssignmentId(assignmentId);
  if (existing) {
    const updated: Rubric = {
      ...existing,
      name,
      criteria: criteria.map((c, i) => ({ ...c, id: String(i + 1) })),
    };
    rubrics.set(updated.id, updated);
    return updated;
  }
  const rubric = createRubric(name, criteria);
  assignmentRubrics.set(assignmentId, rubric.id);
  return rubric;
}

export function gradeByRubric(rubricId: string, studentId: string, scores: { criterionId: string; points: number }[]): RubricGrade {
  const rubric = rubrics.get(rubricId);
  const maxTotal = rubric ? rubric.criteria.reduce((sum, c) => sum + c.maxPoints, 0) : 100;
  const total = scores.reduce((sum, s) => sum + s.points, 0);
  return {
    studentId, rubricId, scores,
    total, maxTotal,
    passed: (total / maxTotal) >= 0.6,
    gradedAt: new Date().toISOString(),
  };
}
