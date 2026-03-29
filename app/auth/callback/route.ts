import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { UserRole } from '@/lib/supabase/types';

/**
 * Auth callback handler for Supabase magic link.
 * Exchanges the auth code for a session, then redirects
 * to the appropriate dashboard based on the user's role.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? null;

  // Use the configured site URL or forwarded host, never localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const origin = siteUrl
    || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null)
    || request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin));
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Auth callback exchange error:', exchangeError.message);
    return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
  }

  // If a specific redirect was requested, honor it
  if (next) {
    return NextResponse.redirect(new URL(next, origin));
  }

  // Otherwise, route based on user role from the profiles table
  const redirectUrl = await getRedirectForUser(supabase, origin);
  return NextResponse.redirect(redirectUrl);
}

async function getRedirectForUser(
  supabase: ReturnType<typeof createServerClient>,
  origin: string
): Promise<URL> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new URL('/login', origin);
    }

    // Check profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role: UserRole = profile?.role ?? 'teacher';

    // New students go to onboarding first
    if (role === 'student') {
      // Check if student has completed onboarding already
      const onboarded = user.user_metadata?.onboarded === true;
      if (!onboarded) {
        return new URL('/student/onboarding', origin);
      }
    }

    const dashboardRoutes: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
    };

    return new URL(dashboardRoutes[role] || '/teacher/dashboard', origin);
  } catch {
    // Fallback to teacher dashboard if profile lookup fails
    return new URL('/teacher/dashboard', origin);
  }
}
