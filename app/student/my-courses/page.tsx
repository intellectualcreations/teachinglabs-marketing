'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';

interface CourseModule {
  title: string;
  lessonCount: number;
}

interface EnrollmentWithCourse {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed';
  progress: number;
  completedModules: string[];
  course: {
    title: string;
    subject: string;
    instructor: string;
    gradeLevel: string;
    thumbnail?: string;
    modules: CourseModule[];
  } | null;
}

const SUBJECT_COLORS: Record<string, string> = {
  Math: 'bg-teal text-white',
  Science: 'bg-[#059669] text-white',
  English: 'bg-coral text-white',
  'Social Studies': 'bg-navy text-white',
  Electives: 'bg-gold text-deep-navy',
};

function SubjectBadge({ subject }: { subject: string }) {
  const colors = SUBJECT_COLORS[subject] ?? 'bg-gray-200 text-gray-800';
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${colors}`}>
      {subject}
    </span>
  );
}

function CheckIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-teal flex-shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-text-muted/40 flex-shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
    </svg>
  );
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingModule, setTogglingModule] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/enrollments/student/demo-student')
      .then((res) => res.json())
      .then((data) => {
        setEnrollments(data.enrollments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleModuleToggle(enrollment: EnrollmentWithCourse, moduleTitle: string) {
    if (enrollment.completedModules.includes(moduleTitle)) return;
    const key = `${enrollment.id}:${moduleTitle}`;
    setTogglingModule(key);

    try {
      const res = await fetch(`/api/enrollments/${enrollment.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollments((prev) =>
          prev.map((e) =>
            e.id === enrollment.id
              ? { ...e, ...data.enrollment, course: e.course }
              : e,
          ),
        );
      }
    } finally {
      setTogglingModule(null);
    }
  }

  return (
    <>
      <MarketingNav />
      <div
        className="min-h-screen bg-warm-white"
        style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
      >
        <div className="max-w-[1100px] mx-auto px-12 max-md:px-6 pt-10 pb-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link
              href="/student/dashboard"
              className="text-teal hover:text-navy font-medium transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">My Courses</span>
          </div>

          {/* Header */}
          <h1
            className="font-heading font-extrabold tracking-[-1px] text-text-primary mb-8"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            My Courses
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
            </div>
          ) : enrollments.length === 0 ? (
            /* Empty state */
            <div className="bg-card-bg border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-teal/60">
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-lg text-text-primary mb-2">
                You haven&apos;t enrolled in any courses yet.
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Browse our catalog to find courses that interest you.
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            /* Enrollment cards grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;

                return (
                  <div
                    key={enrollment.id}
                    className="bg-card-bg border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Color bar */}
                    <div
                      className="h-1.5 w-full"
                      style={{ backgroundColor: course.thumbnail || '#4FA3A5' }}
                    />

                    <div className="p-6">
                      {/* Header: badge + completed marker */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SubjectBadge subject={course.subject} />
                          <span className="text-xs text-text-muted">
                            {course.gradeLevel}
                          </span>
                        </div>
                        {enrollment.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-gold/20 text-gold px-3 py-1 rounded-full border border-gold/30">
                            Completed ✓
                          </span>
                        )}
                      </div>

                      {/* Title + instructor */}
                      <h2 className="font-heading font-bold text-lg text-text-primary mb-1">
                        {course.title}
                      </h2>
                      <p className="text-sm text-text-secondary mb-4">
                        {course.instructor}
                      </p>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-text-muted font-medium">Progress</span>
                          <span className="font-bold text-text-primary">
                            {enrollment.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${enrollment.progress}%`,
                              backgroundColor:
                                enrollment.status === 'completed'
                                  ? '#F0C95D'
                                  : '#4FA3A5',
                            }}
                          />
                        </div>
                      </div>

                      {/* Module checklist */}
                      <div className="mb-5">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
                          Modules
                        </h3>
                        <div className="space-y-1.5">
                          {course.modules.map((mod) => {
                            const done = enrollment.completedModules.includes(mod.title);
                            const toggling = togglingModule === `${enrollment.id}:${mod.title}`;
                            return (
                              <button
                                key={mod.title}
                                onClick={() => handleModuleToggle(enrollment, mod.title)}
                                disabled={done || toggling}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                                  done
                                    ? 'bg-teal/5 cursor-default'
                                    : 'hover:bg-teal/5 cursor-pointer'
                                } ${toggling ? 'opacity-50' : ''}`}
                              >
                                <CheckIcon checked={done} />
                                <span
                                  className={`text-sm ${
                                    done
                                      ? 'text-text-secondary line-through'
                                      : 'text-text-primary'
                                  }`}
                                >
                                  {mod.title}
                                </span>
                                <span className="text-xs text-text-muted ml-auto">
                                  {mod.lessonCount} lessons
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* CTA */}
                      {enrollment.status !== 'completed' ? (
                        <Link
                          href={`/catalog/${enrollment.courseId}`}
                          className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                        >
                          Continue Learning
                        </Link>
                      ) : (
                        <Link
                          href={`/catalog/${enrollment.courseId}`}
                          className="inline-flex items-center font-heading text-sm font-semibold text-teal hover:text-navy transition-colors"
                        >
                          View Course Details →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
