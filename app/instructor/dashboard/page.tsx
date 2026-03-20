'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationOptIn from '@/components/shared/NotificationOptIn';

interface CourseWithStats {
  id: string;
  title: string;
  description: string;
  subject: string;
  modules: { title: string; lessonCount: number }[];
  instructor: string;
  gradeLevel: string;
  thumbnail?: string;
  enrollmentCount: number;
  avgProgress: number;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
  role: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  Math: 'bg-teal text-white',
  Science: 'bg-[#059669] text-white',
  English: 'bg-coral text-white',
  'Social Studies': 'bg-navy text-white',
  Electives: 'bg-gold text-deep-navy',
};

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/instructor/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setInstructor(data.instructor || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const avgProgress = courses.length > 0
    ? Math.round(
        courses.reduce((sum, c) => sum + c.avgProgress * c.enrollmentCount, 0) /
          Math.max(totalStudents, 1),
      )
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Instructor Dashboard
        </h1>
        {instructor && (
          <p className="text-text-secondary mt-1">
            Welcome back, <span className="font-semibold text-teal">{instructor.name}</span>
          </p>
        )}
      </div>

      {/* Push notification opt-in */}
      <div className="mb-6">
        <NotificationOptIn />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Courses" value={courses.length} color="teal" />
        <StatCard label="Total Students" value={totalStudents} color="navy" />
        <StatCard label="Avg Progress" value={`${avgProgress}%`} color="gold" />
      </div>

      {/* Course Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Your Courses
        </h2>
        {courses.length === 0 ? (
          <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted">You don&apos;t have any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: 'teal' | 'navy' | 'gold';
}) {
  const accents = {
    teal: 'border-teal/30 bg-teal/5',
    navy: 'border-navy/30 bg-navy/5',
    gold: 'border-gold/30 bg-gold/5',
  };
  const textColors = {
    teal: 'text-teal',
    navy: 'text-navy dark:text-blue-300',
    gold: 'text-[#B8960A] dark:text-gold',
  };

  return (
    <div className={`rounded-xl border p-5 ${accents[color]}`}>
      <p className="text-sm text-text-muted font-medium">{label}</p>
      <p className={`text-3xl font-heading font-bold mt-1 ${textColors[color]}`}>
        {value}
      </p>
    </div>
  );
}

function CourseCard({ course }: { course: CourseWithStats }) {
  const subjectClass = SUBJECT_COLORS[course.subject] || 'bg-gray-200 text-gray-800';
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessonCount, 0);

  return (
    <Link href={`/instructor/courses/${course.id}`}>
      <div className="bg-card-bg border border-border rounded-xl p-5 hover:shadow-md hover:border-teal/40 transition-all cursor-pointer group">
        {/* Color bar */}
        <div
          className="h-2 rounded-full mb-4"
          style={{ backgroundColor: course.thumbnail || '#4FA3A5' }}
        />

        {/* Subject tag */}
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${subjectClass} mb-3`}>
          {course.subject}
        </span>

        {/* Title */}
        <h3 className="text-base font-heading font-semibold text-text-primary group-hover:text-teal transition-colors mb-2 line-clamp-1">
          {course.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {course.enrollmentCount} students
          </span>
          <span className="flex items-center gap-1">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {course.modules.length} modules
          </span>
        </div>

        {/* Progress hint */}
        {course.enrollmentCount > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
              <span>Avg. Progress</span>
              <span className="font-semibold text-text-primary">{course.avgProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all"
                style={{ width: `${course.avgProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
