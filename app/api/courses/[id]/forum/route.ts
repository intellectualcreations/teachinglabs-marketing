import { NextResponse } from 'next/server';
import { getPostsByCourse, createPost } from '@/lib/forum-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const posts = getPostsByCourse(courseId);
  return NextResponse.json({ posts });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const body = await request.json();
  const { authorId, authorName, title, content } = body;

  if (!authorId || !authorName || !title || !content) {
    return NextResponse.json(
      { error: 'Missing required fields: authorId, authorName, title, content' },
      { status: 400 },
    );
  }

  const post = createPost(courseId, authorId, authorName, title, content);
  return NextResponse.json({ post }, { status: 201 });
}
