import { NextResponse } from "next/server";
import { getByToken } from "@/lib/portfolio-store";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/v1/portfolio/:token
 * Public view of a student's portfolio via share token. No auth required.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { token } = await params;
  const items = getByToken(token);

  if (!items) {
    return NextResponse.json(
      { error: "Invalid or expired share token" },
      { status: 404 },
    );
  }

  return NextResponse.json(items);
}
