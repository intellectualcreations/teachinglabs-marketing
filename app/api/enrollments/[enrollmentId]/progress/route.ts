import { NextRequest, NextResponse } from 'next/server';
import { updateModuleProgress } from '@/lib/enrollment-store';

interface RouteParams {
  params: Promise<{ enrollmentId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { enrollmentId } = await params;
    const body = await request.json();
    const { moduleTitle } = body;

    if (!moduleTitle) {
      return NextResponse.json(
        { error: 'moduleTitle is required' },
        { status: 400 },
      );
    }

    const enrollment = updateModuleProgress(enrollmentId, moduleTitle);

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found or invalid module' },
        { status: 404 },
      );
    }

    return NextResponse.json({ enrollment });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
