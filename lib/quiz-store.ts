// ── Types ──────────────────────────────────────────────

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number; // 0-100 percentage
  questions: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[]; // For MC and TF
  correctIndex: number; // For MC and TF (index into options)
  correctAnswer?: string; // For short-answer (keyword match)
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  score: number; // 0-100
  passed: boolean;
  answers: { questionId: string; answer: number | string }[];
  takenAt: string;
}

// ── In-memory stores ───────────────────────────────────

const quizzes: Quiz[] = [];
const attempts: QuizAttempt[] = [];

let nextQuizId = 1;
let nextQuestionId = 1;
let nextAttemptId = 1;

// ── Query functions ────────────────────────────────────

export function getQuizByLessonId(lessonId: string): Quiz | undefined {
  return quizzes.find((q) => q.lessonId === lessonId);
}

export function getQuizById(quizId: string): Quiz | undefined {
  return quizzes.find((q) => q.id === quizId);
}

export function getAttempts(studentId: string, quizId: string): QuizAttempt[] {
  return attempts.filter(
    (a) => a.studentId === studentId && a.quizId === quizId,
  );
}

export function getBestAttempt(studentId: string, quizId: string): QuizAttempt | undefined {
  const studentAttempts = getAttempts(studentId, quizId);
  if (studentAttempts.length === 0) return undefined;
  return studentAttempts.reduce((best, curr) =>
    curr.score > best.score ? curr : best,
  );
}

// ── Mutations ──────────────────────────────────────────

export function createQuiz(
  lessonId: string,
  title: string,
  passingScore: number,
  questionInputs: Omit<Question, 'id' | 'quizId'>[],
): Quiz {
  const quizId = `quiz_${nextQuizId++}`;
  const questions: Question[] = questionInputs.map((q) => ({
    ...q,
    id: `q_${nextQuestionId++}`,
    quizId,
  }));

  const quiz: Quiz = {
    id: quizId,
    lessonId,
    title,
    passingScore,
    questions,
  };

  quizzes.push(quiz);
  return quiz;
}

export function submitQuiz(
  studentId: string,
  quizId: string,
  answers: { questionId: string; answer: number | string }[],
): QuizAttempt {
  const quiz = getQuizById(quizId);
  if (!quiz) throw new Error(`Quiz not found: ${quizId}`);

  // Grade each answer
  let correct = 0;
  for (const ans of answers) {
    const question = quiz.questions.find((q) => q.id === ans.questionId);
    if (!question) continue;

    if (question.type === 'short-answer') {
      // Case-insensitive keyword match
      const studentAnswer = String(ans.answer).toLowerCase().trim();
      const expected = (question.correctAnswer || '').toLowerCase().trim();
      if (studentAnswer === expected || studentAnswer.includes(expected)) {
        correct++;
      }
    } else {
      // MC or TF: compare index
      if (Number(ans.answer) === question.correctIndex) {
        correct++;
      }
    }
  }

  const totalQuestions = quiz.questions.length;
  const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  const passed = score >= quiz.passingScore;

  const attempt: QuizAttempt = {
    id: `attempt_${nextAttemptId++}`,
    studentId,
    quizId,
    score,
    passed,
    answers,
    takenAt: new Date().toISOString(),
  };

  attempts.push(attempt);
  return attempt;
}

// ── Seed data ──────────────────────────────────────────
// Lesson IDs follow: ${courseId}--${moduleSlug}--${lessonIndex}
// Algebra 1 modules:
//   "Expressions & Variables" → expressions-variables
//   "Linear Equations" → linear-equations

function seed() {
  // Quiz 1: "What Are Variables?" (algebra-1--expressions-variables--1)
  createQuiz(
    'algebra-1--expressions-variables--1',
    'Variables & Expressions Check',
    70,
    [
      {
        text: 'What is a variable in algebra?',
        type: 'multiple-choice',
        options: [
          'A fixed number that never changes',
          'A symbol that represents an unknown or changing value',
          'An equation with two sides',
          'A type of graph',
        ],
        correctIndex: 1,
      },
      {
        text: 'If x = 5, what is the value of 3x + 2?',
        type: 'multiple-choice',
        options: ['10', '15', '17', '20'],
        correctIndex: 2,
      },
      {
        text: 'The expression 4y means 4 multiplied by y.',
        type: 'true-false',
        options: ['True', 'False'],
        correctIndex: 0,
      },
      {
        text: 'What is the coefficient in the term 7n?',
        type: 'short-answer',
        options: [],
        correctIndex: 0,
        correctAnswer: '7',
      },
    ],
  );

  // Quiz 2: "Writing & Evaluating Expressions" (algebra-1--expressions-variables--2)
  createQuiz(
    'algebra-1--expressions-variables--2',
    'Writing Expressions Quiz',
    70,
    [
      {
        text: 'Which expression represents "5 more than a number n"?',
        type: 'multiple-choice',
        options: ['5n', 'n - 5', 'n + 5', '5/n'],
        correctIndex: 2,
      },
      {
        text: 'Evaluate 2a + b when a = 3 and b = 4.',
        type: 'multiple-choice',
        options: ['9', '10', '14', '7'],
        correctIndex: 1,
      },
      {
        text: '"Twice a number" can be written as 2x.',
        type: 'true-false',
        options: ['True', 'False'],
        correctIndex: 0,
      },
      {
        text: 'The expression x/3 means x divided by what number?',
        type: 'short-answer',
        options: [],
        correctIndex: 0,
        correctAnswer: '3',
      },
      {
        text: 'Which represents "the product of 6 and m"?',
        type: 'multiple-choice',
        options: ['6 + m', '6m', '6 - m', 'm/6'],
        correctIndex: 1,
      },
    ],
  );

  // Quiz 3: "Solving One-Step Equations" (algebra-1--linear-equations--1)
  createQuiz(
    'algebra-1--linear-equations--1',
    'One-Step Equations Quiz',
    70,
    [
      {
        text: 'Solve: x + 7 = 12',
        type: 'multiple-choice',
        options: ['x = 19', 'x = 5', 'x = 7', 'x = -5'],
        correctIndex: 1,
      },
      {
        text: 'Solve: 3x = 21. What is x?',
        type: 'short-answer',
        options: [],
        correctIndex: 0,
        correctAnswer: '7',
      },
      {
        text: 'To solve x - 4 = 10, you add 4 to both sides.',
        type: 'true-false',
        options: ['True', 'False'],
        correctIndex: 0,
      },
      {
        text: 'Solve: x/2 = 8',
        type: 'multiple-choice',
        options: ['x = 4', 'x = 10', 'x = 16', 'x = 6'],
        correctIndex: 2,
      },
      {
        text: 'What operation undoes multiplication?',
        type: 'multiple-choice',
        options: ['Addition', 'Subtraction', 'Division', 'Exponentiation'],
        correctIndex: 2,
      },
    ],
  );
}

seed();
