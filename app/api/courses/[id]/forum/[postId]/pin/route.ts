import { NextResponse } from 'next/server';
import { togglePin } from '@/lib/forum-store';

interface RouteParams {
  params: Promise<{ id: string; postId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { postId } = await params;

  const post = togglePin(postId);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}
