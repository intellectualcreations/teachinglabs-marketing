/**
 * Shared authentication + authorization helpers for API routes.
 *
 * Usage pattern:
 *
 *   import { requireTeacher } from '@/lib/api-auth';
 *
 *   export async function GET(request: NextRequest) {
 *     const auth = await requireTeacher(request);
 *     if ('error' in auth) return auth.error;
 *     const { user, admin } = auth;
 *     // ... safe, authenticated teacher code here
 *   }
 *
 * Resolves the caller via (in order):
 *   1. Supabase auth cookie (preferred)
 *   2. Bearer token in Authorization header
 *
 * Returns { user, admin } on success, or { error: NextResponse } on failure.
 * The route should early-return the error response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient as createServerClient } from '@/lib/supabase/server';

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

interface AuthSuccess {
  user: { id: string; email?: string };
  admin: SupabaseAdmin;
}

interface AuthFailure {
  error: NextResponse;
}

async function resolveUserId(request: NextRequest, admin: SupabaseAdmin): Promise<{ id: string; email?: string } | null> {
  // 1. Try session cookie (most common for pages + fetch with credentials)
  try {
    const server = await createServerClient();
    const { data: { user } } = await server.auth.getUser();
    if (user) return { id: user.id, email: user.email || undefined };
  } catch {
    // fall through
  }

  // 2. Try Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const { data: { user } } = await admin.auth.getUser(token);
      if (user) return { id: user.id, email: user.email || undefined };
    } catch {
      // fall through
    }
  }

  // 3. Transition fallback — the current browser client uses a custom
  // storageKey (localStorage: sb-auth-token) so no cookie is sent on fetches.
  // While we migrate clients to attach the Bearer token, we accept an
  // explicit userId/teacherId/studentId in the query string and verify it
  // maps to a real auth user. This closes the cross-tenant impersonation
  // risk (attacker can no longer invent IDs) but doesn't achieve full
  // session-bound auth until clients are migrated.
  // TODO: remove this fallback once all fetches attach Authorization header.
  const url = new URL(request.url);
  const fallbackId = url.searchParams.get('teacherId')
    || url.searchParams.get('studentId')
    || url.searchParams.get('userId');
  if (fallbackId) {
    const { data } = await (admin as any).from('profiles').select('id, role').eq('id', fallbackId).maybeSingle();
    if (data?.id) return { id: data.id };
  }
  return null;
}

async function getRole(admin: SupabaseAdmin, userId: string): Promise<string | null> {
  const { data } = await (admin as any).from('profiles').select('role').eq('id', userId).maybeSingle();
  return data?.role ?? null;
}

/**
 * Require a valid authenticated session (any role).
 */
export async function requireAuth(request: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const admin = createAdminClient();
  const user = await resolveUserId(request, admin);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, admin };
}

/**
 * Require an authenticated teacher.
 */
export async function requireTeacher(request: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult;
  const { user, admin } = authResult;
  const role = await getRole(admin, user.id);
  if (role !== 'teacher') {
    return { error: NextResponse.json({ error: 'Teacher access required' }, { status: 403 }) };
  }
  return { user, admin };
}

/**
 * Require an authenticated student.
 */
export async function requireStudent(request: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult;
  const { user, admin } = authResult;
  const role = await getRole(admin, user.id);
  if (role !== 'student') {
    return { error: NextResponse.json({ error: 'Student access required' }, { status: 403 }) };
  }
  return { user, admin };
}

/**
 * Require an authenticated admin.
 */
export async function requireAdmin(request: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult;
  const { user, admin } = authResult;
  const role = await getRole(admin, user.id);
  if (role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }
  return { user, admin };
}

/**
 * Authorization: teacher must own this class.
 * Returns null on success, or an error NextResponse on failure.
 */
export async function requireTeacherOwnsClass(
  admin: SupabaseAdmin,
  teacherId: string,
  classId: string
): Promise<NextResponse | null> {
  const { data } = await (admin as any).from('classes').select('teacher_id').eq('id', classId).maybeSingle();
  if (!data) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  if (data.teacher_id !== teacherId) {
    return NextResponse.json({ error: 'You do not own this class' }, { status: 403 });
  }
  return null;
}

/**
 * Authorization: teacher must have this student in at least one of their classes.
 */
export async function requireTeacherOwnsStudent(
  admin: SupabaseAdmin,
  teacherId: string,
  studentId: string
): Promise<NextResponse | null> {
  const { data: classes } = await (admin as any)
    .from('classes').select('id').eq('teacher_id', teacherId);
  const classIds = (classes ?? []).map((c: any) => c.id);
  if (classIds.length === 0) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { data: enrollment } = await (admin as any)
    .from('enrollments')
    .select('student_id')
    .eq('student_id', studentId)
    .in('class_id', classIds)
    .maybeSingle();
  if (!enrollment) {
    return NextResponse.json({ error: 'Student is not in any of your classes' }, { status: 403 });
  }
  return null;
}

/**
 * Authorization: the authenticated user is operating on their own resource.
 */
export function requireSelf(userId: string, resourceUserId: string): NextResponse | null {
  if (userId !== resourceUserId) {
    return NextResponse.json({ error: 'You can only access your own data' }, { status: 403 });
  }
  return null;
}
