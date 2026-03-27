import { NextResponse } from "next/server";
import { addResponse, getQuiz } from "@/lib/live-quiz-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quizzes/live/[id]/respond
 * Body: { studentId: string, questionIndex: number, answer: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const quiz = getQuiz(id);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { studentId, questionIndex, answer } = body as {
      studentId: string;
      questionIndex: number;
      answer: string;
    };

    if (!studentId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, questionIndex, answer" },
        { status: 400 },
      );
    }

    const updated = addResponse(id, studentId, questionIndex, answer);
    return NextResponse.json({ quiz: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
