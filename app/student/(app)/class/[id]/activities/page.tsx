'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ClipboardText, CheckCircle, Circle, Funnel, Calendar,
  MagnifyingGlass, SortAscending, Archive, PaperPlaneRight,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Assignment, Submission } from '@/lib/supabase/types';

type FilterStatus = 'all' | 'todo' | 'done' | 'archived';
type SortBy = 'due_date' | 'created_at' | 'title';

interface ActivityStatus {
  student_id: string;
  activity_id: string;
  class_id: string;
  status: string;
  archived: boolean;
  turned_in_at: string | null;
}

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
  const router = useRouter();
  const classId = params.id as string;
  const [activities, setActivities] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activityStatuses, setActivityStatuses] = useState<ActivityStatus[]>([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('due_date');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

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

        const classActivities = (data.assignments ?? []).filter((a: any) => a.class_id === classId);
        setActivities(classActivities);

        const activityIds = classActivities.map((a: Assignment) => a.id);
        const classSubs = (data.submissions ?? []).filter((s: Submission) => activityIds.includes(s.assignment_id));
        setSubmissions(classSubs);

        // Fetch activity statuses (turn-in, archive)
        const statusRes = await fetch(`/api/student/activity-status?studentId=${user.id}&classId=${classId}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setActivityStatuses(statusData.statuses ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  const statusMap = useMemo(() => {
    const map = new Map<string, ActivityStatus>();
    activityStatuses.forEach(s => map.set(s.activity_id, s));
    return map;
  }, [activityStatuses]);

  const submittedIds = useMemo(() => new Set(submissions.map(s => s.assignment_id)), [submissions]);

  const isDone = useCallback((activityId: string) => {
    const st = statusMap.get(activityId);
    return submittedIds.has(activityId) || st?.status === 'done';
  }, [statusMap, submittedIds]);

  const isArchived = useCallback((activityId: string) => {
    return statusMap.get(activityId)?.archived === true;
  }, [statusMap]);

  const handleTurnIn = useCallback(async (e: React.MouseEvent, activityId: string) => {
    e.stopPropagation();
    const res = await fetch('/api/student/activity-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: userId, activityId, classId, action: 'turn_in' }),
    });
    if (res.ok) {
      const data = await res.json();
      setActivityStatuses(prev => {
        const filtered = prev.filter(s => s.activity_id !== activityId);
        return [...filtered, data.status];
      });
    }
  }, [userId, classId]);

  const handleArchive = useCallback(async (e: React.MouseEvent, activityId: string, archive: boolean) => {
    e.stopPropagation();
    const res = await fetch('/api/student/activity-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: userId, activityId, classId, action: archive ? 'archive' : 'unarchive' }),
    });
    if (res.ok) {
      const data = await res.json();
      setActivityStatuses(prev => {
        const filtered = prev.filter(s => s.activity_id !== activityId);
        return [...filtered, data.status];
      });
    }
  }, [userId, classId]);

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (filterStatus === 'archived') {
      result = result.filter(a => isArchived(a.id));
    } else {
      // Non-archived views exclude archived items
      result = result.filter(a => !isArchived(a.id));
      if (filterStatus === 'done') {
        result = result.filter(a => isDone(a.id));
      } else if (filterStatus === 'todo') {
        result = result.filter(a => !isDone(a.id));
      }
    }

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
  }, [activities, search, filterStatus, sortBy, isDone, isArchived]);

  const doneCount = activities.filter(a => isDone(a.id) && !isArchived(a.id)).length;
  const todoCount = activities.filter(a => !isDone(a.id) && !isArchived(a.id)).length;
  const archivedCount = activities.filter(a => isArchived(a.id)).length;
  const activeTotal = activities.length - archivedCount;
  const progress = activeTotal > 0 ? Math.round((doneCount / activeTotal) * 100) : 0;

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
          {archivedCount > 0 && <span>{archivedCount} archived</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
          />
        </div>

        <div className="flex items-center gap-1 bg-card-bg rounded-lg border border-border p-0.5">
          <Funnel size={14} className="text-text-muted ml-2" />
          {(['all', 'todo', 'done', 'archived'] as FilterStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === status
                  ? status === 'archived' ? 'bg-text-muted text-white' : 'bg-teal text-navy'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {status === 'all' ? 'All' : status === 'todo' ? 'To Do' : status === 'done' ? 'Done' : `Archived${archivedCount > 0 ? ` (${archivedCount})` : ''}`}
            </button>
          ))}
        </div>

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
            {filterStatus === 'archived' ? 'No archived activities' : activities.length === 0 ? 'No activities yet' : 'No matching activities'}
          </p>
          <p className="text-text-muted text-sm">
            {filterStatus === 'archived'
              ? 'Activities you archive will appear here.'
              : activities.length === 0
              ? 'Your teacher hasn\'t created any activities for this class yet.'
              : 'Try changing your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map(activity => {
            const done = isDone(activity.id);
            const archived = isArchived(activity.id);
            const overdue = !done && !archived && isOverdue(activity.due_date);
            const statusRec = statusMap.get(activity.id);

            return (
              <div
                key={activity.id}
                onClick={() => router.push(`/student/class/${classId}/activity/${activity.id}`)}
                className={`bg-card-bg rounded-xl border p-4 transition-colors cursor-pointer ${
                  archived ? 'border-border opacity-60' : done ? 'border-green-500/20 bg-green-500/[0.02]' : overdue ? 'border-red-400/30' : 'border-border hover:border-teal/30 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {done ? (
                      <CheckCircle size={22} weight="fill" className="text-green-500" />
                    ) : (
                      <Circle size={22} className={overdue ? 'text-red-400' : 'text-text-muted'} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${done ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                        {activity.title}
                      </h3>
                      {overdue && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Overdue</span>
                      )}
                      {archived && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400">Archived</span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Calendar size={12} />
                        <span>{activity.due_date ? `Due ${formatDate(activity.due_date)}` : 'No due date'}</span>
                      </div>
                      {done && statusRec?.turned_in_at && (
                        <span className="text-[10px] text-green-500">
                          Turned in {formatDate(statusRec.turned_in_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Turn it in button (only for non-done, non-archived) */}
                    {!done && !archived && (
                      <button
                        onClick={(e) => handleTurnIn(e, activity.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-semibold transition-colors"
                        title="Turn it in"
                      >
                        <PaperPlaneRight size={12} weight="fill" />
                        Turn In
                      </button>
                    )}

                    {/* Archive / Unarchive button */}
                    {archived ? (
                      <button
                        onClick={(e) => handleArchive(e, activity.id, false)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-border/30 text-text-muted hover:text-text-primary text-xs transition-colors"
                        title="Unarchive"
                      >
                        <Archive size={12} />
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleArchive(e, activity.id, true)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-border/30 transition-colors"
                        title="Archive"
                      >
                        <Archive size={14} />
                      </button>
                    )}

                    {/* Status badge */}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      done ? 'bg-green-500/10 text-green-600' : archived ? 'bg-gray-500/10 text-gray-400' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {done ? 'Done' : archived ? 'Archived' : 'To Do'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
