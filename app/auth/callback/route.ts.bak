import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { UserRole } from '@/lib/supabase/types';

/**
 * Auth callback handler for Supabase magic link.
 *
 * Supabase may redirect here in two ways:
 * 1. PKCE flow: ?code=xxx (server can exchange)
 * 2. Token/hash flow: #access_token=xxx (only client can read)
 *
 * For case 2, we serve a client page that extracts the hash and sets the session.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? null;
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  // Use the configured site URL or forwarded host, never localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const origin = siteUrl
    || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null)
    || request.nextUrl.origin;

  // If Supabase sent an error (e.g. expired link)
  if (errorParam) {
    console.error('Auth callback error:', errorParam, errorDesc);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDesc || errorParam)}`, origin)
    );
  }

  // If no code parameter, the token might be in the URL hash (fragment).
  // Serve a lightweight client page that extracts the hash and redirects.
  if (!code) {
    const html = `<!DOCTYPE html>
<html><head><title>Signing in...</title></head>
<body>
<p style="text-align:center;margin-top:100px;font-family:system-ui;color:#666;">
  Signing you in...
</p>
<script>
  // Supabase may put tokens in the hash fragment
  (async function() {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Let Supabase client pick up the session from the hash
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
        '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}'
      );
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        window.location.href = '/login?error=' + encodeURIComponent(error.message);
        return;
      }
      // Session is set, redirect to determine the right page
      window.location.href = '/auth/callback?code=session_set&from_hash=1';
      return;
    }
    // No hash and no code — something went wrong
    window.location.href = '/login?error=missing_auth_params';
  })();
</script>
</body></html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // PKCE flow: exchange the code for a session
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

  // If this is from our hash handler, just check the session
  const fromHash = searchParams.get('from_hash');
  if (!fromHash) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('Auth callback exchange error:', exchangeError.message);
      return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
    }
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
      const onboarded = user.user_metadata?.onboarded === true;
      if (!onboarded) {
        return new URL('/student/onboarding', origin);
      }
    }

    // New teachers go to onboarding (soul quiz) first
    if (role === 'teacher') {
      const { data: soul } = await supabase
        .from('teacher_souls')
        .select('completed_at')
        .eq('teacher_id', user.id)
        .single();

      if (!soul?.completed_at) {
        return new URL('/teacher/onboarding', origin);
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
