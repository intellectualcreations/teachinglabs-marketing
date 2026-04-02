import { auth } from '@/auth';

/**
 * Get the current session on the server side.
 * Use in Server Components and Route Handlers.
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Require authentication. Throws if not authenticated.
 * Use in Server Components that must be protected.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}
