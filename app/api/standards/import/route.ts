import { NextRequest, NextResponse } from 'next/server';
import { importStandards } from '@/lib/standards-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { framework, standards } = body as {
      framework?: string;
      standards?: Array<{
        code: string;
        shortCode: string;
        title: string;
        description: string;
        subject: 'Math' | 'ELA' | 'Science' | 'Social Studies';
        gradeLevel: string;
        domain?: string;
        cluster?: string;
      }>;
    };

    if (!framework || !standards || !Array.isArray(standards) || standards.length === 0) {
      return NextResponse.json(
        { error: 'framework and a non-empty standards array are required' },
        { status: 400 },
      );
    }

    // Validate each standard has required fields
    for (const s of standards) {
      if (!s.code || !s.shortCode || !s.title || !s.description || !s.subject || !s.gradeLevel) {
        return NextResponse.json(
          { error: 'Each standard requires code, shortCode, title, description, subject, and gradeLevel' },
          { status: 400 },
        );
      }
    }

    const mapped = standards.map((s) => ({
      ...s,
      framework,
    }));

    const result = importStandards(mapped);

    return NextResponse.json({
      success: true,
      imported: result.imported,
      framework: result.framework,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
