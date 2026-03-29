import { NextResponse } from "next/server";
import {
  setGradingConfig,
  getGradingConfig,
  type GradeCategory,
} from "@/lib/gradebook-store";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * POST /api/v1/courses/:courseId/grading-config
 * Sets grade weights for a course.
 * Body: { assignments: number, quizzes: number, exams: number }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { courseId } = await params;
  const body = await request.json();

  const { assignments, quizzes, exams } = body;

  if (assignments == null || quizzes == null || exams == null) {
    return NextResponse.json(
      { error: "assignments, quizzes, and exams weights are required" },
      { status: 400 },
    );
  }

  const weights: Record<GradeCategory, number> = {
    assignment: assignments,
    quiz: quizzes,
    exam: exams,
  };

  const config = setGradingConfig(courseId, weights);

  return NextResponse.json(config, { status: 201 });
}

/**
 * GET /api/v1/courses/:courseId/grading-config
 * Returns the grading config for a course.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { courseId } = await params;

  const config = getGradingConfig(courseId);
  if (!config) {
    return NextResponse.json(
      { error: "No grading config found for this course" },
      { status: 404 },
    );
  }

  return NextResponse.json(config);
}
