'use client';

import {
  CaretLeft, ChatsCircle,
} from '@phosphor-icons/react';

// ── Demo data ─────────────────────────────────────────────────────────────────

const SESSION_SUMMARY = [
  { value: '47',    label: 'Total Sessions' },
  { value: '3h 24m', label: 'Total Time'    },
  { value: '12',    label: 'This Week'       },
  { value: '18 min', label: 'Avg Session'   },
];

const TOPICS = [
  { rank: 1, name: 'Adding Fractions',       count: '18 mentions', hot: true  },
  { rank: 2, name: 'Simplifying Fractions',  count: '14 mentions', hot: false },
  { rank: 3, name: 'Mixed Numbers',          count: '9 mentions',  hot: false },
  { rank: 4, name: 'Decimal Conversion',     count: '7 mentions',  hot: false },
  { rank: 5, name: 'Word Problems',          count: '4 mentions',  hot: false },
];

const SENTIMENTS = [
  { label: 'Frustrated', pct: 18, fillClass: 'from-red-500 to-red-400'    },
  { label: 'Confused',   pct: 32, fillClass: 'from-amber-500 to-amber-400' },
  { label: 'Motivated',  pct: 65, fillClass: 'from-emerald-500 to-emerald-400' },
];

const CONFUSION_PATTERNS = [
  {
    variant: 'critical' as const,
    title: '🔴 Unlike Denominators: Asked 12 times',
    rows: [
      { label: 'Status',           text: 'Persistent confusion when denominators differ' },
      { label: 'Approaches tried', text: 'Visual fraction bars, common denominator method, pizza analogies' },
      { label: 'Progress',         text: 'Improving with visuals but still needs scaffolding' },
      { label: 'Recommendation',   text: 'Hands-on manipulatives in class. Emma is a visual and tactile learner.' },
    ],
  },
  {
    variant: 'improving' as const,
    title: '🟡 Simplifying to Lowest Terms: Asked 8 times',
    rows: [
      { label: 'Status',           text: 'Improving steadily' },
      { label: 'Approaches tried', text: 'Factor trees, division method' },
      { label: 'Progress',         text: 'Last 3 sessions showed correct simplification without prompting' },
      { label: 'Recommendation',   text: 'Continue current approach. Nearly mastered.' },
    ],
  },
];

const LEARNING_INSIGHTS = [
  { icon: '💡', title: 'Learning Style',       text: 'Visual learner. Engages most when shown diagrams, fraction bars, and step-by-step worked examples. Abstract explanations lose her attention.' },
  { icon: '⏱️', title: 'Optimal Pacing',       text: 'Responds best to patient, one-step-at-a-time explanations. Shuts down when given too much information at once. Ideal session length: 10–15 minutes.' },
  { icon: '🎯', title: 'Question Style',        text: 'Asks clarifying questions immediately rather than waiting. This is a strength: she self-advocates and doesn\'t let confusion pile up.' },
  { icon: '🏆', title: 'Motivation Drivers',    text: 'Responds strongly to specific praise ("You found the common denominator perfectly!"). General praise ("Good job!") has less impact. Celebrates her own wins out loud.' },
  { icon: '📅', title: 'Best Times',            text: 'Most productive sessions happen between 9–11 AM. Afternoon sessions show lower engagement and more frustration markers.' },
];

const RECOMMENDATIONS = [
  { emoji: '🎯', label: 'Immediate',      text: 'Use physical fraction manipulatives during small group time. Emma\'s tactile learning style means abstract chat explanations have a ceiling.' },
  { emoji: '👥', label: 'Peer Learning',  text: 'Pair Emma with Sophia Williams (mastery 94%) for fraction practice. Emma learns well by watching others model solutions.' },
  { emoji: '⏰', label: 'Scheduling',     text: 'Encourage Emma to use her Teaching Twin in the morning when her engagement is highest. Afternoon sessions show diminishing returns.' },
  { emoji: '🔄', label: 'Next Focus',     text: 'Once unlike denominators clicks, move to mixed number operations. She has the foundation but needs the denominator piece first.' },
  { emoji: '💌', label: 'Parent Update',  text: "Share Emma's progress on simplifying fractions (nearly mastered!) and her strong self-advocacy habits. Parents should know she's asking great questions." },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function CardStripe({ color }: { color: string }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-1 rounded-t-[var(--radius-lg,14px)]"
      style={{ backgroundColor: color }}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-heading text-[13px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-4 flex items-center gap-2">
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ConversationDetailPage() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <a
          href="/teacher/student-chats"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border
            bg-transparent text-text-secondary text-[13px] font-medium cursor-pointer transition-all
            hover:border-navy hover:text-text-primary no-underline"
        >
          <CaretLeft size={14} weight="fill" /> Back
        </a>
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-full bg-navy text-white flex items-center justify-center
            font-heading font-bold text-[18px] shrink-0">
            EJ
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-text-primary">Emma Johnson</div>
            <div className="text-sm text-text-secondary mt-0.5">
              5th Grade · Ms. Harper&apos;s Math · 47 total sessions
            </div>
          </div>
        </div>
      </div>

      {/* Session Summary */}
      <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 overflow-hidden">
        <CardStripe color="var(--navy)" />
        <SectionTitle>📊 Session Summary</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {SESSION_SUMMARY.map(({ value, label }) => (
            <div key={label} className="bg-surface rounded-[10px] p-4 text-center">
              <div className="font-heading text-2xl font-extrabold text-navy">{value}</div>
              <div className="text-xs text-text-secondary mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics + Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Topics Discussed */}
        <div className="relative bg-card-bg border border-border rounded-[14px] p-6 overflow-hidden">
          <CardStripe color="var(--teal)" />
          <SectionTitle>🎯 Topics Discussed</SectionTitle>
          <ul className="list-none p-0 m-0">
            {TOPICS.map((t, i) => (
              <li
                key={t.rank}
                className={`flex items-center justify-between py-3 ${i < TOPICS.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-teal text-white flex items-center justify-center
                    font-heading font-bold text-xs shrink-0">
                    {t.rank}
                  </div>
                  <span className="text-sm text-text-primary">{t.name}</span>
                </div>
                <span className={`font-heading font-bold text-[13px] ${t.hot ? 'text-red-600' : 'text-text-primary'}`}>
                  {t.count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sentiment & Engagement */}
        <div className="relative bg-card-bg border border-border rounded-[14px] p-6 overflow-hidden">
          <CardStripe color="#F59E0B" />
          <SectionTitle>😊 Sentiment &amp; Engagement</SectionTitle>
          <div className="flex flex-col gap-3.5">
            {SENTIMENTS.map(({ label, pct, fillClass }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="text-[13px] text-text-secondary min-w-[90px] text-right">{label}</div>
                <div className="flex-1 h-[22px] bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${fillClass} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="font-heading font-bold text-[13px] text-text-primary min-w-[40px]">{pct}%</div>
              </div>
            ))}
          </div>
          <div className="bg-surface border-l-3 border-l-[3px] border-teal rounded-lg px-3.5 py-3.5
            text-[13px] leading-relaxed text-text-secondary mt-4">
            <strong className="text-text-primary">Analysis:</strong> Emma shows high motivation and persistence. Brief
            moments of confusion with unlike denominators, but she works through them with encouragement. Responds well
            to step-by-step guidance and celebrates her own breakthroughs.
          </div>
        </div>
      </div>

      {/* Confusion Patterns */}
      <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 overflow-hidden">
        <CardStripe color="#F59E0B" />
        <SectionTitle>⚠️ Confusion Patterns</SectionTitle>
        <div className="flex flex-col gap-3">
          {CONFUSION_PATTERNS.map(({ variant, title, rows }) => {
            const isCritical = variant === 'critical';
            return (
              <div
                key={title}
                className={`rounded-[10px] p-4 border-l-4 ${
                  isCritical
                    ? 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-400'
                    : 'bg-blue-50/40 dark:bg-blue-500/5 border-blue-400'
                }`}
              >
                <div className={`font-heading font-semibold text-sm mb-1.5 ${
                  isCritical ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'
                }`}>
                  {title}
                </div>
                <div className={`text-[13px] leading-relaxed ${
                  isCritical ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'
                }`}>
                  {rows.map(({ label, text }) => (
                    <div key={label}>
                      <span className="font-semibold">{label}:</span> {text}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Pattern Insights */}
      <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 overflow-hidden">
        <CardStripe color="var(--teal)" />
        <SectionTitle>🧠 Learning Pattern Insights</SectionTitle>
        <div>
          {LEARNING_INSIGHTS.map(({ icon, title, text }, i) => (
            <div
              key={title}
              className={`flex items-start gap-3 py-3 ${i < LEARNING_INSIGHTS.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="text-[18px] shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 text-sm leading-relaxed text-text-primary">
                <strong className="text-navy">{title}:</strong> {text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Recommendations */}
      <div className="bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-700/30
        rounded-[14px] p-6">
        <SectionTitle>
          <span className="text-emerald-700 dark:text-emerald-400">✅ Teacher Recommendations</span>
        </SectionTitle>
        <div>
          {RECOMMENDATIONS.map(({ emoji, label, text }, i) => (
            <div
              key={label}
              className={`py-2.5 text-sm leading-relaxed ${i < RECOMMENDATIONS.length - 1 ? 'border-b border-emerald-200/40 dark:border-emerald-700/20' : ''}`}
            >
              <strong className="text-emerald-700 dark:text-emerald-400">{emoji} {label}:</strong>{' '}
              <span className="text-text-primary">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
