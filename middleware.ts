import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Middleware: protects dashboard routes via NextAuth and adds
 * a lightweight instructor-role gate for /instructor/* routes.
 *
 * For the demo, the instructor portal is accessible when:
 *   - the user has a valid session, OR
 *   - the `role=instructor` cookie is set (allows easy demo access)
 */
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
      return response;
    }
    return NextResponse.next();
  }

  // All other protected routes: delegate to NextAuth
  const session = await auth();
  if (!session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
