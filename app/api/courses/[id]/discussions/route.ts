import { NextResponse } from 'next/server';
import { getThreadsForCourse, createThread } from '@/lib/discussion-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const threads = getThreadsForCourse(courseId);
  return NextResponse.json({ threads });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const body = await request.json();
  const { title, content, authorId, authorRole } = body;

  if (!title || !content || !authorId || !authorRole) {
    return NextResponse.json(
      { error: 'Missing required fields: title, content, authorId, authorRole' },
      { status: 400 },
    );
  }

  const thread = createThread(courseId, title, content, authorId, authorRole);
  return NextResponse.json({ thread }, { status: 201 });
}
