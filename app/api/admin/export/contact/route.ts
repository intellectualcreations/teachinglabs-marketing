import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, isValidSession } from '../../login/route';

/**
 * GET /api/admin/export/contact?password=<ADMIN_PASSWORD>
 *
 * Returns a CSV download of all contact form submissions.
 * Protected by ADMIN_PASSWORD env var — returns 401 if missing/incorrect.
 *
 * CSV columns: First Name, Last Name, Email, Role, Subject, Message, Source, Submitted At
 */

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use the service-role key for admin reads so Row-Level Security does not
  // hide rows. This key is server-side only and must never be exposed to the
  // browser. Falls back to the anon key if the service key is not configured.
  const readKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !readKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return { url, anonKey: readKey };
}

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const password = req.nextUrl.searchParams.get('password');
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    const authed =
      isValidSession(session) ||
      (!!password && !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, anonKey } = getSupabaseConfig();

    const response = await fetch(
      `${url}/rest/v1/contact_submissions?select=first_name,last_name,email,role,subject,message,source,created_at&order=created_at.desc`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contact export fetch error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch contact submission data.' },
        { status: 500 }
      );
    }

    const rows: Array<{
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      role: string | null;
      subject: string | null;
      message: string | null;
      source: string | null;
      created_at: string | null;
    }> = await response.json();

    const header = ['First Name', 'Last Name', 'Email', 'Role', 'Subject', 'Message', 'Source', 'Submitted At'].join(',');
    const csvRows = rows.map((row) =>
      [
        escapeCsvField(row.first_name),
        escapeCsvField(row.last_name),
        escapeCsvField(row.email),
        escapeCsvField(row.role),
        escapeCsvField(row.subject),
        escapeCsvField(row.message),
        escapeCsvField(row.source),
        escapeCsvField(row.created_at),
      ].join(',')
    );

    const csv = [header, ...csvRows].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="contact-submissions-export.csv"',
      },
    });
  } catch (error) {
    console.error('Contact export API error:', error);
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
