import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

/**
 * GET /api/uploads/recordings/[filename]
 *
 * Serves a recorded video file from the local uploads directory.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { filename } = await params;

  // Prevent path traversal
  const sanitized = path.basename(filename);
  const filePath = path.join(process.cwd(), 'uploads', 'recordings', sanitized);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const buffer = await readFile(filePath);

    // Determine content type from extension
    const ext = path.extname(sanitized).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.webm': 'video/webm',
      '.mp4': 'video/mp4',
      '.ogg': 'video/ogg',
      '.mkv': 'video/x-matroska',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileStat.size),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
