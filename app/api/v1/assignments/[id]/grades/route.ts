import { NextResponse } from "next/server";
import { recordGrade, type GradeCategory } from "@/lib/gradebook-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/assignments/:id/grades
 * Records a grade for a student on an assignment.
 * Body: { studentId, score, maxScore, courseId, category }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: assignmentId } = await params;
  const body = await request.json();

  const { studentId, score, maxScore, courseId, category } = body;

  if (!studentId || score == null || maxScore == null || !courseId || !category) {
    return NextResponse.json(
      { error: "studentId, score, maxScore, courseId, and category are required" },
      { status: 400 },
    );
  }

  const validCategories: GradeCategory[] = ["assignment", "quiz", "exam"];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "category must be one of: assignment, quiz, exam" },
      { status: 400 },
    );
  }

  if (score < 0 || maxScore <= 0 || score > maxScore) {
    return NextResponse.json(
      { error: "Invalid score: must be 0 <= score <= maxScore, maxScore > 0" },
      { status: 400 },
    );
  }

  const record = recordGrade(assignmentId, studentId, courseId, score, maxScore, category);

  return NextResponse.json(record, { status: 201 });
}
