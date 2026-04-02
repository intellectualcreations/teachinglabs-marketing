import { NextResponse } from 'next/server';
import { getRepliesForThread, addReply, getThread } from '@/lib/discussion-store';

interface RouteParams {
  params: Promise<{ id: string; threadId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { threadId } = await params;
  const thread = getThread(threadId);
  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }
  const replies = getRepliesForThread(threadId);
  return NextResponse.json({ replies });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { threadId } = await params;
  const body = await request.json();
  const { content, authorId, authorRole } = body;

  if (!content || !authorId || !authorRole) {
    return NextResponse.json(
      { error: 'Missing required fields: content, authorId, authorRole' },
      { status: 400 },
    );
  }

  const reply = addReply(threadId, content, authorId, authorRole);
  if (!reply) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  return NextResponse.json({ reply }, { status: 201 });
}
