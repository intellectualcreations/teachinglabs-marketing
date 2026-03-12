'use client';

import { useState, useMemo } from 'react';
import {
  Robot, ChatCircle, Users, UsersThree, Lightning, ChartBar,
  FunnelSimple, CaretDown, CaretUp, Warning, CheckCircle, X, Clock,
} from '@phosphor-icons/react';
import { DEMO_CLASSES } from '@/lib/demo-data';

/* ─── Demo Data ─── */

const DEMO_GROUPS: Record<string, { id: string; name: string; students: string[]; color: string }[]> = {
  'cls-1': [
    { id: 'grp-1', name: 'Fractions Intervention', students: ['Emma S.', 'Marcus W.', 'Ethan J.'], color: '#E8836B' },
    { id: 'grp-2', name: 'Advanced Math', students: ['Liam T.', 'Sophia R.', 'Ruby C.', 'Kai S.', 'Olivia K.'], color: '#4FA3A5' },
  ],
  'cls-2': [
    { id: 'grp-3', name: 'Division Help', students: ['Wren F.', 'Hazel C.', 'Silas C.'], color: '#F59E0B' },
  ],
  'cls-3': [
    { id: 'grp-4', name: 'Lab Partners A', students: ['Ivy N.', 'Theo P.', 'Oscar R.'], color: '#3B82F6' },
  ],
};

const ACTIVITIES_BY_CLASS: Record<string, string[]> = {
  'cls-1': ['Fraction Basics', 'Multiplication Practice', 'Geometry Shapes', 'Word Problems Challenge'],
  'cls-2': ['Multiplication Tables', 'Division Intro'],
  'cls-3': ['Photosynthesis Lab', 'States of Matter'],
  'cls-4': ['Vocabulary Builder', 'Book Report Template'],
  'cls-5': ['Phonics Foundations', 'Sight Words Practice'],
};

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

interface ChatThread {
  id: string;
  activity: string;
  group: string;
  groupColor: string;
  participants: string[];
  messageCount: number;
  lastActive: string;
  sentiment: 'productive' | 'off-topic' | 'needs-attention';
  lastMessage: { sender: string; text: string };
  messages: ChatMessage[];
}

const DEMO_CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-1',
    activity: 'Fraction Basics',
    group: 'Fractions Intervention',
    groupColor: '#E8836B',
    participants: ['Emma S.', 'Marcus W.', 'Ethan J.'],
    messageCount: 23,
    lastActive: '25m ago',
    sentiment: 'productive',
    lastMessage: { sender: 'Emma S.', text: 'Try dividing the top and bottom by the same number. That gives you the simplified fraction!' },
    messages: [
      { sender: 'Ethan J.', text: 'I don\'t get how to simplify 4/8. Can someone help?', time: '35m ago' },
      { sender: 'Emma S.', text: 'Sure! What\'s the biggest number that goes into both 4 and 8?', time: '33m ago' },
      { sender: 'Ethan J.', text: 'Umm... 4?', time: '32m ago' },
      { sender: 'Emma S.', text: 'Yes! So divide both by 4. 4÷4 = 1, 8÷4 = 2. So 4/8 = 1/2 ✅', time: '30m ago' },
      { sender: 'Marcus W.', text: '👍', time: '28m ago' },
      { sender: 'Ethan J.', text: 'Ohh that makes sense! What about 6/9?', time: '27m ago' },
      { sender: 'Emma S.', text: 'Try dividing the top and bottom by the same number. That gives you the simplified fraction!', time: '25m ago' },
    ],
  },
  {
    id: 'thread-2',
    activity: 'Fraction Basics',
    group: 'Advanced Math',
    groupColor: '#4FA3A5',
    participants: ['Liam T.', 'Sophia R.', 'Ruby C.', 'Kai S.'],
    messageCount: 15,
    lastActive: '1h ago',
    sentiment: 'productive',
    lastMessage: { sender: 'Sophia R.', text: 'Nice catch Liam. The common denominator should be 12 not 6.' },
    messages: [
      { sender: 'Liam T.', text: 'Wait, for 3/4 + 2/3, the LCD should be 12 right?', time: '1h ago' },
      { sender: 'Sophia R.', text: 'Yes! 3/4 = 9/12 and 2/3 = 8/12', time: '1h ago' },
      { sender: 'Ruby C.', text: 'So the answer is 17/12 = 1 5/12', time: '58m ago' },
      { sender: 'Sophia R.', text: 'Nice catch Liam. The common denominator should be 12 not 6.', time: '55m ago' },
    ],
  },
  {
    id: 'thread-3',
    activity: 'Word Problems Challenge',
    group: 'Fractions Intervention',
    groupColor: '#E8836B',
    participants: ['Emma S.', 'Ethan J.'],
    messageCount: 8,
    lastActive: '2h ago',
    sentiment: 'needs-attention',
    lastMessage: { sender: 'Ethan J.', text: 'I still dont get this one. The word problem is confusing' },
    messages: [
      { sender: 'Ethan J.', text: 'This problem says Maria ate 1/3 of a pizza. How much is left?', time: '2h ago' },
      { sender: 'Emma S.', text: 'If she ate 1/3, then 1 - 1/3 = 2/3 is left', time: '2h ago' },
      { sender: 'Ethan J.', text: 'I still dont get this one. The word problem is confusing', time: '2h ago' },
    ],
  },
  {
    id: 'thread-4',
    activity: 'Multiplication Practice',
    group: 'Advanced Math',
    groupColor: '#4FA3A5',
    participants: ['Liam T.', 'Kai S.', 'Olivia K.'],
    messageCount: 12,
    lastActive: '3h ago',
    sentiment: 'productive',
    lastMessage: { sender: 'Kai S.', text: 'I found a trick for 9x tables. Hold up your fingers!' },
    messages: [
      { sender: 'Kai S.', text: 'I found a trick for 9x tables. Hold up your fingers!', time: '3h ago' },
      { sender: 'Olivia K.', text: 'Oh cool! So for 9x4 you put down finger 4 and get 36?', time: '3h ago' },
      { sender: 'Liam T.', text: 'That actually works for all of them 🤯', time: '3h ago' },
    ],
  },
  {
    id: 'thread-5',
    activity: 'Geometry Shapes',
    group: 'Fractions Intervention',
    groupColor: '#E8836B',
    participants: ['Emma S.', 'Marcus W.', 'Ethan J.'],
    messageCount: 5,
    lastActive: 'Yesterday',
    sentiment: 'off-topic',
    lastMessage: { sender: 'Marcus W.', text: 'Did anyone see the game last night??' },
    messages: [
      { sender: 'Marcus W.', text: 'Did anyone see the game last night??', time: 'Yesterday' },
      { sender: 'Emma S.', text: 'lol Marcus we\'re supposed to be doing shapes 😂', time: 'Yesterday' },
      { sender: 'Marcus W.', text: 'Oh right... so a hexagon has 6 sides?', time: 'Yesterday' },
    ],
  },
  {
    id: 'thread-6',
    activity: 'Word Problems Challenge',
    group: 'Advanced Math',
    groupColor: '#4FA3A5',
    participants: ['Sophia R.', 'Ruby C.'],
    messageCount: 18,
    lastActive: '4h ago',
    sentiment: 'productive',
    lastMessage: { sender: 'Ruby C.', text: 'I think we need to set up the equation differently. Let x = the total.' },
    messages: [
      { sender: 'Ruby C.', text: 'I think we need to set up the equation differently. Let x = the total.', time: '4h ago' },
      { sender: 'Sophia R.', text: 'Good idea. So if 2/5 of x = 20, then x = 50', time: '4h ago' },
    ],
  },
  {
    id: 'thread-7',
    activity: 'Fraction Basics',
    group: 'Fractions Intervention',
    groupColor: '#E8836B',
    participants: ['Marcus W.', 'Ethan J.'],
    messageCount: 4,
    lastActive: 'Yesterday',
    sentiment: 'needs-attention',
    lastMessage: { sender: 'Marcus W.', text: 'idk how to do this one either' },
    messages: [
      { sender: 'Ethan J.', text: 'Marcus do you understand adding fractions?', time: 'Yesterday' },
      { sender: 'Marcus W.', text: 'idk how to do this one either', time: 'Yesterday' },
    ],
  },
  {
    id: 'thread-8',
    activity: 'Multiplication Practice',
    group: 'Fractions Intervention',
    groupColor: '#E8836B',
    participants: ['Emma S.', 'Marcus W.', 'Ethan J.'],
    messageCount: 11,
    lastActive: '5h ago',
    sentiment: 'productive',
    lastMessage: { sender: 'Emma S.', text: 'You got it! 7x8 = 56. Keep practicing those!' },
    messages: [
      { sender: 'Emma S.', text: 'OK let\'s quiz each other on times tables', time: '5h ago' },
      { sender: 'Ethan J.', text: 'What\'s 7x8?', time: '5h ago' },
      { sender: 'Marcus W.', text: '54?', time: '5h ago' },
      { sender: 'Ethan J.', text: 'Close! It\'s 56', time: '5h ago' },
      { sender: 'Emma S.', text: 'You got it! 7x8 = 56. Keep practicing those!', time: '5h ago' },
    ],
  },
];

// Off-topic keywords for subtle flag
const OFF_TOPIC_KEYWORDS = ['game', 'last night', 'lol', 'haha', '😂', 'lmao'];

function isOffTopicMessage(text: string): boolean {
  const lower = text.toLowerCase();
  return OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));
}

// AI summaries per class/group
const AI_SUMMARIES: Record<string, Record<string, string>> = {
  'cls-1': {
    all: '5th Grade Math peer chats are healthy overall. 78% of messages are on-topic. One student (Marcus W.) showing low participation across groups. Emma S. and Liam T. are natural peer leaders.',
    'grp-1': 'Students in Fractions Intervention are collaborating well. Emma S. is emerging as a peer leader, answering 6 questions from classmates. Marcus W. is mostly reading, not participating actively. Ethan J. asked for help 3 times and received helpful responses from peers.',
    'grp-2': 'Advanced Math group moves quickly and independently. Liam T. and Sophia R. frequently validate each other\'s work. The group self-corrects errors without AI intervention.',
  },
  'cls-2': {
    all: '4th Grade Math has moderate peer chat activity. Division Help group is working well together with balanced participation.',
    'grp-3': 'Division Help group shows steady collaboration. All three students contribute questions and answers relatively equally.',
  },
  'cls-3': {
    all: '5th Grade Science peer chats show strong lab-based collaboration. Lab Partners A group communicates effectively during experiments.',
    'grp-4': 'Lab Partners A works efficiently. Ivy N. typically leads the discussion, while Theo P. and Oscar R. contribute observations and data recording.',
  },
};

const AI_FLAGS = [
  { type: 'warning' as const, text: 'Marcus W. — low participation in group discussions' },
  { type: 'success' as const, text: 'Emma S. — emerging peer leader (6 peer answers this week)' },
  { type: 'success' as const, text: 'Liam T. — consistent collaborator' },
];

const SENTIMENT_CONFIG = {
  productive: { label: 'Productive', bg: 'bg-green-500/10', text: 'text-green-700' },
  'off-topic': { label: 'Off-topic', bg: 'bg-yellow-500/10', text: 'text-yellow-700' },
  'needs-attention': { label: 'Needs attention', bg: 'bg-red-500/10', text: 'text-red-700' },
};

const AVATAR_COLORS = ['#1F3A5F', '#4FA3A5', '#E8836B', '#F59E0B', '#8B5CF6', '#059669', '#3B82F6', '#DC2626', '#6366F1', '#0891B2'];

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─── Components ─── */

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  const fontSize = size < 28 ? 10 : 12;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize }}
      title={name}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-card-bg rounded-[20px] border border-border p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-text-secondary text-sm">{label}</p>
        <p className="text-text-primary text-xl font-semibold font-heading mt-0.5">{value}</p>
        {subtitle && <p className="text-text-secondary text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function ThreadCard({ thread, isExpanded, onToggle }: { thread: ChatThread; isExpanded: boolean; onToggle: () => void }) {
  const sentimentCfg = SENTIMENT_CONFIG[thread.sentiment];

  return (
    <div className="bg-card-bg rounded-[20px] border border-border overflow-hidden transition-shadow hover:shadow-md">
      {/* Clickable header */}
      <button onClick={onToggle} className="w-full text-left p-5 focus:outline-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-text-primary font-semibold font-heading text-sm">{thread.activity}</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs font-medium" style={{ color: thread.groupColor }}>{thread.group}</span>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-1 mt-2.5">
              {thread.participants.map((p) => (
                <Avatar key={p} name={p} size={24} />
              ))}
              <span className="text-text-secondary text-xs ml-2">{thread.participants.length} students</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sentimentCfg.bg} ${sentimentCfg.text}`}>
              {sentimentCfg.label}
            </span>
            <div className="flex items-center gap-1.5 text-text-secondary text-xs">
              <Clock size={12} />
              <span>{thread.lastActive}</span>
            </div>
          </div>
        </div>

        {/* Stats + preview */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-text-secondary text-xs flex items-center gap-1">
            <ChatCircle size={12} />
            {thread.messageCount} messages
          </span>
        </div>

        <p className="text-text-secondary text-sm mt-2 truncate">
          <span className="font-medium text-text-primary">{thread.lastMessage.sender}:</span>{' '}
          {thread.lastMessage.text}
        </p>

        {isExpanded && (
          <div className="flex items-center gap-1 mt-2 text-teal text-xs font-medium">
            <CaretUp size={12} />
            Close thread
          </div>
        )}
        {!isExpanded && (
          <div className="flex items-center gap-1 mt-2 text-teal text-xs font-medium">
            <CaretDown size={12} />
            View thread
          </div>
        )}
      </button>

      {/* Expanded messages */}
      {isExpanded && (
        <div className="border-t border-border px-5 py-4 space-y-3 bg-white/50">
          {thread.messages.map((msg, i) => {
            const offTopic = isOffTopicMessage(msg.text);
            const prevSender = i > 0 ? thread.messages[i - 1].sender : null;
            const sameSender = msg.sender === prevSender;
            return (
              <div
                key={`${msg.sender}-${i}`}
                className={`flex gap-3 ${offTopic ? 'border-l-2 border-yellow-400 pl-3' : ''}`}
              >
                {!sameSender ? (
                  <Avatar name={msg.sender} size={28} />
                ) : (
                  <div className="w-7 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  {!sameSender && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-text-primary text-sm font-semibold">{msg.sender}</span>
                      <span className="text-text-secondary text-xs">{msg.time}</span>
                    </div>
                  )}
                  <p className="text-text-primary text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="flex items-center gap-1.5 text-text-secondary text-xs hover:text-text-primary transition-colors mt-2"
          >
            <X size={12} />
            Close
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function GroupChatsPage() {
  const [selectedClass, setSelectedClass] = useState(DEMO_CLASSES[0].id);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'all'>('week');
  const [expandedThread, setExpandedThread] = useState<string | null>(null);

  const classGroups = DEMO_GROUPS[selectedClass] || [];
  const classActivities = ACTIVITIES_BY_CLASS[selectedClass] || [];
  const selectedClassName = DEMO_CLASSES.find((c) => c.id === selectedClass)?.name || '';

  // Get AI summary
  const aiSummary = useMemo(() => {
    const classSummaries = AI_SUMMARIES[selectedClass];
    if (!classSummaries) return `Peer chat data for ${selectedClassName} is being analyzed. Check back soon for group dynamics insights.`;
    if (selectedGroup === 'all') return classSummaries.all || `Analyzing group dynamics across all groups in ${selectedClassName}.`;
    return classSummaries[selectedGroup] || `Group dynamics for this group are being analyzed.`;
  }, [selectedClass, selectedGroup, selectedClassName]);

  // Filter threads
  const filteredThreads = useMemo(() => {
    return DEMO_CHAT_THREADS.filter((t) => {
      // Only show threads for groups in the selected class
      const classGroupNames = classGroups.map((g) => g.name);
      if (!classGroupNames.includes(t.group)) return false;
      if (selectedGroup !== 'all') {
        const group = classGroups.find((g) => g.id === selectedGroup);
        if (group && t.group !== group.name) return false;
      }
      if (selectedActivity !== 'all' && t.activity !== selectedActivity) return false;
      // Time range filter (demo: just filter by lastActive text)
      if (timeRange === 'today') {
        if (t.lastActive.includes('Yesterday') || t.lastActive.includes('days')) return false;
      }
      return true;
    });
  }, [selectedClass, selectedGroup, selectedActivity, timeRange, classGroups]);

  const timeRanges = [
    { key: 'today' as const, label: 'Today' },
    { key: 'week' as const, label: 'This Week' },
    { key: 'all' as const, label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
          <UsersThree size={28} weight="duotone" className="text-teal" />
          Group Chats
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Monitor peer-to-peer student conversations from group activities
        </p>
      </div>

      {/* AI Summary Panel */}
      <div className="bg-card-bg rounded-[20px] border border-border border-l-4 border-l-teal p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
            <Robot size={20} weight="duotone" className="text-teal" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-heading font-semibold text-text-primary">🤖 Group Dynamics Summary</h2>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">{aiSummary}</p>

            {/* AI Flags */}
            {selectedClass === 'cls-1' && (
              <div className="flex flex-wrap gap-2 mt-4">
                {AI_FLAGS.map((flag, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      flag.type === 'warning'
                        ? 'bg-yellow-500/10 text-yellow-700'
                        : 'bg-green-500/10 text-green-700'
                    }`}
                  >
                    {flag.type === 'warning' ? <Warning size={14} /> : <CheckCircle size={14} />}
                    {flag.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Class dropdown */}
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedGroup('all');
              setSelectedActivity('all');
              setExpandedThread(null);
            }}
            className="appearance-none bg-[#1a2744] border border-border rounded-xl px-4 py-2 pr-8 text-sm text-text-primary font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30"
            style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}
          >
            {DEMO_CLASSES.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#1a2744] text-text-primary" style={{ backgroundColor: '#1a2744' }}>{c.name}</option>
            ))}
          </select>
          <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>

        {/* Group dropdown */}
        <div className="relative">
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setExpandedThread(null);
            }}
            className="appearance-none bg-[#1a2744] border border-border rounded-xl px-4 py-2 pr-8 text-sm text-text-primary font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30"
            style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}
          >
            <option value="all" className="bg-[#1a2744]" style={{ backgroundColor: '#1a2744' }}>All Groups</option>
            {classGroups.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#1a2744]" style={{ backgroundColor: '#1a2744' }}>{g.name}</option>
            ))}
          </select>
          <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>

        {/* Activity dropdown */}
        <div className="relative">
          <select
            value={selectedActivity}
            onChange={(e) => {
              setSelectedActivity(e.target.value);
              setExpandedThread(null);
            }}
            className="appearance-none bg-[#1a2744] border border-border rounded-xl px-4 py-2 pr-8 text-sm text-text-primary font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30"
            style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}
          >
            <option value="all" className="bg-[#1a2744]" style={{ backgroundColor: '#1a2744' }}>All Activities</option>
            {classActivities.map((a) => (
              <option key={a} value={a} className="bg-[#1a2744]" style={{ backgroundColor: '#1a2744' }}>{a}</option>
            ))}
          </select>
          <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>

        {/* Time range pills */}
        <div className="flex items-center bg-card-bg border border-border rounded-xl overflow-hidden">
          {timeRanges.map((tr) => (
            <button
              key={tr.key}
              onClick={() => setTimeRange(tr.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === tr.key
                  ? 'bg-teal text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ChatCircle size={20} weight="duotone" className="text-teal" />}
          label="Total Peer Messages"
          value={147}
        />
        <StatCard
          icon={<UsersThree size={20} weight="duotone" className="text-teal" />}
          label="Most Active Group"
          value="Fractions Intervention"
        />
        <StatCard
          icon={<Lightning size={20} weight="duotone" className="text-teal" />}
          label="Peer Leader"
          value="Emma S."
          subtitle="6 answers"
        />
        <StatCard
          icon={<Warning size={20} weight="duotone" className="text-yellow-500" />}
          label="Groups Needing Attention"
          value={1}
          subtitle="Low participation"
        />
      </div>

      {/* Chat Thread Cards */}
      {filteredThreads.length === 0 ? (
        <div className="bg-card-bg rounded-[20px] border border-border p-12 text-center">
          <ChatCircle size={48} className="text-text-secondary/30 mx-auto" />
          <p className="text-text-secondary mt-4">No group chat threads match your filters.</p>
          <p className="text-text-secondary text-sm mt-1">Try adjusting the class, group, or time range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              isExpanded={expandedThread === thread.id}
              onToggle={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
