import { NextResponse } from 'next/server';
import { users } from '@/lib/users';
import { getAllEnrollments } from '@/lib/enrollment-store';

/**
 * GET /api/admin/users
 * Returns all users with enrollment counts.
 */
export async function GET() {
  const enrollments = getAllEnrollments();

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    enrollmentCount: enrollments.filter((e) => e.studentId === u.id).length,
  }));

  return NextResponse.json({ users: result });
}
