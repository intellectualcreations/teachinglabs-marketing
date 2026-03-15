import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import MarketingNav from '@/components/shared/MarketingNav';
import { courses, getCourseById, SUBJECT_COLORS, type Subject } from '@/lib/courses';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) return { title: 'Course Not Found' };
  return {
    title: `${course.title} — Teaching Labs`,
    description: course.description,
  };
}

function SubjectBadge({ subject }: { subject: string }) {
  const colors = SUBJECT_COLORS[subject as Subject] ?? 'bg-gray-200 text-gray-800';
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${colors}`}>
      {subject}
    </span>
  );
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessonCount, 0);

  return (
    <>
      <MarketingNav />
      <div
        className="min-h-screen bg-warm-white"
        style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
      >
        {/* Color bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: course.thumbnail || '#4FA3A5' }}
        />

        <div className="max-w-[900px] mx-auto px-12 max-md:px-6 pt-10 pb-24">
          {/* Back link */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-navy transition-colors duration-200 mb-8"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="w-4 h-4"
            >
              <path d="M10 4l-4 4 4 4" />
            </svg>
            Back to Catalog
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <SubjectBadge subject={course.subject} />
              <span className="text-sm font-medium text-text-muted">
                {course.gradeLevel}
              </span>
            </div>

            <h1
              className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary mb-4"
              style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
            >
              {course.title}
            </h1>

            <p className="text-[16px] leading-[1.78] text-text-secondary max-w-[700px]">
              {course.description}
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-10 max-sm:grid-cols-1">
            <div className="bg-card-bg border border-border rounded-xl p-5 text-center">
              <div className="font-heading text-2xl font-bold text-text-primary">
                {course.modules.length}
              </div>
              <div className="text-sm text-text-muted mt-1">Modules</div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-5 text-center">
              <div className="font-heading text-2xl font-bold text-text-primary">
                {totalLessons}
              </div>
              <div className="text-sm text-text-muted mt-1">Lessons</div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-5 text-center">
              <div className="font-heading text-sm font-semibold text-text-primary leading-snug">
                {course.instructor}
              </div>
              <div className="text-sm text-text-muted mt-1">Instructor</div>
            </div>
          </div>

          {/* Modules */}
          <div className="mb-10">
            <h2 className="font-heading text-xl font-bold text-text-primary mb-5">
              Course Modules
            </h2>
            <div className="space-y-3">
              {course.modules.map((mod, i) => (
                <div
                  key={i}
                  className="bg-card-bg border border-border rounded-xl px-6 py-4 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-heading text-sm font-bold text-white flex-shrink-0"
                      style={{
                        backgroundColor: course.thumbnail || '#4FA3A5',
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className="font-heading text-[15px] font-semibold text-text-primary">
                      {mod.title}
                    </span>
                  </div>
                  <span className="text-sm text-text-muted">
                    {mod.lessonCount} lessons
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-10">
            <h2 className="font-heading text-xl font-bold text-text-primary mb-4">
              Topics Covered
            </h2>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-medium bg-card-bg border border-border text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-card-bg border border-border rounded-2xl p-8 text-center">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
              Interested in {course.title}?
            </h3>
            <p className="text-[15px] text-text-secondary mb-5">
              Join the waitlist to get early access when Teaching Labs launches.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex items-center font-heading text-[15px] font-bold bg-gold text-deep-navy px-8 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(240,201,93,0.35)] transition-all duration-200"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
