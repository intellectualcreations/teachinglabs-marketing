import { NextResponse } from "next/server";
import { getByToken, addEndorsement } from "@/lib/portfolio-store";

interface RouteParams {
  params: Promise<{ token: string; itemId: string }>;
}

/**
 * POST /api/v1/portfolio/:token/endorse/:itemId
 * Adds an endorsement to a portfolio item via share token.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { token, itemId } = await params;

  const items = getByToken(token);
  if (!items) {
    return NextResponse.json(
      { error: "Invalid or expired share token" },
      { status: 404 },
    );
  }

  const item = items.find((i) => i.id === itemId);
  if (!item) {
    return NextResponse.json(
      { error: "Portfolio item not found" },
      { status: 404 },
    );
  }

  const body = await request.json();
  const { instructorId, comment } = body;

  if (!instructorId || !comment) {
    return NextResponse.json(
      { error: "instructorId and comment are required" },
      { status: 400 },
    );
  }

  const endorsement = addEndorsement(item.studentId, itemId, instructorId, comment);
  if (!endorsement) {
    return NextResponse.json(
      { error: "Failed to add endorsement" },
      { status: 500 },
    );
  }

  return NextResponse.json(endorsement, { status: 201 });
}
