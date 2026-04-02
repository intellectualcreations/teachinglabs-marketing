import { NextResponse } from 'next/server';
import { getRecordingByLesson } from '@/lib/recording-store';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

/**
 * GET /api/lessons/[lessonId]/recording
 *
 * Returns the completed recording metadata + playback URL for a lesson.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { lessonId } = await params;

  const recording = getRecordingByLesson(lessonId);

  if (!recording) {
    return NextResponse.json(
      { recording: null },
      { status: 200 },
    );
  }

  return NextResponse.json({ recording });
}
