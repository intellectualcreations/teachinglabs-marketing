'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ClipboardText, CheckCircle, Circle, Funnel, Calendar,
  MagnifyingGlass, SortAscending,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Assignment, Submission } from '@/lib/supabase/types';

type FilterStatus = 'all' | 'todo' | 'done';
type SortBy = 'due_date' | 'created_at' | 'title';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function ClassActivitiesPage() {
  const params = useParams();
  const classId = params.id as string;
  const [activities, setActivities] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('due_date');

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let authHeaders: Record<string, string> = {};
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
        } catch { /* ignore */ }

        const res = await fetch(`/api/student/my-classes?userId=${user.id}`, { headers: authHeaders });
        if (!res.ok) return;
        const data = await res.json();

        const cls = (data.classes ?? []).find((c: { id: string; name: string }) => c.id === classId);
        if (cls) setClassName(cls.name);

        const classActivities = (data.assignments ?? []).filter((a: Assignment) => a.class_id === classId);
        setActivities(classActivities);

        const activityIds = classActivities.map((a: Assignment) => a.id);
        const classSubs = (data.submissions ?? []).filter((s: Submission) => activityIds.includes(s.assignment_id));
        setSubmissions(classSubs);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  const submittedIds = useMemo(() => new Set(submissions.map(s => s.assignment_id)), [submissions]);

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filterStatus === 'done') {
      result = result.filter(a => submittedIds.has(a.id));
    } else if (filterStatus === 'todo') {
      result = result.filter(a => !submittedIds.has(a.id));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'due_date') {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [activities, search, filterStatus, sortBy, submittedIds]);

  const doneCount = activities.filter(a => submittedIds.has(a.id)).length;
  const todoCount = activities.length - doneCount;
  const progress = activities.length > 0 ? Math.round((doneCount / activities.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Activities</h1>
        <p className="text-sm text-text-secondary">{className}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-card-bg rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">Progress</span>
          <span className="text-sm font-semibold text-teal">{progress}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2.5 mb-2">
          <div className="bg-teal h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-4 text-xs text-text-muted">
          <span>{doneCount} completed</span>
          <span>{todoCount} remaining</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-card-bg rounded-lg border border-border p-0.5">
          <Funnel size={14} className="text-text-muted ml-2" />
          {(['all', 'todo', 'done'] as FilterStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-teal text-navy'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {status === 'all' ? 'All' : status === 'todo' ? 'To Do' : 'Done'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortBy(prev => prev === 'due_date' ? 'created_at' : prev === 'created_at' ? 'title' : 'due_date')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card-bg border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <SortAscending size={14} />
          {sortBy === 'due_date' ? 'Due Date' : sortBy === 'title' ? 'Title' : 'Newest'}
        </button>
      </div>

      {/* Activities list */}
      {filteredActivities.length === 0 ? (
        <div className="bg-card-bg rounded-2xl border border-border p-12 text-center">
          <ClipboardText size={40} weight="fill" className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium mb-1">
            {activities.length === 0 ? 'No activities yet' : 'No matching activities'}
          </p>
          <p className="text-text-muted text-sm">
            {activities.length === 0 ? 'Your teacher hasn\'t created any activities for this class yet.' : 'Try changing your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map(activity => {
            const isDone = submittedIds.has(activity.id);
            const overdue = !isDone && isOverdue(activity.due_date);

            return (
              <div
                key={activity.id}
                className={`bg-card-bg rounded-xl border p-4 transition-colors ${
                  isDone ? 'border-green-500/20 bg-green-500/[0.02]' : overdue ? 'border-red-400/30' : 'border-border hover:border-teal/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle size={22} weight="fill" className="text-green-500" />
                    ) : (
                      <Circle size={22} className={overdue ? 'text-red-400' : 'text-text-muted'} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${isDone ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                        {activity.title}
                      </h3>
                      {overdue && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Overdue</span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                      <Calendar size={12} />
                      <span>{activity.due_date ? `Due ${formatDate(activity.due_date)}` : 'No due date'}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    isDone ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {isDone ? 'Done' : 'To Do'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
