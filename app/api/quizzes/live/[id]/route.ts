import { NextResponse } from "next/server";
import { getQuiz } from "@/lib/live-quiz-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/quizzes/live/[id]
 * Returns the full quiz state
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const quiz = getQuiz(id);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ quiz });
}
