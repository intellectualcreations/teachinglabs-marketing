import { NextRequest, NextResponse } from 'next/server';
import { sendAllDigests, generateStudentDigest, generateInstructorDigest } from '@/lib/digest-service';
import { getCurrentUser } from '@/lib/users';

/**
 * POST /api/digest — triggers sendAllDigests (admin only).
 * GET  /api/digest — returns digest preview for current user.
 */

export async function POST() {
  const user = getCurrentUser('admin');
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const result = sendAllDigests();
  return NextResponse.json({ message: 'Digests sent', ...result });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || undefined;
  const user = getCurrentUser(role);

  let digest;
  if (user.role === 'student') {
    digest = generateStudentDigest(user.id);
  } else if (user.role === 'instructor') {
    digest = generateInstructorDigest(user.id);
  } else {
    return NextResponse.json({ message: 'No digest available for admin users' });
  }

  if (!digest) {
    return NextResponse.json({ error: 'Could not generate digest' }, { status: 404 });
  }

  return NextResponse.json({ preview: digest });
}
