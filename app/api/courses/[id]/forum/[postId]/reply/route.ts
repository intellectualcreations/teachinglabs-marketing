import { NextResponse } from 'next/server';
import { addReply, getPostById } from '@/lib/forum-store';
import { getUserById } from '@/lib/users';
import { getCourseById } from '@/lib/courses';
import { sendForumReplyNotification } from '@/lib/email-service';

interface RouteParams {
  params: Promise<{ id: string; postId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { postId } = await params;
  const body = await request.json();
  const { authorId, authorName, body: replyBody } = body;

  if (!authorId || !authorName || !replyBody) {
    return NextResponse.json(
      { error: 'Missing required fields: authorId, authorName, body' },
      { status: 400 },
    );
  }

  const reply = addReply(postId, authorId, authorName, replyBody);
  if (!reply) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Send email notification to the post author
  const post = getPostById(postId);
  if (post && post.authorId !== authorId) {
    const postAuthor = getUserById(post.authorId);
    const course = getCourseById(post.courseId);
    if (postAuthor && course) {
      sendForumReplyNotification(
        postAuthor.email,
        postAuthor.name,
        authorName,
        post.title,
        course.title,
        replyBody,
      );
    }
  }

  return NextResponse.json({ reply }, { status: 201 });
}
