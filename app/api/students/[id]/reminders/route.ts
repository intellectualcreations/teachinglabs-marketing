import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingReminders } from '@/lib/deadline-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const reminders = getUpcomingReminders(48);
  return NextResponse.json({ studentId: id, reminders });
}
