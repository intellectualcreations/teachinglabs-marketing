import { NextResponse } from 'next/server';
import {
  getAnnouncementsForCourse,
  createAnnouncement,
} from '@/lib/announcement-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const announcements = getAnnouncementsForCourse(courseId);
  return NextResponse.json({ announcements });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: courseId } = await params;
  const body = await request.json();
  const { title, body: announcementBody, instructorId } = body;

  if (!title || !announcementBody || !instructorId) {
    return NextResponse.json(
      { error: 'Missing required fields: title, body, instructorId' },
      { status: 400 },
    );
  }

  const announcement = createAnnouncement(courseId, title, announcementBody, instructorId);
  return NextResponse.json({ announcement }, { status: 201 });
}
