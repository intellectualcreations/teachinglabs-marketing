import { NextRequest, NextResponse } from 'next/server';
import { issueCertificate } from '@/lib/certificate-store';

export async function POST(req: NextRequest) {
  const { studentId, courseId, courseName } = await req.json();
  if (!studentId || !courseId) {
    return NextResponse.json({ error: 'studentId and courseId required' }, { status: 400 });
  }
  const cert = issueCertificate(studentId, courseId, courseName);
  return NextResponse.json(cert, { status: 201 });
}
