export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/lessons/:path*',
    '/lesson/:path*',
  ],
};
