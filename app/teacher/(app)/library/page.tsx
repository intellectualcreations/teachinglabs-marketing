'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Books, Plus, MagnifyingGlass, CalendarBlank,
  PencilSimple, CaretRight, CaretDown, ShareNetwork,
  FunnelSimple, BookOpen, Notebook, SquaresFour, List,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Assignment, Class } from '@/lib/supabase/types';

const SUBJECTS = [
  'English Language Arts', 'Reading', 'Writing', 'Math', 'Science',
  'Social Studies', 'History', 'Geography', 'Civics / Government', 'Economics',
  'STEM', 'Computer Science / Technology', 'Digital Literacy', 'Engineering',
  'Art', 'Music', 'Theater / Drama', 'World Languages',
  'Physical Education', 'Health', 'Social-Emotional Learning',
  'Study Skills / Intervention', 'Special Education',
  'Career and Technical Education', 'Library / Media', 'Other',
];

type Tab = 'courses' | 'activities';

interface EnrichedModule {
  id: string;
  title: string;
  course_id: string;
  sort_order: number;
  activity_count: number;
}

interface EnrichedCourse {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  status?: string;
  is_published?: boolean;
  teacher_id: string;
  created_at: string;
  modules: EnrichedModule[];
  module_count: number;
  activity_count: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [orphanedActivities, setOrphanedActivities] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<EnrichedCourse[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [coursesAvailable, setCoursesAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('courses');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [orphanedOnly, setOrphanedOnly] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; }
        setUserId(user.id);

        // Fetch courses + orphaned activities
        const coursesRes = await fetch(`/api/teacher/courses?teacherId=${user.id}`);
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses ?? []);
          setOrphanedActivities(coursesData.orphanedActivities ?? []);
          setCoursesAvailable(coursesData.coursesAvailable ?? false);
        }

        // Also fetch library data for the activities tab (all assignments)
        const libRes = await fetch(`/api/teacher/library?teacherId=${user.id}`);
        if (libRes.ok) {
          const libData = await libRes.json();
          setClasses(libData.classes ?? []);
          setAssignments(libData.assignments ?? []);
        }
      } catch (err) {
        console.error('Library fetch error:', err);
        setError('Failed to load library');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const classNameMap = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [classes]);

  // Course search/filter
  const filteredCourses = useMemo(() => {
    let result = courses;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false) ||
          (c.subject?.toLowerCase().includes(q) ?? false)
      );
    }
    if (subjectFilter) {
      result = result.filter((c) => c.subject === subjectFilter);
    }
    if (statusFilter === 'published') {
      result = result.filter((c) => c.is_published);
    } else if (statusFilter === 'draft') {
      result = result.filter((c) => !c.is_published);
    }
    return result;
  }, [courses, search, subjectFilter, statusFilter]);

  const uniqueSubjects = useMemo(() => {
    const subs = new Set(courses.map(c => c.subject).filter(Boolean));
    return Array.from(subs) as string[];
  }, [courses]);

  // Activities search/filter
  const filteredActivities = useMemo(() => {
    let result = orphanedOnly ? orphanedActivities : assignments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (subjectFilter) {
      result = result.filter((a: any) => a.subject === subjectFilter);
    }
    return result;
  }, [assignments, orphanedActivities, orphanedOnly, search, subjectFilter]);

  const toggleCourse = useCallback((id: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleModule = useCallback((id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  function formatDate(str: string) {
    const d = new Date(str);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }

  async function togglePublish(courseId: string, currentlyPublished: boolean) {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentlyPublished }),
      });
      if (res.ok) {
        setCourses(prev => prev.map(c =>
          c.id === courseId ? { ...c, is_published: !currentlyPublished } : c
        ));
      }
    } catch (e) {
      console.error('Toggle publish error:', e);
    }
  }

  function subjectBadge(subject?: string) {
    if (!subject) return null;
    return (
      <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[11px] font-medium">
        {subject}
      </span>
    );
  }

  function statusBadge(course: EnrichedCourse) {
    const isPublished = !!course.is_published;
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
          isPublished
            ? 'bg-green-500/10 text-green-400'
            : 'bg-yellow-500/10 text-yellow-400'
        }`}
      >
        {isPublished ? 'Published' : 'Draft'}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary text-sm">Loading library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Books size={24} weight="fill" className="text-teal" /> Library
          </h1>
          <p className="text-[13px] text-text-secondary mt-1">
            Your reusable courses and activities. Create once, assign anytime.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/teacher/create-course"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal text-navy
              font-heading font-bold text-sm hover:bg-teal/85 transition-colors shrink-0"
          >
            <Plus size={16} weight="bold" /> Create Course
          </Link>
          <Link
            href="/teacher/create-activity"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-[1.5px] border-border
              text-text-primary font-heading font-bold text-sm hover:border-teal hover:text-teal
              transition-colors shrink-0"
          >
            <Plus size={16} weight="bold" /> Create Activity
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={tab === 'courses' ? 'Search courses...' : 'Search activities...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-[9px] border-[1.5px] border-border rounded-lg text-[13px]
              bg-card-bg text-text-primary font-heading outline-none focus:border-teal"
          />
        </div>
      </div>

      {/* Filters row */}
      {tab === 'courses' && courses.length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="px-3 py-[7px] bg-white text-gray-900 border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal"
            style={{ colorScheme: 'light' }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          {uniqueSubjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-[7px] bg-white text-gray-900 border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal"
              style={{ colorScheme: 'light' }}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          )}
          <div className="ml-auto flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 ${viewMode === 'card' ? 'bg-teal/10 text-teal' : 'text-text-secondary hover:text-text-primary'} transition-colors`}
              title="Card view"
            >
              <SquaresFour size={16} weight={viewMode === 'card' ? 'fill' : 'regular'} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 ${viewMode === 'table' ? 'bg-teal/10 text-teal' : 'text-text-secondary hover:text-text-primary'} transition-colors`}
              title="Table view"
            >
              <List size={16} weight={viewMode === 'table' ? 'fill' : 'regular'} />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-border">
        <button
          onClick={() => { setTab('courses'); setSearch(''); setSubjectFilter(''); }}
          className={`px-4 py-2.5 text-sm font-heading font-bold transition-colors relative
            ${tab === 'courses'
              ? 'text-teal'
              : 'text-text-secondary hover:text-text-primary'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={16} weight={tab === 'courses' ? 'fill' : 'regular'} />
            Courses
            {courses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal/10 text-teal text-[10px] font-medium">
                {courses.length}
              </span>
            )}
          </span>
          {tab === 'courses' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal rounded-t" />
          )}
        </button>
        <button
          onClick={() => { setTab('activities'); setSearch(''); setSubjectFilter(''); }}
          className={`px-4 py-2.5 text-sm font-heading font-bold transition-colors relative
            ${tab === 'activities'
              ? 'text-teal'
              : 'text-text-secondary hover:text-text-primary'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <Notebook size={16} weight={tab === 'activities' ? 'fill' : 'regular'} />
            Activities
            {assignments.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal/10 text-teal text-[10px] font-medium">
                {assignments.length}
              </span>
            )}
          </span>
          {tab === 'activities' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal rounded-t" />
          )}
        </button>
      </div>

      {/* Courses Tab */}
      {tab === 'courses' && (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-16 bg-card-bg border border-border rounded-[14px]">
              <BookOpen size={48} className="mx-auto text-text-secondary opacity-40" />
              <h3 className="font-heading font-bold text-lg text-text-primary mt-4 mb-2">
                No courses yet
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto mb-5">
                Organize your activities into courses and modules. Build a curriculum your students can follow step by step.
              </p>
              <Link
                href="/teacher/create-course"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal text-navy
                  font-heading font-bold text-sm"
              >
                <Plus size={16} weight="bold" /> Create Course
              </Link>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-card-bg border border-border rounded-[14px]">
              <MagnifyingGlass size={48} className="mx-auto text-text-secondary opacity-40" />
              <h3 className="font-heading font-bold text-lg text-text-primary mt-4 mb-2">
                No courses match your search
              </h3>
              <p className="text-sm text-text-secondary">Try a different search term.</p>
            </div>
          ) : viewMode === 'table' ? (
            /* Table view */
            <div className="bg-card-bg border border-border rounded-[14px] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-heading font-semibold text-text-secondary">Course</th>
                    <th className="px-4 py-3 text-xs font-heading font-semibold text-text-secondary">Subject</th>
                    <th className="px-4 py-3 text-xs font-heading font-semibold text-text-secondary">Grade</th>
                    <th className="px-4 py-3 text-xs font-heading font-semibold text-text-secondary">Modules</th>
                    <th className="px-4 py-3 text-xs font-heading font-semibold text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-xs font-heading font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">{course.title}</td>
                      <td className="px-4 py-3">{subjectBadge(course.subject)}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{course.grade_level || '—'}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{course.module_count}</td>
                      <td className="px-4 py-3">{statusBadge(course)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => router.push(`/teacher/edit-course/${course.id}`)}
                            className="px-2.5 py-1 border border-border rounded text-[11px] font-semibold text-text-primary hover:border-teal hover:text-teal transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => togglePublish(course.id, !!course.is_published)}
                            className={`px-2.5 py-1 border rounded text-[11px] font-semibold transition-colors ${
                              course.is_published
                                ? 'border-yellow-500/30 text-yellow-400 hover:border-yellow-500'
                                : 'border-border text-text-primary hover:border-teal hover:text-teal'
                            }`}
                          >
                            {course.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
              {filteredCourses.map((course) => {
                const isExpanded = expandedCourses.has(course.id);
                return (
                  <div
                    key={course.id}
                    className="bg-card-bg border border-border rounded-[14px] p-5 relative overflow-hidden
                      hover:border-teal/50 transition-all"
                  >
                    {/* Top row: subject + status */}
                    <div className="flex items-center justify-between mb-2">
                      {subjectBadge(course.subject)}
                      {statusBadge(course)}
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-[15px] text-text-primary mb-1">
                      {course.title}
                    </h3>

                    {/* Meta */}
                    <p className="text-[11px] text-text-secondary mb-3">
                      {course.grade_level && <>{course.grade_level} &bull; </>}
                      {course.module_count} {course.module_count === 1 ? 'Module' : 'Modules'} &bull;{' '}
                      {course.activity_count} {course.activity_count === 1 ? 'Activity' : 'Activities'}
                    </p>

                    {/* Expandable modules */}
                    {course.modules.length > 0 && (
                      <div className="mb-3">
                        <button
                          onClick={() => toggleCourse(course.id)}
                          className="flex items-center gap-1 text-xs text-text-secondary hover:text-teal
                            transition-colors font-medium"
                        >
                          {isExpanded ? (
                            <CaretDown size={12} weight="bold" />
                          ) : (
                            <CaretRight size={12} weight="bold" />
                          )}
                          {isExpanded ? 'Hide' : 'Show'} Modules
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1 pl-3 border-l-2 border-border">
                            {course.modules.map((mod) => (
                              <div key={mod.id} className="text-xs text-text-secondary py-1">
                                <button
                                  onClick={() => toggleModule(mod.id)}
                                  className="flex items-center gap-1.5 hover:text-teal transition-colors w-full text-left"
                                >
                                  {expandedModules.has(mod.id) ? (
                                    <CaretDown size={10} weight="bold" className="shrink-0" />
                                  ) : (
                                    <CaretRight size={10} weight="bold" className="shrink-0" />
                                  )}
                                  <span className="font-medium text-text-primary">{mod.title}</span>
                                  <span className="text-text-muted ml-auto">
                                    ({mod.activity_count} {mod.activity_count === 1 ? 'act' : 'acts'})
                                  </span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={() => router.push(`/teacher/edit-course/${course.id}`)}
                        className="px-3.5 py-2 border-[1.5px] border-border rounded-md text-xs font-semibold
                          text-text-primary flex items-center gap-1 hover:border-teal hover:text-teal
                          transition-colors cursor-pointer"
                      >
                        <PencilSimple size={14} weight="fill" /> Edit
                      </button>
                      <button
                onClick={() => togglePublish(course.id, !!course.is_published)}
                        className={`px-3.5 py-2 border-[1.5px] rounded-md text-xs font-semibold
                          flex items-center gap-1 transition-colors cursor-pointer ${
                            course.is_published
                              ? 'border-yellow-500/30 text-yellow-400 hover:border-yellow-500 hover:text-yellow-300'
                              : 'border-border text-text-primary hover:border-teal hover:text-teal'
                          }`}
                      >
                        <ShareNetwork size={14} weight="fill" />
                        {course.is_published ? 'Unpublish' : 'Share to Library'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Activities Tab */}
      {tab === 'activities' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative">
              <FunnelSimple size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="pl-8 pr-6 py-[8px] border-[1.5px] border-border rounded-lg text-[12px]
                  bg-card-bg text-text-primary font-heading outline-none focus:border-teal
                  appearance-none cursor-pointer"
              >
                <option value="">All Subjects</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {coursesAvailable && (
              <button
                onClick={() => setOrphanedOnly(!orphanedOnly)}
                className={`px-3 py-[8px] border-[1.5px] rounded-lg text-[12px] font-heading font-semibold
                  transition-colors cursor-pointer ${
                    orphanedOnly
                      ? 'border-teal bg-teal/10 text-teal'
                      : 'border-border text-text-secondary hover:border-teal hover:text-teal'
                  }`}
              >
                {orphanedOnly ? 'Showing Unattached' : 'Show Unattached Only'}
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-16 bg-card-bg border border-border rounded-[14px]">
              <Books size={48} className="mx-auto text-text-secondary opacity-40" />
              <h3 className="font-heading font-bold text-lg text-text-primary mt-4 mb-2">
                Your activity library is empty
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto mb-5">
                Create your first activity! Upload materials you already use, and your Teaching Twin will align them to standards automatically.
              </p>
              <Link
                href="/teacher/create-activity"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal text-navy
                  font-heading font-bold text-sm"
              >
                <Plus size={16} weight="bold" /> Create Activity
              </Link>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16 bg-card-bg border border-border rounded-[14px]">
              <MagnifyingGlass size={48} className="mx-auto text-text-secondary opacity-40" />
              <h3 className="font-heading font-bold text-lg text-text-primary mt-4 mb-2">
                No activities match your filters
              </h3>
              <p className="text-sm text-text-secondary">Try different search terms or filters.</p>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {filteredActivities.map((a) => {
                const className = classNameMap.get(a.class_id) ?? 'Unknown Class';
                const actAny = a as any;
                return (
                  <div
                    key={a.id}
                    className="bg-card-bg border border-border rounded-[14px] p-5 relative overflow-hidden
                      cursor-pointer hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2.5 gap-2">
                      <h3 className="font-heading font-bold text-[15px] text-text-primary">{a.title}</h3>
                    </div>

                    {a.description && (
                      <p className="text-xs text-text-secondary mb-2.5 line-clamp-2">{a.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-text-secondary mb-2.5 flex-wrap">
                      {actAny.subject && subjectBadge(actAny.subject)}
                      <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal font-medium">
                        {className}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarBlank size={14} weight="fill" /> {formatDate(a.created_at)}
                      </span>
                      {a.due_date && (
                        <span className="text-warning font-medium">
                          Due {formatDate(a.due_date)}
                        </span>
                      )}
                    </div>

                    {/* Course attachment indicator */}
                    {coursesAvailable && !actAny.course_id && (
                      <div className="text-[10px] text-text-muted mb-2">
                        Not attached to a course
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="px-3.5 py-2 border-[1.5px] border-border rounded-md text-xs font-semibold
                          text-text-primary flex items-center gap-1 hover:border-teal hover:text-teal
                          transition-colors cursor-pointer"
                      >
                        <PencilSimple size={14} weight="fill" /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
