'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Certificate, Printer, ArrowLeft } from '@phosphor-icons/react';

interface CertificateData {
  studentName: string;
  courseTitle: string;
  courseSubject: string;
  instructor: string;
  completionDate: string;
  lessonCount: number;
}

export default function CertificatePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/certificates/${courseId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          setError(body.error || 'Failed to load certificate');
          return;
        }
        const json = await res.json();
        setData(json.certificate);
      })
      .catch(() => setError('Failed to load certificate'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="bg-card-bg border border-border rounded-2xl p-10 text-center max-w-md">
          <Certificate size={48} weight="fill" className="text-coral/60 mx-auto mb-4" />
          <h1 className="font-heading font-bold text-xl text-text-primary mb-2">
            Certificate Not Available
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {error || 'This certificate is not available yet.'}
          </p>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-navy px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(data.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Top bar */}
      <div className="bg-card-bg border-b border-border px-6 py-3 flex items-center justify-between print:hidden">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-teal transition-colors font-medium"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-navy px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          <Printer size={16} weight="bold" />
          Print Certificate
        </button>
      </div>

      {/* Certificate */}
      <div className="flex items-center justify-center p-8 print:p-0">
        <div className="w-full max-w-[800px] aspect-[1.414/1] bg-white rounded-2xl shadow-xl border-2 border-gold/30 relative overflow-hidden print:rounded-none print:shadow-none print:border-0 print:max-w-none">
          {/* Decorative border */}
          <div className="absolute inset-4 border-2 border-gold/40 rounded-xl pointer-events-none" />
          <div className="absolute inset-6 border border-gold/20 rounded-lg pointer-events-none" />

          {/* Corner decorations */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-3 border-l-3 border-teal/60 rounded-tl-lg" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-3 border-r-3 border-teal/60 rounded-tr-lg" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-3 border-l-3 border-teal/60 rounded-bl-lg" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-3 border-r-3 border-teal/60 rounded-br-lg" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 py-10 text-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                  <rect x="4" y="4" width="16" height="4" rx="1" fill="#4FA3A5" />
                  <rect x="9" y="8" width="6" height="13" rx="1" fill="#4FA3A5" />
                </svg>
              </div>
              <span className="font-heading font-bold text-sm text-navy">TeachingLabs</span>
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-text-muted font-medium mb-3">
              Certificate of Completion
            </p>

            <div className="w-20 h-0.5 bg-gold/60 rounded-full mb-5" />

            <p className="text-sm text-text-secondary mb-2">
              This certifies that
            </p>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy mb-3">
              {data.studentName}
            </h1>

            <p className="text-sm text-text-secondary mb-2">
              has successfully completed the course
            </p>

            <h2 className="font-heading font-bold text-xl sm:text-2xl text-teal mb-1">
              {data.courseTitle}
            </h2>

            <p className="text-xs text-text-muted mb-6">
              {data.courseSubject} · {data.lessonCount} lessons
            </p>

            <div className="w-16 h-0.5 bg-gold/40 rounded-full mb-6" />

            <div className="flex items-center gap-12 text-center">
              <div>
                <p className="text-xs text-text-muted mb-1">Date</p>
                <p className="text-sm font-semibold text-text-primary">{formattedDate}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Instructor</p>
                <p className="text-sm font-semibold text-text-primary">{data.instructor}</p>
              </div>
            </div>

            {/* Seal */}
            <div className="mt-6 w-14 h-14 rounded-full border-2 border-gold/50 flex items-center justify-center">
              <Certificate size={28} weight="fill" className="text-gold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
