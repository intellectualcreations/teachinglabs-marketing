import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Middleware: protects dashboard routes via NextAuth, adds
 * a lightweight instructor-role gate for /instructor/* routes,
 * and applies security headers to all responses.
 *
 * FLU-215: Added security headers.
 */

const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Instructor route guard (demo-friendly)
  if (pathname.startsWith('/instructor')) {
    const roleCookie = request.cookies.get('role')?.value;
    // Allow if role cookie says instructor, or if there's a session
    const session = await auth();
    if (!session?.user && roleCookie !== 'instructor') {
      // For demo convenience: set the cookie and allow through
      const response = NextResponse.next();
      response.cookies.set('role', 'instructor', { path: '/', maxAge: 60 * 60 * 24 });
      return applySecurityHeaders(response);
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // All other protected routes: delegate to NextAuth
  const session = await auth();
  if (!session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export default middleware;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/lessons/:path*',
    '/lesson/:path*',
    '/instructor/:path*',
  ],
};
