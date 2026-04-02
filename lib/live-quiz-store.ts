// ── Types ──────────────────────────────────────────────

export interface LiveQuizQuestion {
  text: string;
  options: string[];
}

export interface LiveQuiz {
  id: string;
  courseId: string;
  questions: LiveQuizQuestion[];
  responses: Record<number, Record<string, string>>; // questionIndex -> { studentId -> answer }
  status: "open" | "closed";
  createdAt: string;
}

// ── In-memory store ────────────────────────────────────

const liveQuizzes = new Map<string, LiveQuiz>();
let nextId = 1;

// ── Helpers ────────────────────────────────────────────

export function createQuiz(
  courseId: string,
  questions: LiveQuizQuestion[],
): LiveQuiz {
  const id = `lq_${nextId++}`;
  const quiz: LiveQuiz = {
    id,
    courseId,
    questions,
    responses: {},
    status: "open",
    createdAt: new Date().toISOString(),
  };
  liveQuizzes.set(id, quiz);
  return quiz;
}

export function getQuiz(id: string): LiveQuiz | undefined {
  return liveQuizzes.get(id);
}

export function addResponse(
  id: string,
  studentId: string,
  questionIndex: number,
  answer: string,
): LiveQuiz {
  const quiz = liveQuizzes.get(id);
  if (!quiz) throw new Error(`Live quiz not found: ${id}`);
  if (quiz.status === "closed") throw new Error("Quiz is closed");
  if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
    throw new Error(`Invalid question index: ${questionIndex}`);
  }

  if (!quiz.responses[questionIndex]) {
    quiz.responses[questionIndex] = {};
  }
  quiz.responses[questionIndex][studentId] = answer;
  return quiz;
}

export function closeQuiz(id: string): LiveQuiz {
  const quiz = liveQuizzes.get(id);
  if (!quiz) throw new Error(`Live quiz not found: ${id}`);
  quiz.status = "closed";
  return quiz;
}
