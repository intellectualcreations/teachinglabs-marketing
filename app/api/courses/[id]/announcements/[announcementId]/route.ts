import { NextResponse } from 'next/server';
import {
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/announcement-store';

interface RouteParams {
  params: Promise<{ id: string; announcementId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { announcementId } = await params;
  const announcement = getAnnouncement(announcementId);

  if (!announcement) {
    return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
  }

  return NextResponse.json({ announcement });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { announcementId } = await params;
  const body = await request.json();
  const { title, body: announcementBody } = body;

  const announcement = updateAnnouncement(announcementId, {
    title,
    body: announcementBody,
  });

  if (!announcement) {
    return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
  }

  return NextResponse.json({ announcement });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { announcementId } = await params;
  const deleted = deleteAnnouncement(announcementId);

  if (!deleted) {
    return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
