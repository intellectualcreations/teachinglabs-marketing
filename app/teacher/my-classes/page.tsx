'use client';

import Link from 'next/link';
import { Plus, PencilSimple, Users, Books } from '@phosphor-icons/react';
import ClassIcon from '@/components/shared/ClassIcon';
import { DEMO_CLASSES } from '@/lib/demo-data';

const STRIPE_COLORS = ['var(--color-navy)', 'var(--color-teal)', '#F59E0B', '#E8836B'];

export default function MyClassesPage() {
  const classes = DEMO_CLASSES;

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
                <ClassIcon name={c.name} size={36} />
                <div>
                  <div className="font-heading font-bold text-[17px] text-text-primary">{c.name}</div>
                  <div className="text-[13px] text-text-secondary mt-0.5">
                    {c.grade}{c.grade && c.subject ? ' · ' : ''}{c.subject}
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
                  <div className="font-heading font-bold text-[18px] text-navy">0</div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px]">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-[18px] text-navy">0</div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px]">Active Chats</div>
                </div>
              </div>

              {/* Join Code */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal/8 border border-teal/20
                rounded-lg font-heading font-bold text-base tracking-[2px] text-teal mb-4">
                {c.code}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/teacher/edit-class?class=${i}`}
                  className="inline-flex items-center gap-[5px] px-3.5 py-1.5 border-[1.5px] border-border
                    rounded-lg text-xs font-medium text-text-secondary hover:border-navy hover:text-navy
                    transition-colors"
                >
                  <PencilSimple size={13} /> Edit
                </Link>
                <Link
                  href={`/teacher/students?class=${i}`}
                  className="inline-flex items-center gap-[5px] px-3.5 py-1.5 border-[1.5px] border-border
                    rounded-lg text-xs font-medium text-text-secondary hover:border-navy hover:text-navy
                    transition-colors"
                >
                  <Users size={13} /> View Students
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
