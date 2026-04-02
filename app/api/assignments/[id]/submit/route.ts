import { NextResponse } from 'next/server';
import { createSubmission } from '@/lib/submission-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/assignments/[id]/submit
 * Accepts { studentId, filename, fileContent (base64), mimeType }
 * Creates a new submission for the assignment.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const body = await request.json();
  const { studentId, filename, fileContent, mimeType } = body;

  if (!studentId || !filename || !fileContent || !mimeType) {
    return NextResponse.json(
      { error: 'studentId, filename, fileContent, and mimeType are required' },
      { status: 400 },
    );
  }

  const submission = createSubmission(id, studentId, filename, fileContent, mimeType);

  return NextResponse.json({ submission }, { status: 201 });
}
