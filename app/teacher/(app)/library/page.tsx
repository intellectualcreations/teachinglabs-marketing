'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Books, Plus, MagnifyingGlass, File, Link as LinkIcon,
  CalendarBlank, ShareFat, PencilSimple, ChalkboardTeacher,
  PaperPlaneTilt, Check, X,
} from '@phosphor-icons/react';
import ClassIcon from '@/components/shared/ClassIcon';
import { DEMO_ACTIVITIES, LIBRARY_CLASSES, type DemoActivity } from '@/lib/demo-activities';

type StatusFilter = 'all' | 'assigned' | 'ready' | 'draft';

export default function LibraryPage() {
  const [activities, setActivities] = useState(DEMO_ACTIVITIES);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState<DemoActivity | null>(null);
  const [checkedClasses, setCheckedClasses] = useState<Set<string>>(new Set());

  const filtered = activities.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.standards.some((s) => s.code.toLowerCase().includes(q) || s.text.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  function formatDate(str: string) {
    const d = new Date(str);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }

  function openAssignModal(act: DemoActivity) {
    setAssignModal(act);
    setCheckedClasses(new Set(act.assignedTo));
  }

  function toggleClass(name: string) {
    setCheckedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function confirmAssign() {
    if (!assignModal) return;
    const names = Array.from(checkedClasses);
    setActivities((prev) =>
      prev.map((a) =>
        a.id === assignModal.id
          ? { ...a, assignedTo: names, status: names.length > 0 ? 'assigned' : 'ready' }
          : a
      )
    );
    setAssignModal(null);
  }

  const statusPills: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'ready', label: 'Ready' },
    { key: 'draft', label: 'Drafts' },
  ];

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
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal text-white
            font-heading font-bold text-sm hover:bg-teal/85 transition-colors shrink-0"
        >
          <Plus size={16} weight="bold" /> Create Activity
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search activities or standards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-[9px] border-[1.5px] border-border rounded-lg text-[13px]
              bg-card-bg text-text-primary font-heading outline-none focus:border-teal"
          />
        </div>
        {statusPills.map((p) => (
          <button
            key={p.key}
            onClick={() => setStatusFilter(p.key)}
            className={`px-3.5 py-[7px] border-[1.5px] rounded-full text-xs font-semibold font-heading
              cursor-pointer transition-all ${
                statusFilter === p.key
                  ? 'bg-teal text-white border-teal'
                  : 'bg-card-bg text-text-primary border-border hover:border-teal hover:text-teal'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Activity Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card-bg border border-border rounded-[14px]">
          <Books size={48} className="mx-auto text-text-secondary opacity-40" />
          <h3 className="font-heading font-bold text-lg text-text-primary mt-4 mb-2">No activities yet</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-5">
            Create your first activity by uploading materials you already use. Your Teaching Twin will align them to standards automatically.
          </p>
          <Link
            href="/teacher/create-activity"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal text-white
              font-heading font-bold text-sm"
          >
            <Plus size={16} weight="bold" /> Create Activity
          </Link>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {filtered.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onAssign={() => openAssignModal(a)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setAssignModal(null)}
        >
          <div
            className="border border-border rounded-2xl p-7 max-w-lg w-[90%] shadow-2xl bg-[#1a2744]"
            style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-1">
              <ShareFat size={20} weight="fill" className="text-teal" /> Assign Activity
            </h2>
            <p className="text-[13px] text-text-secondary mb-4">
              Select the classes that should receive{' '}
              <span className="font-bold text-teal">{assignModal.title}</span>
            </p>

            {LIBRARY_CLASSES.map((c) => {
              const checked = checkedClasses.has(c.name);
              return (
                <div
                  key={c.name}
                  onClick={() => toggleClass(c.name)}
                  className={`flex items-center gap-3 p-3 border-[1.5px] rounded-lg mb-2 cursor-pointer transition-all
                    ${checked ? 'border-teal bg-teal/[0.04]' : 'border-border bg-card-bg hover:border-teal'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                    ${checked ? 'bg-teal border-teal' : 'border-border'}`}>
                    {checked && <Check size={14} weight="bold" color="white" />}
                  </div>
                  <ClassIcon name={c.name} size={32} />
                  <div className="flex-1">
                    <div className="font-semibold text-[13px] text-text-primary">{c.name}</div>
                    <div className="text-[11px] text-text-secondary">{c.students} students</div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-2.5 mt-3.5">
              <label className="font-semibold text-[13px] text-text-primary flex items-center gap-1.5 whitespace-nowrap">
                <CalendarBlank size={16} weight="fill" className="text-teal" /> Due Date
              </label>
              <input
                type="date"
                className="flex-1 px-3 py-2 border-[1.5px] border-border rounded-lg text-[13px]
                  bg-card-bg text-text-primary font-heading outline-none focus:border-teal"
              />
            </div>

            <div className="flex gap-2.5 mt-5 justify-end">
              <button
                onClick={() => setAssignModal(null)}
                className="px-5 py-2.5 border-[1.5px] border-border rounded-lg text-[13px] font-semibold
                  text-text-primary hover:border-teal hover:text-teal transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssign}
                className="px-5 py-2.5 bg-teal text-white rounded-lg text-[13px] font-bold
                  flex items-center gap-1.5 hover:bg-teal/85 transition-colors cursor-pointer"
              >
                <PaperPlaneTilt size={16} weight="fill" /> Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityCard({
  activity: a,
  onAssign,
  formatDate,
}: {
  activity: DemoActivity;
  onAssign: () => void;
  formatDate: (s: string) => string;
}) {
  const statusStyles: Record<string, string> = {
    assigned: 'bg-teal/10 text-teal',
    ready: 'bg-success/10 text-success',
    draft: 'bg-warning/10 text-warning',
  };
  const statusLabel =
    a.status === 'assigned' ? `Assigned (${a.assignedTo.length})` : a.status === 'ready' ? 'Ready' : 'Draft';

  return (
    <div className="bg-card-bg border border-border rounded-[14px] p-5 relative overflow-hidden
      cursor-pointer hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all">

      {/* Top */}
      <div className="flex items-start justify-between mb-2.5 gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ClassIcon name={a.subject || a.title} size={40} />
          <h3 className="font-heading font-bold text-[15px] text-text-primary">{a.title}</h3>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full shrink-0 ${statusStyles[a.status]}`}>
          {statusLabel}
        </span>
      </div>

      {/* Standards */}
      {a.standards.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {a.standards.map((s) => (
            <span key={s.code} className="text-[10px] font-bold text-teal bg-teal/8 px-2 py-0.5 rounded">
              {s.code}
            </span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-text-secondary mb-2.5">
        <span className="flex items-center gap-1">
          <File size={14} weight="fill" /> {a.files.length} file{a.files.length !== 1 ? 's' : ''}
        </span>
        {a.links.length > 0 && (
          <span className="flex items-center gap-1">
            <LinkIcon size={14} weight="fill" /> {a.links.length} link{a.links.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="flex items-center gap-1">
          <CalendarBlank size={14} weight="fill" /> {formatDate(a.createdAt)}
        </span>
      </div>

      {/* File tags */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {a.files.map((f) => {
          const ext = f.split('.').pop()?.toUpperCase();
          return (
            <span key={f} className="text-[10px] font-medium text-text-secondary bg-surface border border-border
              px-2 py-0.5 rounded flex items-center gap-1">
              <File size={12} weight="fill" /> {ext}
            </span>
          );
        })}
      </div>

      {/* Assigned to */}
      {a.assignedTo.length > 0 && (
        <div className="text-[11px] text-text-secondary mb-3 flex items-center gap-1">
          <ChalkboardTeacher size={14} weight="fill" /> {a.assignedTo.join(', ')}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onAssign(); }}
          className="flex-1 py-2 rounded-md bg-teal text-white text-xs font-semibold
            flex items-center justify-center gap-1 hover:bg-teal/85 transition-colors cursor-pointer"
        >
          <ShareFat size={14} weight="fill" /> Assign
        </button>
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
}
