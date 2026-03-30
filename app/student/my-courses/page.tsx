'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import { createClient } from '@/lib/supabase/client';

interface EnrolledCourse {
  id: string;
  classId: string;
  enrolledAt: string;
  status: 'active' | 'completed';
  className: string;
  subject: string | null;
  gradeLevel: string | null;
  teacherName: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  Math: 'bg-teal text-white',
  Mathematics: 'bg-teal text-white',
  Algebra: 'bg-teal text-white',
  Science: 'bg-[#059669] text-white',
  Biology: 'bg-[#059669] text-white',
  Chemistry: 'bg-[#059669] text-white',
  Physics: 'bg-[#059669] text-white',
  English: 'bg-coral text-white',
  ELA: 'bg-coral text-white',
  Reading: 'bg-coral text-white',
  Writing: 'bg-coral text-white',
  'Social Studies': 'bg-navy text-white',
  History: 'bg-navy text-white',
  Geography: 'bg-navy text-white',
  Electives: 'bg-gold text-deep-navy',
};

function getSubjectColor(subject: string | null): string {
  if (!subject) return 'bg-gray-200 text-gray-800';
  // Check exact match first
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
  // Check partial match
  const key = subject.toLowerCase();
  for (const [k, v] of Object.entries(SUBJECT_COLORS)) {
    if (key.includes(k.toLowerCase())) return v;
  }
  return 'bg-gray-200 text-gray-800';
}

function getSubjectBarColor(subject: string | null): string {
  if (!subject) return '#4FA3A5';
  const key = subject.toLowerCase();
  if (key.includes('math') || key.includes('algebra')) return '#4FA3A5';
  if (key.includes('science') || key.includes('bio') || key.includes('chem') || key.includes('phys')) return '#059669';
  if (key.includes('english') || key.includes('ela') || key.includes('read') || key.includes('writ')) return '#E8735A';
  if (key.includes('social') || key.includes('history') || key.includes('geo')) return '#1F3A5F';
  return '#4FA3A5';
}

function SubjectBadge({ subject }: { subject: string | null }) {
  if (!subject) return null;
  const colors = getSubjectColor(subject);
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${colors}`}>
      {subject}
    </span>
  );
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch active enrollments for this student
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id)
          .eq('status', 'active');

        const enrollments = enrollmentData ?? [];

        if (enrollments.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const classIds = enrollments.map((e: { class_id: string }) => e.class_id);

        // Fetch classes
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds);

        const classRows = classData ?? [];

        // Fetch teacher profiles
        const teacherIds = [...new Set(classRows.map((c: { teacher_id: string }) => c.teacher_id))];
        const { data: teacherData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', teacherIds);

        const teachers = teacherData ?? [];
        const teacherMap = new Map(teachers.map((t: { id: string; display_name: string }) => [t.id, t]));
        const classMap = new Map(classRows.map((c: { id: string }) => [c.id, c]));

        // Build enrolled courses
        const enriched: EnrolledCourse[] = enrollments.map((enrollment: { id: string; class_id: string; enrolled_at: string; status: string }) => {
          const cls = classMap.get(enrollment.class_id) as { id: string; name: string; subject: string | null; grade_level: string | null; teacher_id: string } | undefined;
          const teacher = cls ? teacherMap.get(cls.teacher_id) as { display_name: string } | undefined : undefined;

          return {
            id: enrollment.id,
            classId: enrollment.class_id,
            enrolledAt: enrollment.enrolled_at,
            status: enrollment.status as 'active' | 'completed',
            className: cls?.name || 'Unknown Class',
            subject: cls?.subject || null,
            gradeLevel: cls?.grade_level || null,
            teacherName: teacher?.display_name || 'Teacher',
          };
        });

        setCourses(enriched);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolledCourses();
  }, []);

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
          ) : courses.length === 0 ? (
            /* Empty state */
            <div className="bg-card-bg border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-teal/60">
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-lg text-text-primary mb-2">
                You&apos;re not enrolled in any courses yet.
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Join a class with your class code to get started.
              </p>
              <Link
                href="/student/signup"
                className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                Join a Class
              </Link>
            </div>
          ) : (
            /* Enrollment cards grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card-bg border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Color bar */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: getSubjectBarColor(course.subject) }}
                  />

                  <div className="p-6">
                    {/* Header: badge + grade */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <SubjectBadge subject={course.subject} />
                        {course.gradeLevel && (
                          <span className="text-xs text-text-muted">
                            {course.gradeLevel}
                          </span>
                        )}
                      </div>
                      {course.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-gold/20 text-gold px-3 py-1 rounded-full border border-gold/30">
                          Completed ✓
                        </span>
                      )}
                    </div>

                    {/* Title + instructor */}
                    <h2 className="font-heading font-bold text-lg text-text-primary mb-1">
                      {course.className}
                    </h2>
                    <p className="text-sm text-text-secondary mb-4">
                      {course.teacherName}
                    </p>

                    {/* Enrolled date */}
                    <p className="text-xs text-text-muted mb-5">
                      Enrolled {new Date(course.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    {/* CTA */}
                    <Link
                      href={`/student/main?class=${course.classId}`}
                      className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                    >
                      Go to Class
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
