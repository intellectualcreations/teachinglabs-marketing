import { NextResponse } from 'next/server';
import { getQuizById, submitQuiz } from '@/lib/quiz-store';
import { getCurrentUser, getUserById } from '@/lib/users';
import { createNotification } from '@/lib/notification-store';
import { getLessonById } from '@/lib/lesson-store';
import { getCourseById } from '@/lib/courses';
import { getInstructorByName } from '@/lib/users';
import { getRubricByAssignmentId } from '@/lib/rubric-store';
import { createPendingGradeSubmission, updateWithAIGrade } from '@/lib/grade-submission-store';
import { gradeWithAI } from '@/lib/ai-grading-service';

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { quizId } = await params;
  const user = getCurrentUser('student');

  const quiz = getQuizById(quizId);
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  let body: { answers: { questionId: string; answer: number | string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.answers || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'answers array is required' }, { status: 400 });
  }

  const attempt = submitQuiz(user.id, quizId, body.answers);

  // Build per-question results with correct answers revealed
  const results = quiz.questions.map((q) => {
    const studentAnswer = body.answers.find((a) => a.questionId === q.id);
    let correct = false;

    if (q.type === 'short-answer') {
      const sa = String(studentAnswer?.answer || '').toLowerCase().trim();
      const expected = (q.correctAnswer || '').toLowerCase().trim();
      correct = sa === expected || sa.includes(expected);
    } else {
      correct = Number(studentAnswer?.answer) === q.correctIndex;
    }

    return {
      questionId: q.id,
      correct,
      correctAnswer:
        q.type === 'short-answer'
          ? q.correctAnswer
          : q.options[q.correctIndex],
    };
  });

  // Notify the course instructor about the submission
  const lesson = getLessonById(quiz.lessonId);
  if (lesson) {
    const course = getCourseById(lesson.courseId);
    if (course) {
      const instructor = getInstructorByName(course.instructor);
      if (instructor) {
        createNotification(
          instructor.id,
          'quiz_submitted',
          `${user.name} submitted quiz "${quiz.title}"`,
          { quizId: quiz.id, studentId: user.id, courseId: course.id },
        );
      }
    }
  }

  // Auto-trigger AI grading if a rubric exists for this quiz
  const rubric = getRubricByAssignmentId(quizId);
  if (rubric) {
    try {
      createPendingGradeSubmission(attempt.id, user.id, quizId);

      const answerText = body.answers
        .map((a) => {
          const question = quiz.questions.find((q) => q.id === a.questionId);
          const questionText = question?.text || a.questionId;
          const answerValue =
            typeof a.answer === 'number' && question?.options
              ? question.options[a.answer] || `Option ${a.answer}`
              : String(a.answer);
          return `Q: ${questionText}\nA: ${answerValue}`;
        })
        .join('\n\n');

      const questionText = quiz.questions.map((q) => q.text).join('\n');

      // Fire and forget: grade asynchronously without blocking the response
      gradeWithAI(rubric.criteria, answerText, questionText)
        .then((aiResult) => {
          updateWithAIGrade(
            attempt.id,
            aiResult.score,
            aiResult.criteriaScores,
            aiResult.feedback,
            aiResult.improvementSuggestions,
          );
        })
        .catch((err) => {
          console.error('Auto AI grading failed for attempt', attempt.id, err);
        });
    } catch (err) {
      console.error('Failed to trigger AI grading:', err);
    }
  }

  return NextResponse.json({
    score: attempt.score,
    passed: attempt.passed,
    passingScore: quiz.passingScore,
    results,
    attemptId: attempt.id,
  });
}
