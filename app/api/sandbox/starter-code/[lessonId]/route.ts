/**
 * PATCH /api/sandbox/starter-code/[lessonId]
 * FLU-319: Allow instructors to set/update starter_code for a lesson.
 *
 * Input: { starterCode: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getLessonById, updateLesson } from '@/lib/lesson-store';
import { rateLimit } from '@/lib/rate-limit';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  const user = getCurrentUser('instructor');
  if (user.role !== 'instructor' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Only instructors can set starter code' }, { status: 403 });
  }

  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  let body: { starterCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body.starterCode !== 'string') {
    return NextResponse.json({ error: 'starterCode must be a string' }, { status: 400 });
  }

  const updated = updateLesson(lessonId, { starterCode: body.starterCode });

  return NextResponse.json({ lesson: updated });
}
