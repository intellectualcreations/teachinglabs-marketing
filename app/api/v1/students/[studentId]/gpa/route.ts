import { NextResponse } from "next/server";
import { calculateStudentGPA } from "@/lib/gradebook-store";

interface RouteParams {
  params: Promise<{ studentId: string }>;
}

/**
 * GET /api/v1/students/:studentId/gpa
 * Returns per-course GPAs and cumulative GPA for a student.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { studentId } = await params;

  const gpa = calculateStudentGPA(studentId);

  if (gpa.courseGPAs.length === 0) {
    return NextResponse.json(
      { error: "No grades found for this student" },
      { status: 404 },
    );
  }

  return NextResponse.json(gpa);
}
