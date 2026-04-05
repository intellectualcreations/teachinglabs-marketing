'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Books, X, MagnifyingGlass, ArrowLeft, CheckCircle } from '@phosphor-icons/react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  classId: string;
  classIndex: number;
  onActivityAdded?: () => void;
}

export default function AddActivityModal({ isOpen, onClose, className: clsName, classId, classIndex, onActivityAdded }: AddActivityModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'choose' | 'library'>('choose');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView('choose');
      setSearch('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Fetch activities when switching to library view
  useEffect(() => {
    if (!isOpen || view !== 'library') return;
    async function fetchLibrary() {
      setLoading(true);
      try {
        // Get current user for teacherId
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const res = await fetch(`/api/teacher/library?teacherId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities ?? []);
          // Build set of already-assigned activity IDs
          const assigned = new Set<string>();
          for (const ca of (data.classActivities ?? [])) {
            if (ca.class_id === classId) assigned.add(ca.activity_id);
          }
          setAssignedIds(assigned);
        }
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, [isOpen, view, classId]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = activities.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (activity: any) => {
    setSaving(activity.id);
    try {
      // Fetch current class assignments for this activity
      const getRes = await fetch(`/api/teacher/activities/${activity.id}/classes`);
      const { classIds: existing } = getRes.ok ? await getRes.json() : { classIds: [] };
      // Add this class if not already assigned
      if (!existing.includes(classId)) {
        const updated = [...existing, classId];
        await fetch(`/api/teacher/activities/${activity.id}/classes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classIds: updated }),
        });
      }
      setAssignedIds(prev => new Set([...prev, activity.id]));
      setSuccessMsg(`Added "${activity.title}" to ${clsName}!`);
      setTimeout(() => {
        setSuccessMsg('');
        onActivityAdded?.();
      }, 1500);
    } catch (err) {
      console.error('Failed to add activity:', err);
    } finally {
      setSaving(null);
    }
  };

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
        {/* Success overlay */}
        {successMsg && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-[#1a2744]"
            style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}>
            <CheckCircle size={48} weight="fill" className="text-teal mb-3" />
            <p className="font-heading font-bold text-lg text-text-primary">{successMsg}</p>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-text-secondary hover:text-text-primary
            hover:bg-border/40 transition-colors"
        >
          <X size={20} weight="bold" />
        </button>

        {view === 'choose' ? (
          <div className="p-7">
            <h2 className="font-heading font-bold text-xl text-text-primary">Add Activity</h2>
            <p className="text-sm text-text-secondary mt-1 mb-6">{clsName}</p>

            <div className="grid gap-3">
              <button
                onClick={() => router.push(`/teacher/create-activity?class=${classIndex}`)}
                className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card-bg
                  hover:border-teal hover:shadow-[0_2px_12px_rgba(31,58,95,0.06)] transition-all text-left group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center
                  group-hover:bg-teal/20 transition-colors">
                  <Plus size={24} weight="bold" className="text-teal" />
                </div>
                <div>
                  <div className="font-heading font-bold text-[15px] text-text-primary">Create New Activity</div>
                  <div className="text-[13px] text-text-secondary mt-0.5">Build an activity from scratch</div>
                </div>
              </button>

              <button
                onClick={() => setView('library')}
                className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card-bg
                  hover:border-navy hover:shadow-[0_2px_12px_rgba(31,58,95,0.06)] transition-all text-left group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center
                  group-hover:bg-navy/20 transition-colors">
                  <Books size={24} weight="bold" className="text-navy" />
                </div>
                <div>
                  <div className="font-heading font-bold text-[15px] text-text-primary">Choose from Library</div>
                  <div className="text-[13px] text-text-secondary mt-0.5">Browse your saved activities</div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-7">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => { setView('choose'); setSearch(''); }}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border/40
                  transition-colors -ml-1"
              >
                <ArrowLeft size={18} weight="bold" />
              </button>
              <h2 className="font-heading font-bold text-xl text-text-primary">Choose Activity from Library</h2>
            </div>
            <p className="text-sm text-text-secondary mt-1 mb-4 ml-7">{clsName}</p>

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
              {loading ? (
                <p className="text-center text-sm text-text-secondary py-8">Loading activities...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-sm text-text-secondary py-8">No activities match your search.</p>
              ) : (
                filtered.map((a) => {
                  const alreadyAdded = assignedIds.has(a.id);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border
                        hover:border-border hover:bg-border/20 transition-colors"
                    >
                      <div>
                        <div className="font-heading font-semibold text-[14px] text-text-primary">{a.title}</div>
                        {a.subject && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-navy/10 text-[11px]
                            font-medium text-navy uppercase tracking-wide">
                            {a.subject}
                          </span>
                        )}
                      </div>
                      {alreadyAdded ? (
                        <span className="flex-shrink-0 ml-3 px-3.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle size={14} weight="fill" /> Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAdd(a)}
                          disabled={saving === a.id}
                          className="flex-shrink-0 ml-3 px-3.5 py-1.5 rounded-lg bg-teal text-navy text-xs
                            font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
                        >
                          {saving === a.id ? 'Adding...' : 'Add to Class'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
