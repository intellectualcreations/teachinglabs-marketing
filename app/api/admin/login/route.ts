import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * POST /api/admin/login
 * Body: { password: string }
 * On success, sets an httpOnly session cookie and returns { ok: true }.
 * The cookie value is an HMAC of a fixed marker keyed by ADMIN_PASSWORD,
 * so it cannot be forged without knowing the password, and the password
 * itself is never stored in the cookie.
 */

export const ADMIN_COOKIE = 'tl_admin_session';

export function sessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD || '';
  return createHmac('sha256', secret).update('tl-admin-authenticated-v1').digest('hex');
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const expected = sessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Admin access is not configured.' },
      { status: 500 }
    );
  }

  // Constant-time comparison
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
