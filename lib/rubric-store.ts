// ── Types ──────────────────────────────────────────────

export interface RubricCriterion {
  name: string;
  description: string;
  weight: number; // percentage weight (all should sum to 100)
  maxScore: number;
}

export interface Rubric {
  id: string;
  assignmentId: string; // maps to quiz id or assignment id
  criteria: RubricCriterion[];
  createdAt: string;
  updatedAt: string;
}

// ── In-memory store ────────────────────────────────────

const rubrics: Rubric[] = [];
let nextRubricId = 1;

// ── Query functions ────────────────────────────────────

export function getRubricByAssignmentId(assignmentId: string): Rubric | undefined {
  return rubrics.find((r) => r.assignmentId === assignmentId);
}

export function getRubricById(rubricId: string): Rubric | undefined {
  return rubrics.find((r) => r.id === rubricId);
}

// ── Mutations ──────────────────────────────────────────

export function createOrUpdateRubric(
  assignmentId: string,
  criteria: RubricCriterion[],
): Rubric {
  if (criteria.length === 0) {
    throw new Error('Rubric must have at least one criterion');
  }

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    throw new Error(`Criteria weights must sum to 100 (got ${totalWeight})`);
  }

  const existing = rubrics.find((r) => r.assignmentId === assignmentId);
  const now = new Date().toISOString();

  if (existing) {
    existing.criteria = criteria;
    existing.updatedAt = now;
    return existing;
  }

  const rubric: Rubric = {
    id: `rubric_${nextRubricId++}`,
    assignmentId,
    criteria,
    createdAt: now,
    updatedAt: now,
  };

  rubrics.push(rubric);
  return rubric;
}

// ── Seed data ──────────────────────────────────────────

function seed() {
  // Rubric for quiz_1 (Variables & Expressions Check)
  createOrUpdateRubric('quiz_1', [
    {
      name: 'Conceptual Understanding',
      description: 'Demonstrates understanding of variables and algebraic expressions',
      weight: 40,
      maxScore: 100,
    },
    {
      name: 'Computation Accuracy',
      description: 'Correctly evaluates expressions and identifies coefficients',
      weight: 35,
      maxScore: 100,
    },
    {
      name: 'Mathematical Reasoning',
      description: 'Shows logical reasoning in answers and problem-solving approach',
      weight: 25,
      maxScore: 100,
    },
  ]);

  // Rubric for quiz_3 (One-Step Equations Quiz)
  createOrUpdateRubric('quiz_3', [
    {
      name: 'Equation Solving',
      description: 'Correctly solves one-step equations using inverse operations',
      weight: 50,
      maxScore: 100,
    },
    {
      name: 'Conceptual Knowledge',
      description: 'Understands the relationship between operations and their inverses',
      weight: 30,
      maxScore: 100,
    },
    {
      name: 'Accuracy',
      description: 'Provides precise numerical answers without errors',
      weight: 20,
      maxScore: 100,
    },
  ]);
}

seed();
