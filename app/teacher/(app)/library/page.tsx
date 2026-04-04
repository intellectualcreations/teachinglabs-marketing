'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Books, Plus, MagnifyingGlass, CalendarBlank,
  PencilSimple,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Assignment, Class } from '@/lib/supabase/types';

export default function LibraryPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; setLoading(false); return; }

        // Fetch library data via admin API route (bypasses RLS)
        const res = await fetch(`/api/teacher/library?teacherId=${user.id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load library');
        }
        const data = await res.json();

        setClasses((data.classes ?? []) as Class[]);
        setAssignments((data.assignments ?? []) as Assignment[]);
      } catch (err) {
        console.error('Library fetch error:', err);
        setError('Failed to load activities');
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

  const filtered = useMemo(() => {
    if (!search) return assignments;
    const q = search.toLowerCase();
    return assignments.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      (a.description?.toLowerCase().includes(q) ?? false)
    );
  }, [assignments, search]);

  function formatDate(str: string) {
    const d = new Date(str);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
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
            Your reusable activities, aligned to standards. Create once, assign anytime.
          </p>
        </div>
        <Link
          href="/teacher/create-activity"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal text-navy
            font-heading font-bold text-sm hover:bg-teal/85 transition-colors shrink-0"
        >
          <Plus size={16} weight="bold" /> Create Activity
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
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

      {/* Activity Grid */}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card-bg border border-border rounded-[14px]">
          <MagnifyingGlass size={48} className="mx-auto text-text-secondary opacity-40" />
          <h3 className="font-heading font-bold text-lg text-text-primary mt-4 mb-2">No activities match your search</h3>
          <p className="text-sm text-text-secondary">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {filtered.map((a) => {
            const className = classNameMap.get(a.class_id) ?? 'Unknown Class';
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

                <div className="flex items-center gap-3 text-[11px] text-text-secondary mb-2.5">
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
    </div>
  );
}
