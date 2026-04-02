import { NextRequest, NextResponse } from 'next/server';
import { getStudentCertificates } from '@/lib/certificate-store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(getStudentCertificates(id));
}
