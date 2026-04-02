import { NextResponse } from 'next/server';
import { pinThread, getThread } from '@/lib/discussion-store';

interface RouteParams {
  params: Promise<{ id: string; threadId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { threadId } = await params;
  const body = await request.json();
  const { authorRole, pinned } = body;

  if (authorRole !== 'instructor') {
    return NextResponse.json(
      { error: 'Only instructors can pin threads' },
      { status: 403 },
    );
  }

  const thread = getThread(threadId);
  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const updated = pinThread(threadId, pinned !== false);
  return NextResponse.json({ thread: updated });
}
