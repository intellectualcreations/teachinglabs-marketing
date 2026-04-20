import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side PKCE code exchange.
 * 
 * The PKCE code verifier is stored in cookies by @supabase/ssr.
 * This route handler has access to those cookies (unlike client-side code).
 * After successful exchange, redirects to /auth/callback for role routing.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=No+auth+code+provided`);
  }

  const response = NextResponse.redirect(`${origin}/auth/callback`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('PKCE exchange failed:', error.message);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Sign-in failed. Please try again.')}`);
  }

  return response;
}
