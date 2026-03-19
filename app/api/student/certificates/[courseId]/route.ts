import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const userId = request.nextUrl.searchParams.get('userId') || 'student';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate of Completion</title>
  <style>
    body { font-family: Georgia, serif; text-align: center; padding: 60px; background: #fffdf5; }
    .cert { border: 8px double #c5a028; padding: 60px; max-width: 700px; margin: auto; }
    h1 { color: #c5a028; font-size: 2.5em; margin-bottom: 10px; }
    h2 { color: #333; font-size: 1.8em; }
    .seal { font-size: 4em; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="seal">🎓</div>
    <h1>Certificate of Completion</h1>
    <p>This certifies that</p>
    <h2>${userId}</h2>
    <p>has successfully completed</p>
    <h2>Course ${courseId}</h2>
    <p>on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p style="margin-top:40px;color:#888">TeachingLabs — Powered by Knowledge</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
