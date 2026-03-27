import { NextResponse } from "next/server";
import { closeQuiz, getQuiz } from "@/lib/live-quiz-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quizzes/live/[id]/close
 * Closes the quiz and returns a results summary
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const quiz = getQuiz(id);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  if (quiz.status === "closed") {
    return NextResponse.json({ error: "Quiz is already closed" }, { status: 400 });
  }

  const closed = closeQuiz(id);

  // Build results summary
  const summary = closed.questions.map((q, idx) => {
    const questionResponses = closed.responses[idx] || {};
    const answerCounts: Record<string, number> = {};
    for (const answer of Object.values(questionResponses)) {
      answerCounts[answer] = (answerCounts[answer] || 0) + 1;
    }
    return {
      questionIndex: idx,
      text: q.text,
      totalResponses: Object.keys(questionResponses).length,
      answerDistribution: answerCounts,
    };
  });

  return NextResponse.json({
    quiz: closed,
    summary,
  });
}
