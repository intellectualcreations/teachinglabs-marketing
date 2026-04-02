import { NextResponse } from "next/server";
import { getItem, deleteItem } from "@/lib/portfolio-store";

interface RouteParams {
  params: Promise<{ studentId: string; itemId: string }>;
}

/**
 * GET /api/v1/students/:studentId/portfolio/:itemId
 * Returns a single portfolio item.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { studentId, itemId } = await params;
  const item = getItem(studentId, itemId);

  if (!item) {
    return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

/**
 * DELETE /api/v1/students/:studentId/portfolio/:itemId
 * Deletes a portfolio item.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { studentId, itemId } = await params;
  const deleted = deleteItem(studentId, itemId);

  if (!deleted) {
    return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
