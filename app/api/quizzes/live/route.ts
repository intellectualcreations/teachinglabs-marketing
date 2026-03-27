import { NextResponse } from "next/server";
import { createQuiz } from "@/lib/live-quiz-store";

/**
 * POST /api/quizzes/live
 * Body: { courseId: string, questions: Array<{ text: string, options: string[] }> }
 * Returns 201 with { id }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, questions } = body as {
      courseId: string;
      questions: Array<{ text: string; options: string[] }>;
    };

    if (!courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, questions (non-empty array)" },
        { status: 400 },
      );
    }

    for (const q of questions) {
      if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json(
          { error: "Each question needs text and at least 2 options" },
          { status: 400 },
        );
      }
    }

    const quiz = createQuiz(courseId, questions);
    return NextResponse.json({ id: quiz.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
