import { NextResponse } from 'next/server';
import { acceptReply } from '@/lib/discussion-store';

interface RouteParams {
  params: Promise<{ id: string; threadId: string; replyId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { replyId } = await params;
  const body = await request.json();
  const { authorRole } = body;

  if (authorRole !== 'instructor') {
    return NextResponse.json(
      { error: 'Only instructors can accept replies' },
      { status: 403 },
    );
  }

  const reply = acceptReply(replyId);
  if (!reply) {
    return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
  }

  return NextResponse.json({ reply });
}
