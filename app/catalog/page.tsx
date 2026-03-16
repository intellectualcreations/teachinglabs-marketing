'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import {
  courses,
  searchCourses,
  getPublishedCourses,
  searchPublishedCourses,
  SUBJECTS,
  SUBJECT_COLORS,
  type Subject,
} from '@/lib/courses';
import { cogneeSearch } from '@/lib/cognee';

function SubjectBadge({ subject }: { subject: string }) {
  const colors = SUBJECT_COLORS[subject as Subject] ?? 'bg-gray-200 text-gray-800';
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${colors}`}>
      {subject}
    </span>
  );
}

export default function CatalogPage() {
  const [query, setQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [searching, setSearching] = useState(false);

  // Try Cognee semantic search, fall back to client-side
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery);
      setSemanticResults(null);

      if (!searchQuery.trim()) return;

      try {
        setSearching(true);
        const results = await cogneeSearch({
          query: searchQuery,
          searchType: 'CHUNKS',
          datasets: ['teaching-labs-courses'],
          topK: 10,
        });

        // Extract course IDs from Cognee results if available
        if (Array.isArray(results) && results.length > 0) {
          const ids = results
            .map((r: unknown) => {
              const item = r as Record<string, unknown>;
              const text = (item.text || item.content || '') as string;
              // Try to match course titles from the text
              return courses.find((c) =>
                text.toLowerCase().includes(c.title.toLowerCase())
              )?.id;
            })
            .filter(Boolean) as string[];

          if (ids.length > 0) {
            setSemanticResults(ids);
          }
        }
      } catch {
        // Cognee unavailable — client-side fallback is used automatically
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const filteredCourses = useMemo(() => {
    let results = semanticResults
      ? getPublishedCourses().filter((c) => semanticResults.includes(c.id))
      : query.trim()
        ? searchPublishedCourses(query)
        : getPublishedCourses();

    if (activeSubject) {
      results = results.filter((c) => c.subject === activeSubject);
    }

    return results;
  }, [query, activeSubject, semanticResults]);

  const totalModules = (modules: { lessonCount: number }[]) =>
    modules.reduce((sum, m) => sum + m.lessonCount, 0);

  return (
    <>
      <MarketingNav />
      <div
        className="min-h-screen bg-warm-white"
        style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
      >
        {/* Hero header */}
        <section className="bg-warm-white pt-16 pb-10">
          <div className="max-w-[1200px] mx-auto px-12 max-md:px-6 text-center">
            <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4">
              <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
              Explore Our Courses
            </div>
            <h1
              className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary mb-4"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
            >
              Course Catalog
            </h1>
            <p className="text-lg leading-[1.7] text-text-secondary max-w-[600px] mx-auto">
              Browse our full curriculum of K-12 courses designed by experienced
              educators and powered by Teaching Labs AI.
            </p>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="max-w-[1200px] mx-auto px-12 max-md:px-6 pb-6">
          {/* Search bar */}
          <div className="relative max-w-[560px] mx-auto mb-8">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search courses by title, subject, or topic..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted font-body text-[15px] focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all duration-200"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Subject filter chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveSubject(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold font-heading transition-all duration-200 cursor-pointer border ${
                activeSubject === null
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface text-text-secondary border-border hover:border-navy hover:text-navy'
              }`}
            >
              All Subjects
            </button>
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() =>
                  setActiveSubject(activeSubject === subject ? null : subject)
                }
                className={`px-4 py-2 rounded-full text-sm font-semibold font-heading transition-all duration-200 cursor-pointer border ${
                  activeSubject === subject
                    ? 'bg-navy text-white border-navy'
                    : 'bg-surface text-text-secondary border-border hover:border-navy hover:text-navy'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </section>

        {/* Course grid */}
        <section className="max-w-[1200px] mx-auto px-12 max-md:px-6 pb-24">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-card-bg mx-auto mb-4 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-8 h-8 text-text-muted"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                No courses found
              </h3>
              <p className="text-text-secondary text-[15px]">
                Try adjusting your search or filter to find what you&apos;re
                looking for.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/catalog/${course.id}`}
                  className="group bg-card-bg rounded-[20px] border border-border overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Color bar */}
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: course.thumbnail || '#4FA3A5' }}
                  />

                  <div className="p-7">
                    {/* Subject badge + grade */}
                    <div className="flex items-center justify-between mb-3">
                      <SubjectBadge subject={course.subject} />
                      <span className="text-xs font-medium text-text-muted">
                        {course.gradeLevel}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-[17px] font-semibold text-text-primary mb-2 group-hover:text-teal transition-colors duration-200">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[14px] leading-[1.7] text-text-secondary mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-text-muted">
                        {course.modules.length} modules &middot;{' '}
                        {totalModules(course.modules)} lessons
                      </span>
                      <div className="flex items-center gap-2">
                        {course.price > 0 ? (
                          <span className="text-xs font-bold text-coral">
                            ${(course.price / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-teal">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(240,201,93,0.12) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-24 text-center max-md:px-6 max-md:py-16">
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-lg leading-[1.7] text-white/65 mb-8 max-w-[500px] mx-auto">
              Join thousands of teachers bringing AI-powered personalized learning
              to their students.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex items-center font-heading text-[16px] font-bold bg-gold text-deep-navy px-10 py-3.5 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
