import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side auth callback — handles the PKCE code exchange.
 * 
 * OAuth (Google/Microsoft) and magic links both redirect here with ?code=
 * The PKCE verifier is stored in cookies by @supabase/ssr, so we must
 * exchange the code server-side where we have cookie access.
 * 
 * After exchanging, we redirect to /auth/complete (client page) for
 * role-based routing.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const error = searchParams.get('error_description');

  // Pass errors to the client page
  if (error) {
    return NextResponse.redirect(`${origin}/auth/complete?error=${encodeURIComponent(error)}`);
  }

  // PKCE code exchange (OAuth + magic links)
  if (code) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${origin}/auth/complete`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('Code exchange failed:', exchangeError.message);
      return NextResponse.redirect(`${origin}/auth/complete?error=auth_failed`);
    }

    return response;
  }

  // Token hash (magic link fallback) — pass to client
  if (token_hash && type) {
    return NextResponse.redirect(
      `${origin}/auth/complete?token_hash=${token_hash}&type=${type}`
    );
  }

  return NextResponse.redirect(`${origin}/login`);
}
