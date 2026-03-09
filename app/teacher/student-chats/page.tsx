'use client';

import { useState, useMemo } from 'react';
import {
  ChatsCircle, MagnifyingGlass, X, Lightbulb, Eye,
  WarningCircle, ArrowRight, CheckCircle, TrendUp, BellRinging,
  Sparkle, StarFour,
} from '@phosphor-icons/react';
import { DEMO_CHATS, DEMO_STUDENTS_CHAT, CHAT_CLASSES, type ChatConvo } from '@/lib/demo-chats';

const TAG_COLORS = {
  green: 'bg-success/10 text-success',
  amber: 'bg-warning/10 text-warning',
  teal: 'bg-teal/10 text-teal',
};

const TAG_ICONS = {
  green: CheckCircle,
  amber: WarningCircle,
  teal: ArrowRight,
};

// Class label colors (matching HTML class tab colors)
const CLASS_COLORS: Record<string, string> = {
  '5th Period Math': 'bg-navy/8 text-navy',
  '3rd Period Math': 'bg-teal/10 text-teal',
  'ELA': 'bg-teal/10 text-teal',
  'Science': 'bg-purple/10 text-purple',
  'Social Studies': 'bg-info/10 text-info',
};

export default function StudentChatsPage() {
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [classTab, setClassTab] = useState('All Classes');
  const [selectedChat, setSelectedChat] = useState<ChatConvo | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return DEMO_CHATS.filter((c) => {
      if (studentFilter && c.student !== studentFilter) return false;
      if (classTab !== 'All Classes' && c.className !== classTab) return false;
      return true;
    });
  }, [studentFilter, classTab]);

  const visibleClasses = useMemo(() => {
    if (!studentFilter) return CHAT_CLASSES;
    const studentClasses = DEMO_CHATS
      .filter((c) => c.student === studentFilter)
      .map((c) => c.className);
    return ['All Classes', ...Array.from(new Set(studentClasses))];
  }, [studentFilter]);

  const classCounts = useMemo(() => {
    const base = studentFilter
      ? DEMO_CHATS.filter((c) => c.student === studentFilter)
      : DEMO_CHATS;
    const counts: Record<string, number> = { 'All Classes': base.length };
    base.forEach((c) => {
      counts[c.className] = (counts[c.className] || 0) + 1;
    });
    return counts;
  }, [studentFilter]);

  // Recap text for the bottom section (always class-level overview)
  const recapSummary = useMemo(() => {
    if (studentFilter && classTab !== 'All Classes') {
      return `${studentFilter.split(' ')[0]}'s ${classTab} performance: focused subject insights available. Click a conversation to see detail.`;
    }
    if (studentFilter) {
      return `Cross-class insights for ${studentFilter.split(' ')[0]}: patterns across subjects help identify strengths and areas for growth.`;
    }
    return `This week your students had 47 conversations across all classes. Engagement is highest in Math (62%) and lowest in Social Studies (34%).`;
  }, [studentFilter, classTab]);

  const recapTags = useMemo(() => {
    if (studentFilter) {
      return [{ label: 'Cross-class overview', color: 'teal' as const }];
    }
    return [
      { label: 'Math engagement strong', color: 'green' as const },
      { label: 'ELA writing improving', color: 'green' as const },
      { label: 'Social Studies low engagement', color: 'amber' as const },
      { label: 'Try cross-subject prompts', color: 'teal' as const },
    ];
  }, [studentFilter]);

  function clearStudent() {
    setStudentFilter(null);
    setClassTab('All Classes');
    setSelectedChat(null);
  }

  function selectStudent(name: string) {
    setStudentFilter(name);
    setClassTab('All Classes');
    setSelectedChat(null);
    setSearchOpen(false);
    setSearchQuery('');
  }

  const filteredStudents = searchQuery
    ? DEMO_STUDENTS_CHAT.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : DEMO_STUDENTS_CHAT;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
          <ChatsCircle size={24} weight="fill" className="text-teal" /> Student Chats
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor conversations, track engagement, and get insights from your Teaching Twin
        </p>
      </div>

      {/* Student Filter Bar */}
      <div className="flex items-center gap-2.5 p-3 bg-card-bg border border-border rounded-lg mb-4">
        <span className="font-semibold text-sm text-text-primary flex items-center gap-1.5 whitespace-nowrap">
          <Eye size={16} weight="fill" className="text-teal" /> Filter by Student
        </span>
        <div className="w-px h-5 bg-border" />
        {studentFilter ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal/8 border-[1.5px] border-teal rounded-full
            text-sm font-semibold text-teal">
            {studentFilter}
            <button onClick={clearStudent} className="text-teal hover:text-teal/70 cursor-pointer">
              <X size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-8 pr-3 py-1.5 border-[1.5px] border-border rounded-lg text-sm
                bg-surface text-text-primary outline-none focus:border-teal"
            />
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card-bg border border-border
                rounded-lg max-h-56 overflow-y-auto z-20 shadow-lg">
                {filteredStudents.map((s) => (
                  <div
                    key={s.name}
                    onClick={() => selectStudent(s.name)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer hover:bg-teal/5
                      border-b border-border last:border-b-0 text-sm text-text-primary"
                  >
                    <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center
                      text-[10px] font-bold shrink-0">
                      {s.initials}
                    </div>
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class Tabs */}
      <div className="flex gap-1 border-b-2 border-border mb-0">
        {visibleClasses.map((cls) => (
          <button
            key={cls}
            onClick={() => { setClassTab(cls); setSelectedChat(null); }}
            className={`px-4 py-2.5 font-heading font-semibold text-sm border-b-2 -mb-[2px]
              transition-all cursor-pointer flex items-center gap-1.5 bg-transparent border-t-0 border-l-0 border-r-0
              ${classTab === cls
                ? 'text-navy border-navy'
                : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
          >
            {cls}
            {classCounts[cls] != null && (
              <span className="text-[10px] font-bold bg-teal/10 text-teal px-1.5 py-0.5 rounded-full">
                {classCounts[cls]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content: Chat List | Conversation Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 mt-5 border border-border rounded-[14px] overflow-hidden">
        {/* Chat List */}
        <div className="border-r border-border">
          <div className="max-h-[460px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-text-secondary text-sm">No conversations match your filters.</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedChat(c)}
                  className={`flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-b-0
                    cursor-pointer transition-colors
                    ${selectedChat?.id === c.id ? 'bg-teal/5' : 'hover:bg-card-bg'}`}
                >
                  <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center
                    text-xs font-bold shrink-0 mt-0.5">
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-heading font-bold text-sm text-text-primary truncate">{c.student}</span>
                      {c.review && (
                        <span className="text-[9px] font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded shrink-0">REVIEW</span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary truncate mb-1.5">{c.topic}</div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CLASS_COLORS[c.className] || 'bg-card-bg text-text-secondary'}`}>
                      {c.className}
                    </span>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <div className="text-[10px] text-text-secondary whitespace-nowrap">{c.time}</div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full
                        ${c.status === 'active' ? 'bg-success' : c.status === 'review' ? 'bg-warning' : 'bg-text-muted'}`}
                      />
                      <span className="text-[10px] text-text-secondary">
                        {c.status === 'active' ? 'Active now' : 'Idle'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Detail / Empty State */}
        <div className="flex items-center justify-center bg-card-bg min-h-[200px]">
          {selectedChat ? (
            <div className="p-6 w-full h-full">
              <h3 className="font-heading font-bold text-sm text-text-primary mb-1">{selectedChat.topic}</h3>
              <p className="text-xs text-text-secondary mb-4">{selectedChat.student} · {selectedChat.className}</p>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{selectedChat.recap.summary}</p>
              <div className="flex flex-wrap gap-2">
                {selectedChat.recap.tags.map((tag, i) => {
                  const Icon = TAG_ICONS[tag.color];
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${TAG_COLORS[tag.color]}`}
                    >
                      <Icon size={12} weight="fill" /> {tag.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-6">
              <div className="w-14 h-14 rounded-full bg-border/50 flex items-center justify-center mx-auto mb-3">
                <ChatsCircle size={28} className="text-text-muted" />
              </div>
              <p className="font-heading font-semibold text-sm text-text-primary mb-1">Select a conversation</p>
              <p className="text-xs text-text-secondary">Click on a chat to see the conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Assistant Recap & Suggestions (full width, below) */}
      <div className="mt-4 bg-card-bg border border-border rounded-[14px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-sm text-text-primary flex items-center gap-2">
            <Lightbulb size={18} weight="fill" className="text-teal" />
            Assistant Recap &amp; Suggestions
          </h3>
          <span className="text-xs text-text-secondary">
            {studentFilter ? studentFilter.split(' ')[0] : 'All Students'}
          </span>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-4">{recapSummary}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {recapTags.map((tag, i) => {
            const Icon = TAG_ICONS[tag.color];
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${TAG_COLORS[tag.color]}`}
              >
                <Icon size={12} weight="fill" /> {tag.label}
              </span>
            );
          })}
        </div>

        {!studentFilter && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendUp size={14} weight="fill" className="text-success" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-success">Trending Up</span>
              </div>
              <p className="text-xs text-text-secondary">Response length increased 23% across all classes this week.</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BellRinging size={14} weight="fill" className="text-warning" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-warning">Attention</span>
              </div>
              <p className="text-xs text-text-secondary">3 students haven&apos;t started a chat in over 5 days.</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkle size={14} weight="fill" className="text-teal" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-teal">Suggestion</span>
              </div>
              <p className="text-xs text-text-secondary">Try assigning a personal chat prompt in Social Studies to boost engagement.</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <StarFour size={14} weight="fill" className="text-purple" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-purple">Highlight</span>
              </div>
              <p className="text-xs text-text-secondary">Sophia&apos;s essay review shows significant improvement in thesis structure.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
