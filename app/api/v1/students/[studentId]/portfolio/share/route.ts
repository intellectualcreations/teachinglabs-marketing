import { NextResponse } from "next/server";
import { createShareToken } from "@/lib/portfolio-store";

interface RouteParams {
  params: Promise<{ studentId: string }>;
}

/**
 * POST /api/v1/students/:studentId/portfolio/share
 * Generates a share token for a student's portfolio.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const { studentId } = await params;
  const shareToken = createShareToken(studentId);
  return NextResponse.json(shareToken, { status: 201 });
}
