import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
  createRecording,
  completeRecording,
  failRecording,
  getActiveRecording,
} from '@/lib/recording-store';
import { getSessionById } from '@/lib/live-session-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/sessions/[id]/record
 *
 * Start recording: JSON body { action: 'start', lessonId: string }
 * Stop recording:  FormData with { action: 'stop', recordingId: string, duration: number, video: File }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: sessionId } = await params;

  const session = getSessionById(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const contentType = request.headers.get('content-type') || '';

  // ── Start recording (JSON) ─────────────────────────
  if (contentType.includes('application/json')) {
    const body = await request.json();
    const { action, lessonId } = body as { action: string; lessonId: string };

    if (action !== 'start') {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" with JSON body.' },
        { status: 400 },
      );
    }

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Missing required field: lessonId' },
        { status: 400 },
      );
    }

    // Check for an already-active recording on this session
    const active = getActiveRecording(sessionId);
    if (active) {
      return NextResponse.json(
        { error: 'A recording is already in progress for this session', recording: active },
        { status: 409 },
      );
    }

    const recording = createRecording(sessionId, lessonId);
    return NextResponse.json({ recording }, { status: 201 });
  }

  // ── Stop recording (FormData) ──────────────────────
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();

    const action = formData.get('action') as string | null;
    const recordingId = formData.get('recordingId') as string | null;
    const durationStr = formData.get('duration') as string | null;
    const video = formData.get('video') as File | null;

    if (action !== 'stop') {
      return NextResponse.json(
        { error: 'Invalid action. Use "stop" with FormData.' },
        { status: 400 },
      );
    }

    if (!recordingId || !video) {
      return NextResponse.json(
        { error: 'Missing required fields: recordingId, video' },
        { status: 400 },
      );
    }

    const duration = durationStr ? parseFloat(durationStr) : 0;

    try {
      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'uploads', 'recordings');
      await mkdir(uploadsDir, { recursive: true });

      // Save the video file
      const ext = video.name?.split('.').pop() || 'webm';
      const filename = `${recordingId}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(await video.arrayBuffer());
      await writeFile(filePath, buffer);

      // Build the playback URL
      const storageUrl = `/api/uploads/recordings/${filename}`;

      const recording = completeRecording(recordingId, storageUrl, duration);
      if (!recording) {
        return NextResponse.json(
          { error: 'Recording not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({ recording });
    } catch {
      if (recordingId) {
        failRecording(recordingId);
      }
      return NextResponse.json(
        { error: 'Failed to save recording' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: 'Unsupported content type' },
    { status: 400 },
  );
}
