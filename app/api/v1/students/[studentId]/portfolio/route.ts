import { NextResponse } from "next/server";
import { getItems, createItem } from "@/lib/portfolio-store";

interface RouteParams {
  params: Promise<{ studentId: string }>;
}

/**
 * GET /api/v1/students/:studentId/portfolio
 * Returns all portfolio items for a student.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { studentId } = await params;
  const items = getItems(studentId);
  return NextResponse.json(items);
}

/**
 * POST /api/v1/students/:studentId/portfolio
 * Creates a new portfolio item.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { studentId } = await params;
  const body = await request.json();

  const { title, description, type } = body;

  if (!title || !type) {
    return NextResponse.json(
      { error: "title and type are required" },
      { status: 400 },
    );
  }

  const item = createItem(studentId, title, description ?? "", type);
  return NextResponse.json(item, { status: 201 });
}
