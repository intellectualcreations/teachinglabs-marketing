'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Books, Plus, MagnifyingGlass, CalendarBlank,
  PencilSimple, CaretRight, CaretDown, ShareNetwork,
  FunnelSimple, BookOpen, Notebook, SquaresFour, List,
  GraduationCap, ArrowSquareIn, SpinnerGap, X, Lightning,
  Trash,
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

type Tab = 'tl-courses' | 'courses' | 'activities';

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
  const [tab, setTabRaw] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tl-library-tab') as Tab) || 'courses';
    }
    return 'courses';
  });
  const setTab = useCallback((t: Tab) => {
    setTabRaw(t);
    localStorage.setItem('tl-library-tab', t);
  }, []);
  const [tlCourses, setTlCourses] = useState<EnrichedCourse[]>([]);
  const [tlLoading, setTlLoading] = useState(false);
  const [tlActivities, setTlActivities] = useState<any[]>([]);
  const [tlActivitiesLoaded, setTlActivitiesLoaded] = useState(false);
  const [tlActivitySearch, setTlActivitySearch] = useState('');
  const [tlActivitySubject, setTlActivitySubject] = useState('');
  const [tlActivityGrade, setTlActivityGrade] = useState('');
  const [tlGradeFilter, setTlGradeFilter] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewModeRaw] = useState<'card' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tl-library-view') as 'card' | 'table') || 'card';
    }
    return 'card';
  });
  const setViewMode = useCallback((mode: 'card' | 'table') => {
    setViewModeRaw(mode);
    localStorage.setItem('tl-library-view', mode);
  }, []);
  const [orphanedOnly, setOrphanedOnly] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<EnrichedCourse | null>(null);
  const [assigningActivity, setAssigningActivity] = useState<string | null>(null); // activity id with open assign popup
  const [activityClassMap, setActivityClassMap] = useState<Map<string, string[]>>(new Map()); // activity_id -> class_ids
  const [assignSaving, setAssignSaving] = useState(false);
  const [panelModules, setPanelModules] = useState<{ id: string; title: string; activities: { id: string; title: string; objective?: string; learning_goal?: string; essential_question?: string; materials?: string; vocabulary?: string; directions?: string; hook?: string; assessment?: string; differentiation?: string }[] }[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [expandedPanelModules, setExpandedPanelModules] = useState<Set<string>>(new Set());

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
          // Load class assignments map
          if (libData.classActivities) {
            const map = new Map<string, string[]>();
            for (const [actId, classIds] of Object.entries(libData.classActivities)) {
              map.set(actId, classIds as string[]);
            }
            setActivityClassMap(map);
          }
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
    if (gradeFilter) {
      result = result.filter((a: any) => a.grade_level === gradeFilter);
    }
    return result;
  }, [assignments, orphanedActivities, orphanedOnly, search, subjectFilter, gradeFilter]);

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
    const display = subject.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
      <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[11px] font-medium">
        {display}
      </span>
    );
  }

  // Load class assignments for a single activity
  async function loadActivityClasses(activityId: string) {
    try {
      const res = await fetch(`/api/teacher/activities/${activityId}/classes`);
      if (res.ok) {
        const { classIds } = await res.json();
        setActivityClassMap(prev => new Map(prev).set(activityId, classIds));
      }
    } catch (e) { console.error('Load activity classes error:', e); }
  }

  // Save class assignments for an activity
  async function saveActivityClasses(activityId: string, classIds: string[]) {
    setAssignSaving(true);
    try {
      const res = await fetch(`/api/teacher/activities/${activityId}/classes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classIds }),
      });
      if (res.ok) {
        setActivityClassMap(prev => new Map(prev).set(activityId, classIds));
      }
    } catch (e) { console.error('Save activity classes error:', e); }
    setAssignSaving(false);
  }

  // Toggle a single class for the currently assigning activity
  function toggleClassForActivity(classId: string) {
    if (!assigningActivity) return;
    const current = activityClassMap.get(assigningActivity) || [];
    const updated = current.includes(classId)
      ? current.filter(id => id !== classId)
      : [...current, classId];
    saveActivityClasses(assigningActivity, updated);
  }

  // Open the assign popup for an activity
  function openAssignPopup(activityId: string) {
    // Toggle: if already open for this activity, close it
    if (assigningActivity === activityId) {
      setAssigningActivity(null);
      return;
    }
    setAssigningActivity(activityId);
    if (!activityClassMap.has(activityId)) {
      loadActivityClasses(activityId);
    }
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

  async function openCoursePanel(course: EnrichedCourse) {
    setSelectedCourse(course);
    setPanelModules([]);
    setPanelLoading(true);
    setExpandedPanelModules(new Set());
    try {
      // Fetch modules with activities for this course
      const modsWithActivities = await Promise.all(
        (course.modules || []).map(async (mod) => {
          try {
            const res = await fetch(`/api/teacher/courses/${course.id}/modules/${mod.id}/activities`);
            if (res.ok) {
              const data = await res.json();
              return { id: mod.id, title: mod.title, activities: data.activities || [] };
            }
          } catch (e) { /* ignore */ }
          return { id: mod.id, title: mod.title, activities: [] };
        })
      );
      setPanelModules(modsWithActivities);
    } catch (e) {
      console.error('Panel load error:', e);
    } finally {
      setPanelLoading(false);
    }
  }

  // Close assign popup when clicking outside
  useEffect(() => {
    if (!assigningActivity) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-assign-popup]') || target.closest('[data-assign-btn]')) return;
      setAssigningActivity(null);
    }
    // Delay attaching so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick, true); // capture phase
    }, 100);
    return () => { clearTimeout(timer); document.removeEventListener('click', handleClick, true); };
  }, [assigningActivity]);

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

      {/* Tabs — My Courses | Activities | TL Content */}
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
            My Courses
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
        <button
          onClick={() => {
            setTab('tl-courses');
            setSearch('');
            setSubjectFilter('');
            if (tlCourses.length === 0 && !tlLoading) {
              setTlLoading(true);
              fetch('/api/teacher/tl-courses')
                .then(r => r.json())
                .then(d => setTlCourses(d.courses ?? []))
                .catch(() => {})
                .finally(() => setTlLoading(false));
            }
            if (!tlActivitiesLoaded) {
              setTlActivitiesLoaded(true);
              fetch('/api/teacher/tl-activities')
                .then(r => r.json())
                .then(d => setTlActivities(d.activities ?? []))
                .catch(() => {});
            }
          }}
          className={`px-4 py-2.5 text-sm font-heading font-bold transition-colors relative
            ${tab === 'tl-courses'
              ? 'text-teal'
              : 'text-text-secondary hover:text-text-primary'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <GraduationCap size={16} weight={tab === 'tl-courses' ? 'fill' : 'regular'} />
            TL Content
          </span>
          {tab === 'tl-courses' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal rounded-t" />
          )}
        </button>
      </div>

      {/* TL Content Tab */}
      {tab === 'tl-courses' && (() => {
        const tlSubjects = [...new Set(tlCourses.map(c => c.subject).filter(Boolean))];
        const tlGrades = [...new Set(tlCourses.map(c => c.grade_level).filter(Boolean))];
        const filtered = tlCourses.filter(c => {
          if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description?.toLowerCase().includes(search.toLowerCase())) return false;
          if (subjectFilter && c.subject !== subjectFilter) return false;
          if (tlGradeFilter && c.grade_level !== tlGradeFilter) return false;
          return true;
        });
        return (
          <>
            {/* Search */}
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search TL courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-[9px] border-[1.5px] border-border rounded-lg text-[13px]
                    bg-card-bg text-text-primary font-heading outline-none focus:border-teal"
                />
              </div>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-[7px] bg-card-bg text-text-primary border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">All Subjects</option>
                {tlSubjects.sort().map(s => (
                  <option key={s} value={s}>{s!.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
              <select
                value={tlGradeFilter}
                onChange={(e) => setTlGradeFilter(e.target.value)}
                className="px-3 py-[7px] bg-card-bg text-text-primary border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">All Grades</option>
                {['K','1','2','3','4','5','6','7','8','9','10','11','12'].map(g => (
                  <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>
                ))}
              </select>
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

            {tlLoading ? (
              <div className="flex items-center justify-center py-20">
                <SpinnerGap size={32} className="animate-spin text-teal" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-card-bg border border-border rounded-[14px]">
                <GraduationCap size={48} className="mx-auto text-text-secondary opacity-40" />
                <h3 className="font-heading font-bold text-lg text-text-primary mt-4 mb-2">
                  {tlCourses.length === 0 ? 'Coming Soon!' : 'No matches'}
                </h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  {tlCourses.length === 0
                    ? 'AI-generated courses for every grade and subject are on the way. Check back soon!'
                    : 'Try adjusting your filters to find courses.'}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-text-secondary mb-3">{filtered.length} course{filtered.length !== 1 ? 's' : ''}</p>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
                  {filtered.map((course) => (
                    <div
                      key={course.id}
                      className="bg-card-bg border border-border rounded-[14px] p-5 hover:border-teal/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        {subjectBadge(course.subject)}
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-medium">
                          TL Content
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-[15px] text-text-primary mb-1">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="text-xs text-text-secondary mb-2 line-clamp-2">{course.description}</p>
                      )}
                      <p className="text-[11px] text-text-secondary mb-3">
                        {course.grade_level && <>{course.grade_level === 'K' ? 'Kindergarten' : `Grade ${course.grade_level}`} &bull; </>}
                        {course.module_count} {course.module_count === 1 ? 'Module' : 'Modules'}
                      </p>
                      <button
                        onClick={async () => {
                          if (!userId) return;
                          try {
                            const res = await fetch('/api/teacher/tl-courses', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ course_id: course.id, teacher_id: userId }),
                            });
                            if (res.ok) {
                              alert('Course added to My Courses!');
                            } else {
                              alert('Failed to import course');
                            }
                          } catch (e) {
                            alert('Failed to import course');
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy/90 transition-colors"
                      >
                        <ArrowSquareIn size={14} weight="fill" /> Add to My Library
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );
      })()}

      {/* TL Activities Section (shown on TL Content tab) */}
      {tab === 'tl-courses' && (() => {
        const tlSubjects = [...new Set(tlActivities.map((a: any) => a.subject).filter(Boolean))];
        const filtered = tlActivities.filter((a: any) => {
          if (tlActivitySearch && !a.title.toLowerCase().includes(tlActivitySearch.toLowerCase()) && !a.description?.toLowerCase().includes(tlActivitySearch.toLowerCase())) return false;
          if (tlActivitySubject && a.subject !== tlActivitySubject) return false;
          if (tlActivityGrade && a.grade_level !== tlActivityGrade) return false;
          return true;
        });
        return (
          <div className="mt-8">
            <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-4 flex items-center gap-2">
              <span>TL Activities</span>
              <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal text-xs font-semibold">{tlActivities.length}</span>
            </h2>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input type="text" placeholder="Search TL activities..." value={tlActivitySearch} onChange={e => setTlActivitySearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-[9px] border-[1.5px] border-border rounded-lg text-[13px] bg-card-bg text-text-primary font-heading outline-none focus:border-teal" />
              </div>
              <select value={tlActivitySubject} onChange={e => setTlActivitySubject(e.target.value)}
                className="px-3 py-[7px] bg-card-bg text-text-primary border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal" style={{ colorScheme: 'dark' }}>
                <option value="">All Subjects</option>
                {tlSubjects.sort().map(s => <option key={s as string} value={s as string}>{(s as string).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
              <select value={tlActivityGrade} onChange={e => setTlActivityGrade(e.target.value)}
                className="px-3 py-[7px] bg-card-bg text-text-primary border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal" style={{ colorScheme: 'dark' }}>
                <option value="">All Grades</option>
                {['K-2','3-5','6-8','9-12'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {tlActivities.length === 0 ? (
              <div className="text-center py-12 text-text-muted text-sm">Loading activities...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-text-muted text-sm">No activities match your filters</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filtered.map((act: any) => (
                  <div key={act.id} className="bg-card-bg border border-border rounded-xl p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {act.subject && (
                          <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[11px] font-semibold">
                            {act.subject.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </span>
                        )}
                        {act.grade_level && (
                          <span className="px-2 py-0.5 rounded-full bg-navy/20 text-text-secondary text-[11px] font-medium">Gr. {act.grade_level}</span>
                        )}
                        {act.activity_type && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-medium">{act.activity_type.replace(/_/g, ' ')}</span>
                        )}
                        {act.estimated_minutes && (
                          <span className="text-[11px] text-text-muted">{act.estimated_minutes} min</span>
                        )}
                      </div>
                      <p className="font-heading font-bold text-[14px] text-text-primary mb-0.5">{act.title}</p>
                      {act.description && <p className="text-[12px] text-text-secondary line-clamp-2">{act.description}</p>}
                    </div>
                    <button
                      onClick={async () => {
                        if (!userId) return;
                        // Add to teacher's library by creating a personal copy
                        const res = await fetch('/api/teacher/activities/copy', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ activityId: act.id, teacherId: userId }),
                        });
                        if (res.ok) {
                          // Refresh assignments
                          const libRes = await fetch(`/api/teacher/library?teacherId=${userId}`);
                          if (libRes.ok) { const d = await libRes.json(); setAssignments(d.assignments ?? []); }
                          alert('Activity added to your library!');
                        }
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-teal/10 text-teal text-xs font-heading font-semibold hover:bg-teal/20 transition-colors whitespace-nowrap"
                    >
                      + Add to My Library
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* My Courses Tab */}
      {tab === 'courses' && (
        <>
          {/* Search + Filters for My Courses */}
          {courses.length > 0 && (
            <>
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search my courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-[9px] border-[1.5px] border-border rounded-lg text-[13px]
                      bg-card-bg text-text-primary font-heading outline-none focus:border-teal"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                  className="px-3 py-[7px] bg-card-bg text-text-primary border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                {uniqueSubjects.length > 0 && (
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="px-3 py-[7px] bg-card-bg text-text-primary border border-border rounded-lg text-xs font-medium focus:outline-none focus:border-teal"
                    style={{ colorScheme: 'dark' }}
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
            </>
          )}
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
                    <tr key={course.id} onClick={() => openCoursePanel(course)} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
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
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => openCoursePanel(course)}
                  className="bg-card-bg border border-border rounded-[14px] p-5 cursor-pointer
                    hover:border-teal/50 transition-all group"
                >
                  {/* Top row: subject + status */}
                  <div className="flex items-center justify-between mb-2">
                    {subjectBadge(course.subject)}
                    {statusBadge(course)}
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-[15px] text-text-primary mb-1 group-hover:text-teal transition-colors">
                    {course.title}
                  </h3>

                  {/* Meta summary */}
                  <p className="text-[11px] text-text-secondary">
                    {course.grade_level && <>{course.grade_level} &bull; </>}
                    {course.module_count} {course.module_count === 1 ? 'Module' : 'Modules'} &bull;{' '}
                    {course.activity_count} {course.activity_count === 1 ? 'Activity' : 'Activities'}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/teacher/edit-course/${course.id}`); }}
                      className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold
                        text-text-primary flex items-center gap-1 hover:border-teal hover:text-teal transition-colors"
                    >
                      <PencilSimple size={14} weight="fill" /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePublish(course.id, !!course.is_published); }}
                      className={`px-3 py-1.5 border rounded-md text-xs font-semibold
                        flex items-center gap-1 transition-colors ${
                          course.is_published
                            ? 'border-yellow-500/30 text-yellow-400 hover:border-yellow-500'
                            : 'border-border text-text-primary hover:border-teal hover:text-teal'
                        }`}
                    >
                      <ShareNetwork size={14} weight="fill" />
                      {course.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Activities Tab */}
      {tab === 'activities' && (
        <>
          {/* Search bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-[9px] border-[1.5px] border-border rounded-lg text-[13px]
                  bg-card-bg text-text-primary font-heading outline-none focus:border-teal"
              />
            </div>
          </div>

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

            {/* Grade level filter */}
            <div className="relative">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="pl-3 pr-6 py-[8px] border-[1.5px] border-border rounded-lg text-[12px]
                  bg-card-bg text-text-primary font-heading outline-none focus:border-teal
                  appearance-none cursor-pointer"
              >
                <option value="">All Grades</option>
                <option value="K-2">K–2</option>
                <option value="3-5">3–5</option>
                <option value="6-8">6–8</option>
                <option value="9-12">9–12</option>
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
          ) : viewMode === 'table' ? (
            <div className="bg-card-bg border border-border rounded-[14px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                    <th className="text-left px-5 py-3 text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-wider">Subject</th>
                    <th className="text-left px-5 py-3 text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-wider">Grade</th>
                    <th className="text-left px-5 py-3 text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-wider">Course</th>
                    <th className="text-left px-5 py-3 text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-wider">Module</th>
                    <th className="text-right px-5 py-3 text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((a) => {
                    const actAny = a as any;
                    return (
                      <tr key={a.id} className="border-b border-border last:border-b-0 hover:bg-teal/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-heading font-semibold text-[13px] text-text-primary">{a.title}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {actAny.subject ? subjectBadge(actAny.subject) : <span className="text-xs text-text-secondary">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-text-secondary">{actAny.grade_level || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-text-secondary">{actAny.course_title || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-text-secondary">{actAny.module_title || '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2 relative">
                            <button
                              data-assign-btn
                              onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); openAssignPopup(a.id); }}
                              className={`px-3 py-1.5 border-[1.5px] rounded-md text-xs font-semibold
                                flex items-center gap-1 transition-colors cursor-pointer ${
                                  (activityClassMap.get(a.id)?.length || 0) > 0
                                    ? 'border-teal/40 bg-teal/10 text-teal'
                                    : 'border-border text-text-secondary hover:border-teal hover:text-teal'
                                }`}
                            >
                              <ShareNetwork size={14} weight="fill" />
                              {(activityClassMap.get(a.id)?.length || 0) > 0
                                ? `${activityClassMap.get(a.id)!.length} class${activityClassMap.get(a.id)!.length > 1 ? 'es' : ''}`
                                : 'Assign'}
                            </button>
                            {assigningActivity === a.id && (
                              <div data-assign-popup className="absolute right-0 top-full mt-1 z-50 bg-[#1a1f2e] border border-border rounded-lg shadow-xl p-3 min-w-[220px]"
                                onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-heading font-semibold text-text-primary">Assign to Classes</span>
                                  <button onClick={() => setAssigningActivity(null)} className="text-text-secondary hover:text-text-primary">
                                    <X size={14} />
                                  </button>
                                </div>
                                {classes.length === 0 ? (
                                  <p className="text-xs text-text-secondary">No classes yet</p>
                                ) : classes.map(cls => {
                                  const checked = (activityClassMap.get(a.id) || []).includes(cls.id);
                                  return (
                                    <label key={cls.id} className="flex items-center gap-2 py-1.5 px-1 rounded hover:bg-white/5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleClassForActivity(cls.id)}
                                        disabled={assignSaving}
                                        className="accent-teal w-4 h-4 rounded"
                                      />
                                      <span className="text-xs text-text-primary">{cls.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                            <button
                              onClick={() => router.push(`/teacher/create-activity?edit=${a.id}`)}
                              className="px-3 py-1.5 border-[1.5px] border-border rounded-md text-xs font-semibold
                                text-text-primary flex items-center gap-1 hover:border-teal hover:text-teal
                                transition-colors cursor-pointer"
                            >
                              <PencilSimple size={14} weight="fill" /> Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this activity? This cannot be undone.')) return;
                                try {
                                  const res = await fetch(`/api/teacher/activities?id=${a.id}`, { method: 'DELETE' });
                                  if (!res.ok) { const err = await res.json().catch(() => ({})); alert('Failed to delete: ' + (err.error || res.statusText)); return; }
                                  setAssignments(prev => prev.filter(act => act.id !== a.id));
                                  setOrphanedActivities(prev => prev.filter(act => act.id !== a.id));
                                } catch (err) { alert('Something went wrong.'); }
                              }}
                              className="px-3 py-1.5 border-[1.5px] border-border rounded-md text-xs font-semibold
                                text-text-secondary flex items-center gap-1 hover:border-red-400 hover:text-red-400
                                transition-colors cursor-pointer"
                            >
                              <Trash size={14} weight="fill" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {filteredActivities.map((a) => {
                const actAny = a as any;
                return (
                  <div
                    key={a.id}
                    className="bg-card-bg border border-border rounded-[14px] p-5 relative
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
                      {actAny.grade_level && (
                        <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal font-medium">
                          Gr. {actAny.grade_level}
                        </span>
                      )}
                      {actAny._is_shared_template && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                          TL Template
                        </span>
                      )}
                      {actAny.course_title && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">
                          {actAny.course_title}
                        </span>
                      )}
                      {actAny.module_title && (
                        <span className="text-text-muted">
                          {actAny.module_title}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3 flex-wrap relative">
                      <button
                        data-assign-btn
                        onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); openAssignPopup(a.id); }}
                        className={`px-3.5 py-2 border-[1.5px] rounded-md text-xs font-semibold
                          flex items-center gap-1 transition-colors cursor-pointer ${
                            (activityClassMap.get(a.id)?.length || 0) > 0
                              ? 'border-teal/40 bg-teal/10 text-teal'
                              : 'border-border text-text-secondary hover:border-teal hover:text-teal'
                          }`}
                      >
                        <ShareNetwork size={14} weight="fill" />
                        {(activityClassMap.get(a.id)?.length || 0) > 0
                          ? `${activityClassMap.get(a.id)!.length} class${activityClassMap.get(a.id)!.length > 1 ? 'es' : ''}`
                          : 'Assign'}
                      </button>
                      {assigningActivity === a.id && (
                        <div data-assign-popup className="absolute left-0 bottom-full mb-1 z-50 bg-[#1a1f2e] border border-border rounded-lg shadow-xl p-3 min-w-[220px]"
                          onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-heading font-semibold text-text-primary">Assign to Classes</span>
                            <button onClick={() => setAssigningActivity(null)} className="text-text-secondary hover:text-text-primary">
                              <X size={14} />
                            </button>
                          </div>
                          {classes.length === 0 ? (
                            <p className="text-xs text-text-secondary">No classes yet</p>
                          ) : classes.map(cls => {
                            const checked = (activityClassMap.get(a.id) || []).includes(cls.id);
                            return (
                              <label key={cls.id} className="flex items-center gap-2 py-1.5 px-1 rounded hover:bg-white/5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleClassForActivity(cls.id)}
                                  disabled={assignSaving}
                                  className="accent-teal w-4 h-4 rounded"
                                />
                                <span className="text-xs text-text-primary">{cls.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/teacher/create-activity?edit=${a.id}`); }}
                        className="px-3.5 py-2 border-[1.5px] border-border rounded-md text-xs font-semibold
                          text-text-primary flex items-center gap-1 hover:border-teal hover:text-teal
                          transition-colors cursor-pointer"
                      >
                        <PencilSimple size={14} weight="fill" /> Edit
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm('Delete this activity? This cannot be undone.')) return;
                          try {
                            const res = await fetch(`/api/teacher/activities?id=${a.id}`, { method: 'DELETE' });
                            if (!res.ok) { const err = await res.json().catch(() => ({})); alert('Failed to delete: ' + (err.error || res.statusText)); return; }
                            setAssignments(prev => prev.filter(act => act.id !== a.id));
                            setOrphanedActivities(prev => prev.filter(act => act.id !== a.id));
                          } catch (err) { alert('Something went wrong.'); }
                        }}
                        className="px-3.5 py-2 border-[1.5px] border-border rounded-md text-xs font-semibold
                          text-text-secondary flex items-center gap-1 hover:border-red-400 hover:text-red-400
                          transition-colors cursor-pointer"
                      >
                        <Trash size={14} weight="fill" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      {/* Slide-over Panel */}
      {selectedCourse && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={() => setSelectedCourse(null)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-surface border-l border-border z-50 shadow-2xl overflow-y-auto animate-slide-in">
            <style jsx>{`
              @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
              .animate-slide-in { animation: slideIn 0.2s ease-out; }
            `}</style>

            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-start justify-between z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {subjectBadge(selectedCourse.subject)}
                  {statusBadge(selectedCourse)}
                </div>
                <h2 className="font-heading font-bold text-lg text-text-primary truncate">
                  {selectedCourse.title}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {selectedCourse.grade_level && <>{selectedCourse.grade_level} &bull; </>}
                  {selectedCourse.module_count} {selectedCourse.module_count === 1 ? 'Module' : 'Modules'} &bull;{' '}
                  {selectedCourse.activity_count} {selectedCourse.activity_count === 1 ? 'Activity' : 'Activities'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Description */}
              {selectedCourse.description && (
                <div>
                  <h4 className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Description</h4>
                  <p className="text-sm text-text-primary leading-relaxed">{selectedCourse.description}</p>
                </div>
              )}

              {/* Modules */}
              <div>
                <h4 className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider mb-3">Modules</h4>
                {panelLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <SpinnerGap size={24} className="animate-spin text-teal" />
                  </div>
                ) : panelModules.length === 0 ? (
                  <p className="text-sm text-text-muted py-4 text-center">No modules yet</p>
                ) : (
                  <div className="space-y-2">
                    {panelModules.map((mod, i) => {
                      const isExpanded = expandedPanelModules.has(mod.id);
                      return (
                        <div key={mod.id} className="bg-card-bg border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              setExpandedPanelModules(prev => {
                                const next = new Set(prev);
                                if (next.has(mod.id)) next.delete(mod.id);
                                else next.add(mod.id);
                                return next;
                              });
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
                          >
                            {isExpanded ? <CaretDown size={12} weight="bold" className="text-teal" /> : <CaretRight size={12} weight="bold" className="text-text-secondary" />}
                            <span className="text-sm font-medium text-text-primary flex-1">{mod.title}</span>
                            <span className="text-[11px] text-text-muted">
                              {mod.activities.length} {mod.activities.length === 1 ? 'activity' : 'activities'}
                            </span>
                          </button>
                          {isExpanded && mod.activities.length > 0 && (
                            <div className="border-t border-border px-3 py-2 space-y-2">
                              {mod.activities.map((act) => (
                                <div key={act.id} className="py-1.5">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Lightning size={12} weight="fill" className="text-teal shrink-0" />
                                    <span className="text-text-primary font-medium">{act.title}</span>
                                  </div>
                                  {(act.objective || act.learning_goal || act.essential_question || act.materials || act.vocabulary || act.directions || act.hook || act.assessment) && (
                                    <div className="ml-5 mt-1 space-y-1">
                                      {act.objective && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Objective:</span> {act.objective}</p>
                                      )}
                                      {act.learning_goal && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Learning Goal:</span> {act.learning_goal}</p>
                                      )}
                                      {act.essential_question && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Essential Question:</span> {act.essential_question}</p>
                                      )}
                                      {act.materials && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Materials:</span> {act.materials}</p>
                                      )}
                                      {act.vocabulary && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Vocabulary:</span> {act.vocabulary}</p>
                                      )}
                                      {act.hook && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Hook:</span> {act.hook}</p>
                                      )}
                                      {act.directions && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Directions:</span> {act.directions}</p>
                                      )}
                                      {act.assessment && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Assessment:</span> {act.assessment}</p>
                                      )}
                                      {act.differentiation && (
                                        <p className="text-[11px] text-text-secondary"><span className="font-semibold text-text-primary">Differentiation:</span> {act.differentiation}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {isExpanded && mod.activities.length === 0 && (
                            <div className="border-t border-border px-3 py-2">
                              <p className="text-xs text-text-muted text-center">No activities</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => { router.push(`/teacher/edit-course/${selectedCourse.id}`); setSelectedCourse(null); }}
                  className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy/90 transition-colors flex items-center gap-1.5"
                >
                  <PencilSimple size={14} weight="fill" /> Edit Course
                </button>
                <button
                  onClick={() => { togglePublish(selectedCourse.id, !!selectedCourse.is_published); setSelectedCourse(prev => prev ? { ...prev, is_published: !prev.is_published } : null); }}
                  className={`px-4 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    selectedCourse.is_published
                      ? 'border-yellow-500/30 text-yellow-400 hover:border-yellow-500'
                      : 'border-border text-text-primary hover:border-teal hover:text-teal'
                  }`}
                >
                  <ShareNetwork size={14} weight="fill" />
                  {selectedCourse.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
