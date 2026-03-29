import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  markAttendance,
  getAttendanceForSession,
  AttendanceStatus,
} from '@/lib/attendance-store';

const VALID_STATUSES: AttendanceStatus[] = ['present', 'absent', 'late'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const body = await req.json();
  const entries: { studentId: string; status: AttendanceStatus }[] = Array.isArray(body)
    ? body
    : [body];

  for (const entry of entries) {
    if (!entry.studentId || !VALID_STATUSES.includes(entry.status)) {
      return NextResponse.json(
        { error: 'Each entry requires studentId and status (present|absent|late)' },
        { status: 400 },
      );
    }
  }

  const results = entries.map((e) => markAttendance(sessionId, e.studentId, e.status));
  return NextResponse.json(results, { status: 201 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  const records = getAttendanceForSession(sessionId);
  return NextResponse.json(records);
}
