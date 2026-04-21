'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, PencilSimple, Users, Books, Info, X, MagnifyingGlass, ArrowLeft, CheckCircle, Copy, Check } from '@phosphor-icons/react';
import ClassIcon from '@/components/shared/ClassIcon';
import { createClient } from '@/lib/supabase/client';
import type { Class, Assignment } from '@/lib/supabase/types';

const STRIPE_COLORS = ['var(--color-navy)', 'var(--color-teal)', '#F59E0B', '#E8836B'];

interface ClassWithCounts extends Class {
  studentCount: number;
  assignmentCount: number;
}

/* ─── Modal Component ─── */
function AddActivityModal({
  className: clsName,
  classId,
  onClose,
}: {
  className: string;
  classId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [view, setView] = useState<'choose' | 'library'>('library');
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (view === 'library') {
      setLoadingLib(true);
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) { setLoadingLib(false); return; }
        // Use server API to bypass RLS
        fetch(`/api/teacher/activities?teacherId=${user.id}`)
          .then(r => r.json())
          .then(d => {
            setAssignments((d.activities ?? []) as Assignment[]);
            setLoadingLib(false);
          })
          .catch(() => setLoadingLib(false));
      });
    }
  }, [view]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] mx-4 bg-[#1a2744] border border-border rounded-2xl shadow-xl
          animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {successMsg && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-[#1a2744]"
            style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}>
            <CheckCircle size={48} weight="fill" className="text-teal mb-3" />
            <p className="font-heading font-bold text-lg text-text-primary">{successMsg}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-text-secondary hover:text-text-primary
            hover:bg-border/40 transition-colors"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="p-7">
            <h2 className="font-heading font-bold text-xl text-text-primary">Add Activity</h2>
            <p className="text-sm text-text-secondary mt-1 mb-4">{clsName}</p>

            <div className="relative mb-4">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card-bg text-sm
                  text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-navy
                  transition-colors"
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto -mx-2 px-2 space-y-2">
              {loadingLib ? (
                <p className="text-center text-sm text-text-secondary py-8">Loading...</p>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-secondary mb-3">
                    {assignments.length === 0 ? 'No activities in your library yet.' : 'No activities match your search.'}
                  </p>
                  {assignments.length === 0 && (
                    <button
                      onClick={() => router.push('/teacher/library')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors"
                    >
                      <Books size={16} weight="fill" />
                      Manage Content in Your Library
                    </button>
                  )}
                </div>
              ) : (
                filtered.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border
                      hover:border-border hover:bg-border/20 transition-colors"
                  >
                    <div>
                      <div className="font-heading font-semibold text-[14px] text-text-primary">{a.title}</div>
                      {a.due_date && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-navy/8 text-[11px]
                          font-medium text-navy uppercase tracking-wide">
                          Due {new Date(a.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          // Fetch current class assignments for this activity
                          const getRes = await fetch(`/api/teacher/activities/${a.id}/classes`);
                          const { classIds: existing } = getRes.ok ? await getRes.json() : { classIds: [] };
                          // Add this class if not already assigned
                          const updated = existing.includes(classId) ? existing : [...existing, classId];
                          await fetch(`/api/teacher/activities/${a.id}/classes`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ classIds: updated }),
                          });
                          setSuccessMsg(`Added to ${clsName}!`);
                          setTimeout(() => onClose(), 1500);
                        } catch (err) {
                          console.error('Failed to add activity to class:', err);
                        }
                      }}
                      className="flex-shrink-0 ml-3 px-3.5 py-1.5 rounded-lg bg-teal text-navy text-xs
                        font-semibold hover:bg-teal/90 transition-colors"
                    >
                      Add to Class
                    </button>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function MyClassesPage() {
  const [classes, setClasses] = useState<ClassWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ name: string; id: string } | null>(null);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; setLoading(false); return; }

        // Fetch teacher's classes with counts via API route (bypasses RLS)
        const res = await fetch(`/api/classes/by-teacher?teacherId=${user.id}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? `Failed to load classes (${res.status})`);
          setLoading(false);
          return;
        }
        const classesWithCounts = (await res.json()) as ClassWithCounts[];
        classesWithCounts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setClasses(classesWithCounts);
      } catch (err) {
        console.error('My classes fetch error:', err);
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary text-sm">Loading classes...</div>
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
          <h1 className="font-heading text-[26px] font-bold text-text-primary">My Classes</h1>
          <p className="text-text-secondary text-[15px] mt-1">
            {classes.length} class{classes.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Link
          href="/teacher/create-class"
          className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg bg-navy text-white
            font-heading font-semibold text-[13px] hover:bg-navy/90 transition-colors"
        >
          <Plus size={14} weight="bold" /> Create Class
        </Link>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="text-center py-[60px] px-5 bg-card-bg border-2 border-dashed border-border rounded-[20px] mt-6">
          <div className="text-[40px] mb-3 opacity-40">📚</div>
          <div className="font-heading font-semibold text-base text-text-primary mb-1.5">No classes yet</div>
          <p className="text-sm text-text-secondary mb-5">
            Create your first class to get started. You&apos;ll be able to add students and share a join code.
          </p>
          <Link
            href="/teacher/create-class"
            className="inline-flex items-center gap-1.5 px-7 py-3 rounded-lg bg-navy text-white
              font-heading font-bold text-sm"
          >
            Create Your First Class
          </Link>
        </div>
      ) : (
        <div
          className="grid gap-5 mt-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}
        >
          {classes.map((c, i) => (
            <div
              key={c.id}
              className="bg-card-bg border border-border rounded-[20px] p-6 relative overflow-hidden
                transition-shadow hover:shadow-[0_4px_16px_rgba(31,58,95,0.08)]"
            >
              {/* Color stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: STRIPE_COLORS[i % 4] }}
              />

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-4">
                <ClassIcon name={c.name} icon={c.icon} size={36} />
                <div>
                  <div className="font-heading font-bold text-[17px] text-text-primary">{c.name}</div>
                  <div className="text-[13px] text-text-secondary mt-0.5">
                    {c.grade_level}{c.grade_level && c.subject ? ' · ' : ''}{c.subject}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-5 mb-4">
                <div className="text-center">
                  <div className="font-heading font-bold text-[18px] text-navy">{c.studentCount}</div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px]">Students</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-[18px] text-navy">{c.assignmentCount}</div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px]">Activities</div>
                </div>
              </div>

              {/* Join Code */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(c.join_code || '').catch(() => {});
                  setCopiedCode(c.join_code || '');
                  setTimeout(() => setCopiedCode(''), 2000);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal/8 border border-teal/20
                  rounded-lg font-heading font-bold text-base tracking-[2px] text-teal mb-4
                  hover:bg-teal/15 transition-colors cursor-pointer"
                title="Click to copy join code"
              >
                {c.join_code}
                {copiedCode === c.join_code ? (
                  <Check size={14} weight="bold" className="text-green-400" />
                ) : (
                  <Copy size={14} weight="bold" className="text-teal/60" />
                )}
              </button>

              {/* Actions */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setModal({ name: c.name, id: c.id })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal text-navy
                    rounded-lg text-[11px] font-semibold hover:bg-teal/90 transition-colors"
                >
                  <Plus size={12} weight="bold" /> Add Activity
                </button>
                <Link
                  href={`/teacher/class-details?class=${c.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border-[1.5px] border-border
                    rounded-lg text-[11px] font-medium text-text-secondary hover:border-navy hover:text-navy
                    transition-colors"
                >
                  <Info size={12} /> Class Details
                </Link>
                <Link
                  href={`/teacher/students?class=${c.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border-[1.5px] border-border
                    rounded-lg text-[11px] font-medium text-text-secondary hover:border-navy hover:text-navy
                    transition-colors"
                >
                  <Users size={12} /> Students
                </Link>
                <Link
                  href={`/teacher/edit-class?class=${c.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border-[1.5px] border-border
                    rounded-lg text-[11px] font-medium text-text-secondary hover:border-navy hover:text-navy
                    transition-colors"
                >
                  <PencilSimple size={12} /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity Modal */}
      {modal && (
        <AddActivityModal
          className={modal.name}
          classId={modal.id}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
