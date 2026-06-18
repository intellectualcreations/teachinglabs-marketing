import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/export/waitlist?password=<ADMIN_PASSWORD>
 *
 * Returns a CSV download of all waitlist signups.
 * Protected by ADMIN_PASSWORD env var — returns 401 if missing/incorrect.
 *
 * CSV columns: First Name, Last Name, Email, Role, Signed Up At
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

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, anonKey } = getSupabaseConfig();

    const response = await fetch(
      `${url}/rest/v1/waitlist?select=first_name,last_name,email,role,created_at&order=created_at.desc`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Waitlist export fetch error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist data.' },
        { status: 500 }
      );
    }

    const rows: Array<{
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      role: string | null;
      created_at: string | null;
    }> = await response.json();

    const header = ['First Name', 'Last Name', 'Email', 'Role', 'Signed Up At'].join(',');
    const csvRows = rows.map((row) =>
      [
        escapeCsvField(row.first_name),
        escapeCsvField(row.last_name),
        escapeCsvField(row.email),
        escapeCsvField(row.role),
        escapeCsvField(row.created_at),
      ].join(',')
    );

    const csv = [header, ...csvRows].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="waitlist-export.csv"',
      },
    });
  } catch (error) {
    console.error('Waitlist export API error:', error);
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
