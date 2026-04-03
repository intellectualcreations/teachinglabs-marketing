import { NextRequest, NextResponse } from 'next/server';
import {
  searchStandards,
  getSubjects,
  getGradeLevels,
  getFrameworks,
  getDomains,
  getAllStandards,
  getImportHistory,
} from '@/lib/standards-store';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Meta queries
  if (searchParams.get('subjects') === 'true') {
    return NextResponse.json({ subjects: getSubjects() });
  }
  if (searchParams.get('grades') === 'true') {
    return NextResponse.json({ grades: getGradeLevels() });
  }
  if (searchParams.get('frameworks') === 'true') {
    return NextResponse.json({ frameworks: getFrameworks() });
  }
  if (searchParams.has('domains')) {
    const subject = searchParams.get('domains') ?? '';
    return NextResponse.json({ domains: getDomains(subject) });
  }
  if (searchParams.get('imports') === 'true') {
    return NextResponse.json({ imports: getImportHistory() });
  }
  if (searchParams.get('all') === 'true') {
    return NextResponse.json({ standards: getAllStandards(), total: getAllStandards().length });
  }

  // Search
  const q = searchParams.get('q') ?? '';
  const subject = searchParams.get('subject') ?? undefined;
  const grade = searchParams.get('grade') ?? undefined;
  const framework = searchParams.get('framework') ?? undefined;

  const results = searchStandards(q, {
    subject,
    gradeLevel: grade,
    framework,
  });

  return NextResponse.json({ standards: results, total: results.length });
}
