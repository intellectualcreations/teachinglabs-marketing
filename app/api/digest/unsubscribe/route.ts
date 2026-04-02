import { NextRequest, NextResponse } from 'next/server';
import { validateUnsubscribeToken } from '@/lib/user-preferences-store';
import { updatePreferences } from '@/lib/user-preferences-store';

/**
 * GET /api/digest/unsubscribe?token=...
 * Validates the token, disables email digest, returns an HTML success page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(
      htmlPage('Invalid Link', 'No unsubscribe token provided. Please check your link and try again.'),
      { status: 400, headers: { 'Content-Type': 'text/html' } },
    );
  }

  const userId = validateUnsubscribeToken(token);
  if (!userId) {
    return new NextResponse(
      htmlPage('Invalid Link', 'This unsubscribe link is invalid or has expired.'),
      { status: 404, headers: { 'Content-Type': 'text/html' } },
    );
  }

  updatePreferences(userId, { emailDigest: false });

  return new NextResponse(
    htmlPage(
      'Unsubscribed',
      'You have been successfully unsubscribed from TeachingLabs email digests. You can re-enable them in your account settings.',
    ),
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  );
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — TeachingLabs</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8f7f4; color: #1a2332; }
    .card { max-width: 480px; padding: 2rem; text-align: center; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #64748b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
