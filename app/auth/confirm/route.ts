import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side auth code exchange for PKCE flow.
 * OAuth providers (Google, Microsoft) redirect here with ?code=...
 * We exchange the code server-side where the PKCE verifier cookie lives,
 * then redirect to /auth/callback for client-side role routing.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error_description');

  if (error) {
    console.error('Auth confirm error:', error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can fail in some edge cases
          }
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('Code exchange failed:', exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Session set via cookies — redirect to client page for role routing
  return NextResponse.redirect(`${origin}/auth/callback?exchanged=true`);
}
