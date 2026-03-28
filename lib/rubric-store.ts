// Phase 39 — Rubric Store for grading

export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
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
  assignmentId: string;
  scores: { criterionId: string; points: number }[];
  total: number;
  maxTotal: number;
  passed: boolean;
  gradedAt: string;
}

const rubrics = new Map<string, Rubric>();
const grades: RubricGrade[] = [];
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

export function gradeByRubric(
  rubricId: string,
  studentId: string,
  assignmentId: string,
  scores: { criterionId: string; points: number }[]
): RubricGrade {
  const rubric = rubrics.get(rubricId);
  const maxTotal = rubric ? rubric.criteria.reduce((sum, c) => sum + c.maxPoints, 0) : 100;
  const total = scores.reduce((sum, s) => sum + s.points, 0);
  const grade: RubricGrade = {
    studentId,
    rubricId,
    assignmentId,
    scores,
    total,
    maxTotal,
    passed: maxTotal > 0 ? (total / maxTotal) >= 0.6 : false,
    gradedAt: new Date().toISOString(),
  };
  grades.push(grade);
  return grade;
}

export function getGradesByStudent(studentId: string): RubricGrade[] {
  return grades.filter(g => g.studentId === studentId);
}

export function getGradesByStudentAndAssignment(studentId: string, assignmentId: string): RubricGrade | undefined {
  return grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId);
}
