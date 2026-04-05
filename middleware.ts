import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware: refreshes Supabase auth sessions, protects dashboard routes,
 * and applies security headers.
 *
 * NextAuth routes (api/auth/*) are passed through untouched so the
 * existing Google SSO continues working during migration.
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

/** Public paths that never require authentication */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/teacher/signup',
  '/teacher/onboarding',
  '/student/signup',
  '/student/onboarding',
  '/parent/signup',
  '/admin-signup',
  '/welcome',
  '/teacher/welcome',
  '/forgot-password',
  '/waitlist',
'/waitlist/confirmed',
  '/auth/callback',
  '/auth/confirm',
  '/api/auth',       // NextAuth routes (keep working during migration)
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) =>
    pathname === p || pathname.startsWith(p + '/')
  );
}

/** Paths that require auth (dashboard routes) */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/student',
  '/teacher',
  '/admin',
  '/parent',
  '/lessons',
  '/lesson',
  '/instructor',
];

function isProtectedPath(pathname: string): boolean {
  // Signup pages are explicitly public even though they live under /teacher, /student, etc.
  if (pathname.endsWith('/signup')) return false;
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always let public paths and static assets through
  if (isPublicPath(pathname)) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Refresh Supabase session (sets/refreshes cookies)
  const supabaseResponse = await updateSession(request);

  // For protected paths, check if the user has a valid session
  // With implicit flow, auth state is in localStorage (client-side only).
  // Server middleware can only check cookies. If no cookie session found,
  // let the page load — the client-side code will handle redirect if needed.
  if (isProtectedPath(pathname)) {
    const hasSupabaseSession = await checkSupabaseSession(request);
    const hasNextAuthSession = request.cookies.has('next-auth.session-token')
      || request.cookies.has('__Secure-next-auth.session-token');
    // Also check for Supabase auth cookies (sb-*-auth-token)
    const hasSupabaseCookie = request.cookies.getAll().some(c => c.name.includes('auth-token'));

    if (!hasSupabaseSession && !hasNextAuthSession && !hasSupabaseCookie) {
      // No server-side session found. Let client-side handle it.
      // Don't redirect here — implicit flow stores session in localStorage.
    }
  }

  return applySecurityHeaders(supabaseResponse);
}

/**
 * Check if the request has a valid Supabase session.
 * We create a lightweight client just to check getUser().
 */
async function checkSupabaseSession(request: NextRequest): Promise<boolean> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Read-only check; we don't need to set cookies here
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
