'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Brain,
  UsersFour,
  RocketLaunch,
  ListChecks,
  Question,
  UsersThree,
  GlobeHemisphereWest,
  Plant,
  Target,
  NotePencil,
  Sparkle,
  ArrowsClockwise,
  Handshake,
  Scissors,
  Lightbulb,
  ChartBar,
  ChatText,
  PuzzlePiece,
  EnvelopeSimple,
  Star,
  BookOpen,
  GameController,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/shared/ThemeToggle';

/* ────────────────────────────────────────
   Types
   ──────────────────────────────────────── */

interface Answers {
  teachingStyle: string;
  classroomVibe: string[];
  feedbackApproach: string;
  mistakeResponse: string;
  assistantPriorities: string[];
  strugglingStudentNote: string;
  whyLearnResponse: string;
  northStar: string;
}

const INITIAL_ANSWERS: Answers = {
  teachingStyle: '',
  classroomVibe: [],
  feedbackApproach: '',
  mistakeResponse: '',
  assistantPriorities: [],
  strugglingStudentNote: '',
  whyLearnResponse: '',
  northStar: '',
};

/* ────────────────────────────────────────
   Archetype computation
   ──────────────────────────────────────── */

function parseStyleFromText(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(lecture|direct|step[- ]by[- ]step|explicit|structured instruction)\b/.test(lower)) return 'direct';
  if (/\b(question|inquiry|discover|socratic|wonder|explore)\b/.test(lower)) return 'inquiry';
  if (/\b(group|team|collaborat|together|peer|partner)\b/.test(lower)) return 'collaborative';
  if (/\b(hands[- ]on|real[- ]world|project|experiential|build|create|maker)\b/.test(lower)) return 'experiential';
  return 'inquiry'; // default
}

function computeArchetype(answers: Answers): { name: string; traits: Record<string, unknown> } {
  const { classroomVibe, feedbackApproach } = answers;
  const vibes = new Set(classroomVibe);
  const teachingStyle = parseStyleFromText(answers.teachingStyle);

  // Energy signals from single-word vibes
  const hasHighEnergy = vibes.has('High Energy') || vibes.has('Fast Paced');
  const hasStructured = vibes.has('Structured') || vibes.has('Focused') || vibes.has('Rigorous');
  const hasWarm = vibes.has('Warm') || vibes.has('Encouraging');
  const hasChill = vibes.has('Chill') || vibes.has('Conversational');
  const hasCreative = vibes.has('Creative') || vibes.has('Free Flowing');
  const hasChallenging = vibes.has('Challenging') || vibes.has('Rigorous');

  // Priority checks — most specific first
  if (hasHighEnergy) {
    return {
      name: 'The Energetic Motivator',
      traits: { energy: 'high', style: teachingStyle, approach: feedbackApproach, strengths: ['engagement', 'motivation', 'enthusiasm'] },
    };
  }
  if (teachingStyle === 'direct' && feedbackApproach === 'detailed' && hasChallenging) {
    return {
      name: 'The Precision Expert',
      traits: { energy: 'focused', style: 'direct', approach: 'detailed', strengths: ['rigor', 'precision', 'thoroughness'] },
    };
  }
  if ((teachingStyle === 'experiential' || teachingStyle === 'collaborative') && hasCreative && feedbackApproach === 'growth') {
    return {
      name: 'The Adaptive Innovator',
      traits: { energy: 'creative', style: teachingStyle, approach: 'growth', strengths: ['innovation', 'adaptability', 'creativity'] },
    };
  }
  if (teachingStyle === 'experiential' && hasCreative) {
    return {
      name: 'The Creative Explorer',
      traits: { energy: 'creative', style: 'experiential', approach: feedbackApproach, strengths: ['creativity', 'real-world', 'exploration'] },
    };
  }
  if (teachingStyle === 'direct' && hasStructured) {
    return {
      name: 'The Structured Guide',
      traits: { energy: 'steady', style: 'direct', approach: feedbackApproach, strengths: ['clarity', 'organization', 'consistency'] },
    };
  }
  if (teachingStyle === 'collaborative' && hasWarm) {
    return {
      name: 'The Collaborative Coach',
      traits: { energy: 'warm', style: 'collaborative', approach: feedbackApproach, strengths: ['teamwork', 'support', 'community'] },
    };
  }
  if ((teachingStyle === 'inquiry' || teachingStyle === 'collaborative') && hasChill) {
    return {
      name: 'The Calm Mentor',
      traits: { energy: 'calm', style: teachingStyle, approach: feedbackApproach, strengths: ['patience', 'reflection', 'depth'] },
    };
  }
  if (teachingStyle === 'inquiry' && (feedbackApproach === 'encouraging' || feedbackApproach === 'growth')) {
    return {
      name: 'The Warm Strategist',
      traits: { energy: 'thoughtful', style: 'inquiry', approach: feedbackApproach, strengths: ['strategy', 'empathy', 'growth-mindset'] },
    };
  }

  // Default fallback
  return {
    name: 'The Warm Strategist',
    traits: { energy: 'balanced', style: teachingStyle, approach: feedbackApproach, strengths: ['adaptability', 'care', 'strategy'] },
  };
}

function getStyleLabel(style: string): string {
  const map: Record<string, string> = {
    direct: 'Direct Instruction',
    inquiry: 'Inquiry-Based',
    collaborative: 'Collaborative',
    experiential: 'Experiential',
  };
  return map[style] || style;
}

function getFeedbackLabel(fb: string): string {
  const map: Record<string, string> = {
    growth: 'Growth-Focused',
    direct: 'Direct & Clear',
    detailed: 'Detailed Analysis',
    encouraging: 'Encouraging',
  };
  return map[fb] || fb;
}

function getSampleResponse(style: string): string {
  const map: Record<string, string> = {
    inquiry: "What DO you understand about fractions so far? Let's start from what you know.",
    direct: "Let's break this down step by step. A fraction is just a part of a whole...",
    collaborative: "You know what? Lots of students feel that way at first. Let's work through this together.",
    experiential: "Grab a piece of paper and fold it in half. Now fold it in half again. See those sections? That's fractions!",
  };
  return map[style] || map.inquiry;
}

function getPriorityLabel(key: string): string {
  const map: Record<string, string> = {
    struggling: 'Help struggling students catch up',
    feedback: 'Give instant feedback on student work',
    availability: 'Be available outside class hours',
    differentiation: 'Create differentiated activities',
    parents: 'Communicate progress to parents',
    gamification: 'Make learning feel like a game',
    testprep: 'Help students study for tests',
    motivation: 'Motivate students who lost confidence',
  };
  return map[key] || key;
}

/* ────────────────────────────────────────
   Screen definitions
   ──────────────────────────────────────── */

const TOTAL_SCREENS = 10; // 1 hook + 3 DNA + 1 assistant + 3 voice + 1 loading + 1 reveal
const ACT_MAP = [1, 2, 2, 2, 3, 4, 4, 4, 5, 5]; // which act each screen belongs to

/* ────────────────────────────────────────
   Main Component
   ──────────────────────────────────────── */

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [saving, setSaving] = useState(false);
  const [archetype, setArchetype] = useState<{ name: string; traits: Record<string, unknown> } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const currentAct = ACT_MAP[screen] || 1;

  const goNext = useCallback(() => {
    if (animating) return;
    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setScreen(s => s + 1);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const goBack = useCallback(() => {
    if (animating || screen === 0) return;
    setDirection('back');
    setAnimating(true);
    setTimeout(() => {
      setScreen(s => s - 1);
      setAnimating(false);
    }, 300);
  }, [animating, screen]);

  // Save to Supabase on reveal screen
  useEffect(() => {
    if (screen === 8) {
      // Loading screen — compute archetype, save, then advance
      const result = computeArchetype(answers);
      setArchetype(result);

      const saveData = async () => {
        setSaving(true);
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          const payload = {
            teacher_id: user?.id || '',
            teaching_style: answers.teachingStyle,
            classroom_vibe: answers.classroomVibe,
            feedback_approach: answers.feedbackApproach,
            mistake_response: answers.mistakeResponse,
            assistant_priorities: answers.assistantPriorities,
            struggling_student_note: answers.strugglingStudentNote || null,
            why_learn_response: answers.whyLearnResponse || null,
            scenario_responses: { northStar: answers.northStar },
            twin_archetype: result.name,
            twin_traits: result.traits,
            completed_at: new Date().toISOString(),
          };

          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from as any)('teacher_souls').upsert(payload, { onConflict: 'teacher_id' });
          } else {
            // Demo mode fallback
            localStorage.setItem('teacher_soul', JSON.stringify(payload));
          }
        } catch {
          // Don't break the experience
          localStorage.setItem('teacher_soul_backup', JSON.stringify({ answers, archetype: result }));
        } finally {
          setSaving(false);
        }
      };

      saveData();

      // Advance to reveal after animation
      const timer = setTimeout(() => {
        setDirection('forward');
        setAnimating(true);
        setTimeout(() => {
          setScreen(9);
          setAnimating(false);
          setTimeout(() => setRevealed(true), 100);
        }, 300);
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ────────────────────────────────────────
     Render helpers
     ──────────────────────────────────────── */

  const canAdvance = (): boolean => {
    switch (screen) {
      case 0: return true;
      case 1: return answers.teachingStyle.length > 10;
      case 2: return answers.classroomVibe.length >= 4;
      case 3: return !!answers.feedbackApproach;
      case 4: return answers.assistantPriorities.length === 3;
      case 5: return !!answers.mistakeResponse;
      case 6: return answers.strugglingStudentNote.length > 10 && answers.whyLearnResponse.length > 10;
      case 7: return answers.northStar.length > 3;
      default: return false;
    }
  };

  const slideClass = animating
    ? direction === 'forward'
      ? 'onb-slide-out-left'
      : 'onb-slide-out-right'
    : 'onb-slide-in';

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00F6ED]/20 dark:bg-teal/5 blob-teal" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#00F6ED]/15 dark:bg-gold/5 blob-gold" />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        {screen > 0 && screen < 8 ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={18} weight="bold" />
            Back
          </button>
        ) : (
          <div />
        )}
        <ThemeToggle className="w-10 h-10 rounded-full bg-card-bg border border-border shadow-sm z-50" />
      </div>

      {/* Progress indicator */}
      {screen < 8 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(act => (
            <div key={act} className="flex items-center gap-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  act < currentAct
                    ? 'w-8 bg-navy dark:bg-teal'
                    : act === currentAct
                    ? 'w-8 bg-navy/70 dark:bg-teal/70'
                    : 'w-8 bg-border'
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className={`relative z-10 min-h-screen flex items-center justify-center px-4 py-24 ${slideClass}`}>
        {/* Act 1: The Hook */}
        {screen === 0 && <HookScreen onBegin={goNext} />}

        {/* Act 2a: Teaching Style — Free Text */}
        {screen === 1 && (
          <FreeTextScreen
            value={answers.teachingStyle}
            onChange={(v) => setAnswers(a => ({ ...a, teachingStyle: v }))}
            onNext={goNext}
            canAdvance={answers.teachingStyle.length >= 100}
          />
        )}

        {/* Act 2b: Classroom Vibe */}
        {screen === 2 && (
          <VibeScreen
            selected={answers.classroomVibe}
            onToggle={(vibe) => {
              setAnswers(a => {
                const current = a.classroomVibe;
                if (current.includes(vibe)) {
                  return { ...a, classroomVibe: current.filter(v => v !== vibe) };
                }
                if (current.length >= 6) return a;
                return { ...a, classroomVibe: [...current, vibe] };
              });
            }}
            onNext={goNext}
            canAdvance={answers.classroomVibe.length >= 4}
          />
        )}

        {/* Act 2c: Feedback Style */}
        {screen === 3 && (
          <SelectionScreen
            title="A student just turned in solid (not spectacular) work. You'd most likely:"
            actLabel="Your Teaching DNA"
            options={[
              { key: 'growth', icon: <Plant size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Focus on what they did well and where to grow next' },
              { key: 'direct', icon: <Target size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Give clear, direct feedback on what to fix' },
              { key: 'detailed', icon: <NotePencil size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Write detailed comments on every section' },
              { key: 'encouraging', icon: <Sparkle size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Celebrate the effort and encourage them to keep going' },
            ]}
            selected={answers.feedbackApproach}
            onSelect={(key) => setAnswers(a => ({ ...a, feedbackApproach: key }))}
            onNext={goNext}
            canAdvance={!!answers.feedbackApproach}
          />
        )}

        {/* Act 3: Dream Assistant */}
        {screen === 4 && (
          <PrioritiesScreen
            selected={answers.assistantPriorities}
            onToggle={(key) => {
              setAnswers(a => {
                const current = a.assistantPriorities;
                if (current.includes(key)) {
                  return { ...a, assistantPriorities: current.filter(k => k !== key) };
                }
                if (current.length >= 3) return a;
                return { ...a, assistantPriorities: [...current, key] };
              });
            }}
            onNext={goNext}
            canAdvance={answers.assistantPriorities.length === 3}
          />
        )}

        {/* Act 4a: Scenario */}
        {screen === 5 && (
          <ScenarioWithOtherScreen
            answers={answers}
            onSelect={(key) => setAnswers(a => ({ ...a, mistakeResponse: key }))}
            onOtherChange={(text) => setAnswers(a => ({ ...a, mistakeResponse: `other:${text}` }))}
            onNext={goNext}
          />
        )}

        {/* Act 4b: In Your Own Words */}
        {screen === 6 && (
          <WritingScreen
            answers={answers}
            onUpdate={(field, value) => setAnswers(a => ({ ...a, [field]: value }))}
            onNext={goNext}
            canAdvance={answers.strugglingStudentNote.length > 10 && answers.whyLearnResponse.length > 10}
          />
        )}

        {/* Act 4c: North Star */}
        {screen === 7 && (
          <NorthStarScreen
            value={answers.northStar}
            onChange={(v) => setAnswers(a => ({ ...a, northStar: v }))}
            onNext={goNext}
            canAdvance={answers.northStar.length > 3}
          />
        )}

        {/* Loading screen */}
        {screen === 8 && <LoadingScreen />}

        {/* Act 5: The Reveal */}
        {screen === 9 && archetype && (
          <RevealScreen
            archetype={archetype}
            answers={answers}
            revealed={revealed}
            onContinue={() => router.push('/teacher/welcome')}
          />
        )}
      </div>

      <style>{`
        @keyframes onbFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes onbSlideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes onbSlideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-60px); }
        }
        @keyframes onbSlideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(60px); }
        }
        @keyframes onbPulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(79,163,165,0.3), 0 0 60px rgba(79,163,165,0.1); }
          50% { box-shadow: 0 0 50px rgba(79,163,165,0.5), 0 0 100px rgba(79,163,165,0.2); }
        }
        @keyframes onbDotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes onbCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes onbProgressFill {
          from { width: 0; }
          to { width: 100%; }
        }
        .onb-slide-in {
          animation: onbSlideInRight 0.35s ease-out both;
        }
        .onb-slide-out-left {
          animation: onbSlideOutLeft 0.3s ease-in both;
        }
        .onb-slide-out-right {
          animation: onbSlideOutRight 0.3s ease-in both;
        }
        .onb-fade-up {
          animation: onbFadeUp 0.5s ease-out both;
        }
        .onb-card-in {
          animation: onbCardIn 0.4s ease-out both;
        }
        .onb-pulse-glow {
          animation: onbPulseGlow 2.5s ease-in-out infinite;
        }
        .onb-dot-bounce {
          animation: onbDotBounce 1.4s ease-in-out infinite;
        }
        .onb-dot-bounce-1 { animation-delay: 0s; }
        .onb-dot-bounce-2 { animation-delay: 0.2s; }
        .onb-dot-bounce-3 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────
   Sub-screens
   ──────────────────────────────────────── */

function HookScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="onb-fade-up">
        <img
          src="/images/logo-stacked-light.png"
          alt="Teaching Labs"
          className="h-24 mx-auto mb-8 block dark:hidden"
        />
        <img
          src="/images/logo-stacked-dark.png"
          alt="Teaching Labs"
          className="h-24 mx-auto mb-8 hidden dark:block"
        />
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
          Meet Your Teaching Twin
        </h1>
        <p className="text-text-secondary text-base md:text-lg mb-12 leading-relaxed max-w-xl mx-auto">
          <em>Let&apos;s start learning about you.</em><br /><br />This is the first step in building your Teaching Twin, an AI assistant that reflects how you teach, think, and connect with students.<br /><br />As you use TeachingLabs, it will continue learning from you over time so it can better support your instruction and help you connect more effectively with students.
        </p>
      </div>

      <div className="grid gap-6 mb-12 max-w-xl mx-auto">
        {[
          { icon: <Brain size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, text: 'A few questions capture your unique teaching DNA' },
          { icon: <UsersFour size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, text: 'We build a digital twin that teaches like you' },
          { icon: <RocketLaunch size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, text: 'Your twin helps every student, exactly the way you would' },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 text-left p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in"
            style={{ animationDelay: `${0.3 + i * 0.15}s` }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo/10 dark:bg-teal/10 flex items-center justify-center">
              {item.icon}
            </div>
            <p className="text-text-primary font-medium text-base">{item.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onBegin}
        className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white dark:bg-teal dark:text-navy font-heading font-semibold text-base rounded-full hover:bg-navy/90 dark:hover:bg-teal/90 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] onb-fade-up"
        style={{ animationDelay: '0.75s' }}
      >
        Let&apos;s Begin
        <ArrowRight size={20} weight="bold" />
      </button>
    </div>
  );
}

function FreeTextScreen({
  value,
  onChange,
  onNext,
  canAdvance,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-indigo dark:text-indigo dark:text-teal font-heading font-semibold text-sm uppercase tracking-wider mb-3 onb-fade-up">Your Teaching DNA</p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-8 onb-fade-up" style={{ animationDelay: '0.05s' }}>
        Tell us about yourself &mdash; what do you teach, what grade level, and how would you describe your teaching approach?
      </h2>
      <p className="text-text-secondary text-sm italic mb-6 onb-fade-up" style={{ animationDelay: '0.1s' }}>
        The more you share, the better your Teaching Twin will understand your teaching style.
      </p>

      <div className="onb-card-in" style={{ animationDelay: '0.15s' }}>
        <textarea
          value={value}
          onChange={(e) => { if (e.target.value.length <= 5000) onChange(e.target.value); }}
          placeholder="e.g., I teach 7th grade math. I like to use real-world examples and hands-on activities to help students discover concepts on their own..."
          className="w-full p-5 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-indigo dark:border-teal focus:outline-none transition-colors resize-none font-body text-base leading-relaxed"
          rows={6}
          maxLength={5000}
        />
        <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
          <span className="italic">
            {value.length < 100
              ? 'The more you share, the better your Teaching Twin will understand your teaching style.'
              : value.length < 300
              ? 'Good start! More detail helps build a better twin.'
              : value.length < 1000
              ? 'Nice! Your twin is starting to take shape.'
              : 'Great detail! Your twin will use all of this.'}
          </span>
          <span className={value.length > 4500 ? 'text-warning' : ''}>{value.length.toLocaleString()} / 5,000</span>
        </div>
      </div>

      <div className="mt-8 flex justify-end onb-fade-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-semibold transition-all cursor-pointer ${
            canAdvance
              ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-md hover:shadow-lg'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function ScenarioWithOtherScreen({
  answers,
  onSelect,
  onOtherChange,
  onNext,
}: {
  answers: Answers;
  onSelect: (key: string) => void;
  onOtherChange: (text: string) => void;
  onNext: () => void;
}) {
  const [showOther, setShowOther] = useState(false);
  const [otherText, setOtherText] = useState('');

  const options = [
    { key: 'different-approach', icon: <ArrowsClockwise size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Try a completely different approach: visual, hands-on, real-world' },
    { key: 'peer-help', icon: <Handshake size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Pair them with a classmate who gets it' },
    { key: 'break-down', icon: <Scissors size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Break it into the smallest possible pieces and go one step at a time' },
    { key: 'build-up', icon: <Lightbulb size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />, label: 'Ask THEM to explain what they DO understand, then build from there' },
  ];

  const selected = answers.mistakeResponse;
  const isOtherSelected = selected.startsWith('other:');
  const canAdvance = isOtherSelected ? otherText.length > 5 : !!selected;

  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-indigo dark:text-indigo dark:text-teal font-heading font-semibold text-sm uppercase tracking-wider mb-3 onb-fade-up">Your Voice & Values</p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-8 onb-fade-up" style={{ animationDelay: '0.05s' }}>
        A student has asked the same question three different ways and still doesn&apos;t get it. Of these options, what would you most likely do first?
      </h2>

      <div className="grid gap-4">
        {options.map((opt, i) => (
          <button
            key={opt.key}
            onClick={() => { setShowOther(false); setOtherText(''); onSelect(opt.key); }}
            className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer onb-card-in ${
              selected === opt.key
                ? 'border-navy dark:border-teal bg-navy dark:bg-teal/5 text-white dark:text-text-primary shadow-md'
                : 'border-border bg-card-bg/30 hover:border-indigo dark:border-teal/40 hover:bg-card-bg/60'
            }`}
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo/10 dark:bg-teal/10 flex items-center justify-center">
              {opt.icon}
            </div>
            <span className="font-medium text-base leading-relaxed">{opt.label}</span>
          </button>
        ))}

        {/* Other option */}
        <button
          onClick={() => { setShowOther(true); onOtherChange(''); }}
          className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer onb-card-in ${
            isOtherSelected
              ? 'border-navy dark:border-teal bg-navy dark:bg-teal/5 text-white dark:text-text-primary shadow-md'
              : 'border-border bg-card-bg/30 hover:border-indigo dark:border-teal/40 hover:bg-card-bg/60'
          }`}
          style={{ animationDelay: `${0.1 + options.length * 0.08}s` }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo/10 dark:bg-teal/10 flex items-center justify-center">
            <NotePencil size={28} weight="fill" className="text-indigo dark:text-indigo dark:text-teal" />
          </div>
          <span className="font-medium text-base leading-relaxed">Something else entirely</span>
        </button>

        {/* Other text input */}
        {showOther && (
          <div className="onb-fade-up">
            <textarea
              autoFocus
              value={otherText}
              onChange={(e) => { if (e.target.value.length <= 5000) { setOtherText(e.target.value); onOtherChange(e.target.value); } }}
              placeholder="Tell us what you'd actually do..."
              rows={3}
              maxLength={5000}
              className="w-full px-4 py-3 border-2 border-indigo dark:border-teal/30 rounded-xl text-base bg-card-bg/30 text-text-primary
                outline-none focus:border-indigo dark:border-teal transition-colors resize-none placeholder:text-text-muted"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
              <span className="italic">
                {otherText.length < 100
                  ? 'The more you share, the better your Teaching Twin will understand your teaching style.'
                  : otherText.length < 300
                  ? 'Good start! More detail helps build a better twin.'
                  : otherText.length < 1000
                  ? 'Nice! Your twin is starting to take shape.'
                  : 'Great detail! Your twin will use all of this.'}
              </span>
              <span className={otherText.length > 4500 ? 'text-warning' : ''}>{otherText.length.toLocaleString()} / 5,000</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end onb-fade-up" style={{ animationDelay: '0.5s' }}>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-semibold transition-all cursor-pointer ${
            canAdvance
              ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-md hover:shadow-lg'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function SelectionScreen({
  title,
  actLabel,
  options,
  selected,
  onSelect,
  onNext,
  canAdvance,
}: {
  title: string;
  actLabel: string;
  options: { key: string; icon: React.ReactNode; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-indigo dark:text-indigo dark:text-teal font-heading font-semibold text-sm uppercase tracking-wider mb-3 onb-fade-up">{actLabel}</p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-8 onb-fade-up" style={{ animationDelay: '0.05s' }}>
        {title}
      </h2>

      <div className="grid gap-4">
        {options.map((opt, i) => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer onb-card-in ${
              selected === opt.key
                ? 'border-navy dark:border-teal bg-navy dark:bg-teal/5 text-white dark:text-text-primary shadow-md'
                : 'border-border bg-card-bg/30 hover:border-indigo dark:border-teal/40 hover:bg-card-bg/60'
            }`}
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo/10 dark:bg-teal/10 flex items-center justify-center">
              {opt.icon}
            </div>
            <span className="font-medium text-base leading-relaxed">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end onb-fade-up" style={{ animationDelay: '0.5s' }}>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-semibold transition-all cursor-pointer ${
            canAdvance
              ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-md hover:shadow-lg'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

const VIBE_OPTIONS = [
  'Structured',
  'Focused',
  'Warm',
  'Encouraging',
  'High Energy',
  'Fast Paced',
  'Chill',
  'Conversational',
  'Challenging',
  'Rigorous',
  'Creative',
  'Free Flowing',
];

function VibeScreen({
  selected,
  onToggle,
  onNext,
  canAdvance,
}: {
  selected: string[];
  onToggle: (vibe: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-indigo dark:text-indigo dark:text-teal font-heading font-semibold text-sm uppercase tracking-wider mb-3 onb-fade-up">Your Teaching DNA</p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-2 onb-fade-up" style={{ animationDelay: '0.05s' }}>
        Pick the words that best describe your classroom:
      </h2>
      <p className="text-text-muted text-sm mb-8 onb-fade-up" style={{ animationDelay: '0.1s' }}>
        {selected.length}/6 selected (pick at least 4)
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {VIBE_OPTIONS.map((vibe, i) => {
          const isSelected = selected.includes(vibe);
          return (
            <button
              key={vibe}
              onClick={() => onToggle(vibe)}
              className={`px-5 py-3 rounded-full font-medium text-sm transition-all cursor-pointer border-2 onb-card-in ${
                isSelected
                  ? 'border-navy dark:border-teal bg-navy dark:bg-teal/10 text-white dark:text-teal shadow-md scale-105'
                  : selected.length >= 6
                  ? 'border-border bg-card-bg/20 text-text-muted cursor-not-allowed opacity-50'
                  : 'border-border bg-card-bg/30 text-text-primary hover:border-indigo dark:border-teal/40'
              }`}
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              {vibe}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end onb-fade-up" style={{ animationDelay: '0.5s' }}>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-semibold transition-all cursor-pointer ${
            canAdvance
              ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-md hover:shadow-lg'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

const PRIORITY_OPTIONS = [
  { key: 'struggling', icon: <ChartBar size={22} weight="fill" />, label: 'Help struggling students catch up with personalized practice' },
  { key: 'feedback', icon: <NotePencil size={22} weight="fill" />, label: 'Give instant feedback on student work' },
  { key: 'availability', icon: <ChatText size={22} weight="fill" />, label: 'Be available for students outside class hours' },
  { key: 'differentiation', icon: <Target size={22} weight="fill" />, label: 'Create differentiated activities for different skill levels' },
  { key: 'parents', icon: <EnvelopeSimple size={22} weight="fill" />, label: 'Help communicate progress to parents' },
  { key: 'gamification', icon: <GameController size={22} weight="fill" />, label: 'Make learning feel like a game for disengaged students' },
  { key: 'testprep', icon: <BookOpen size={22} weight="fill" />, label: 'Help students study for tests with practice questions' },
  { key: 'motivation', icon: <Star size={22} weight="fill" />, label: 'Motivate students who\'ve lost confidence' },
];

function PrioritiesScreen({
  selected,
  onToggle,
  onNext,
  canAdvance,
}: {
  selected: string[];
  onToggle: (key: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-indigo dark:text-indigo dark:text-teal font-heading font-semibold text-sm uppercase tracking-wider mb-3 onb-fade-up">Your Dream Assistant</p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-2 onb-fade-up" style={{ animationDelay: '0.05s' }}>
        What would you want them to do first?
      </h2>
      <p className="text-text-secondary text-base mb-2 onb-fade-up" style={{ animationDelay: '0.1s' }}>
        Imagine having a teaching partner who never sleeps. Pick your top 3.
      </p>
      <p className="text-text-muted text-sm mb-8 onb-fade-up" style={{ animationDelay: '0.15s' }}>
        {selected.length} of 3 selected
      </p>

      <div className="grid gap-3">
        {PRIORITY_OPTIONS.map((opt, i) => {
          const idx = selected.indexOf(opt.key);
          const isSelected = idx >= 0;
          return (
            <button
              key={opt.key}
              onClick={() => onToggle(opt.key)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer onb-card-in ${
                isSelected
                  ? 'border-navy dark:border-teal bg-navy dark:bg-teal/5 text-white dark:text-text-primary shadow-md'
                  : selected.length >= 3
                  ? 'border-border bg-card-bg/20 opacity-40 cursor-not-allowed'
                  : 'border-border bg-card-bg/30 hover:border-indigo dark:border-teal/40'
              }`}
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isSelected ? 'bg-white/20 text-white dark:bg-teal dark:text-navy' : 'bg-border text-text-muted'
              }`}>
                {isSelected ? idx + 1 : ''}
              </div>
              <div className={`flex items-center gap-3 ${isSelected ? 'text-white/80 dark:text-text-secondary' : 'text-text-secondary'}`}>
                {opt.icon}
              </div>
              <span className={`font-medium text-sm flex-1 ${isSelected ? '' : 'text-text-primary'}`}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-card-bg/40 onb-fade-up" style={{ animationDelay: '0.6s' }}>
        <p className="text-text-muted text-xs text-center italic">These choices shape what your Teaching Twin focuses on first.</p>
      </div>

      <div className="mt-6 flex justify-end onb-fade-up" style={{ animationDelay: '0.7s' }}>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-semibold transition-all cursor-pointer ${
            canAdvance
              ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-md hover:shadow-lg'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function WritingScreen({
  answers,
  onUpdate,
  onNext,
  canAdvance,
}: {
  answers: Answers;
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-indigo dark:text-indigo dark:text-teal font-heading font-semibold text-sm uppercase tracking-wider mb-3 onb-fade-up">Your Voice & Values</p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-8 onb-fade-up" style={{ animationDelay: '0.05s' }}>
        In Your Own Words
      </h2>

      <div className="space-y-8">
        <div className="onb-card-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-text-primary font-medium mb-2 text-base">
            Write a quick note to a parent whose kid is struggling but trying hard:
          </label>
          <textarea
            value={answers.strugglingStudentNote}
            onChange={(e) => { if (e.target.value.length <= 5000) onUpdate('strugglingStudentNote', e.target.value); }}
            placeholder="Start typing — there's no wrong answer here..."
            className="w-full p-4 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-indigo dark:border-teal focus:outline-none transition-colors resize-none font-body text-base leading-relaxed"
            rows={4}
            maxLength={5000}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
            <span className="italic">
              {answers.strugglingStudentNote.length === 0 ? '' : answers.strugglingStudentNote.length < 300
                ? 'The more you share, the better your Teaching Twin will understand your teaching style.'
                : answers.strugglingStudentNote.length < 1000
                ? 'Nice! Your twin is starting to take shape.'
                : 'Great detail! Your twin will use all of this.'}
            </span>
            <span className={answers.strugglingStudentNote.length > 4500 ? 'text-warning' : ''}>{answers.strugglingStudentNote.length.toLocaleString()} / 5,000</span>
          </div>
        </div>

        <div className="onb-card-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-text-primary font-medium mb-2 text-base">
            A student asks &quot;Why do we even have to learn this?&quot; Your honest response:
          </label>
          <textarea
            value={answers.whyLearnResponse}
            onChange={(e) => { if (e.target.value.length <= 5000) onUpdate('whyLearnResponse', e.target.value); }}
            placeholder="What would you actually say?"
            className="w-full p-4 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-indigo dark:border-teal focus:outline-none transition-colors resize-none font-body text-base leading-relaxed"
            rows={4}
            maxLength={5000}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
            <span className="italic">
              {answers.whyLearnResponse.length === 0 ? '' : answers.whyLearnResponse.length < 300
                ? 'The more you share, the better your Teaching Twin will understand your teaching style.'
                : answers.whyLearnResponse.length < 1000
                ? 'Nice! Your twin is starting to take shape.'
                : 'Great detail! Your twin will use all of this.'}
            </span>
            <span className={answers.whyLearnResponse.length > 4500 ? 'text-warning' : ''}>{answers.whyLearnResponse.length.toLocaleString()} / 5,000</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 rounded-lg bg-indigo/5 dark:bg-teal/5 border border-indigo dark:border-teal/20 onb-fade-up" style={{ animationDelay: '0.35s' }}>
        <p className="text-text-secondary text-sm text-center">The more detail you share here, the better your twin will understand how you respond and interact with students and parents.</p>
      </div>

      <div className="mt-8 flex justify-end onb-fade-up" style={{ animationDelay: '0.45s' }}>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-semibold transition-all cursor-pointer ${
            canAdvance
              ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-md hover:shadow-lg'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function NorthStarScreen({
  value,
  onChange,
  onNext,
  canAdvance,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-xl mx-auto w-full text-center">
      <p className="text-indigo dark:text-indigo dark:text-teal font-heading font-semibold text-sm uppercase tracking-wider mb-3 onb-fade-up">Your Voice & Values</p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3 onb-fade-up" style={{ animationDelay: '0.05s' }}>
        Your North Star
      </h2>
      <p className="text-text-secondary text-base mb-8 onb-fade-up" style={{ animationDelay: '0.1s' }}>
        The ONE thing you&apos;d want your AI teaching twin to always remember is:
      </p>

      <div className="onb-card-in" style={{ animationDelay: '0.2s' }}>
        <textarea
          value={value}
          onChange={(e) => { if (e.target.value.length <= 500) onChange(e.target.value); }}
          placeholder="e.g., Every kid deserves to feel seen"
          maxLength={500}
          rows={8}
          className="w-full p-5 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-indigo dark:border-teal focus:outline-none transition-colors resize-none font-body text-base leading-relaxed"
        />
        <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
          <span className="italic">
            {value.length === 0 ? '' : value.length < 200
              ? 'The more you share, the better your Teaching Twin will understand your teaching style.'
              : 'This becomes your twin\'s guiding principle.'}
          </span>
          <span className={value.length > 450 ? 'text-warning' : ''}>{value.length} / 500</span>
        </div>
      </div>

      <p className="text-text-muted text-sm mt-4 onb-fade-up" style={{ animationDelay: '0.3s' }}>
        This becomes your twin&apos;s guiding principle.
      </p>

      <div className="mt-10 onb-fade-up" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-heading font-semibold text-lg transition-all cursor-pointer ${
            canAdvance
              ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-lg hover:shadow-xl'
              : 'bg-border text-text-muted cursor-not-allowed'
          }`}
        >
          Build My Teaching Twin
          <RocketLaunch size={20} weight="fill" />
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-teal to-navy flex items-center justify-center onb-pulse-glow">
        <Brain size={40} weight="fill" className="text-white" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
        Building your Teaching Twin...
      </h2>
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-3 h-3 rounded-full bg-indigo dark:bg-teal onb-dot-bounce onb-dot-bounce-1" />
        <div className="w-3 h-3 rounded-full bg-indigo dark:bg-teal onb-dot-bounce onb-dot-bounce-2" />
        <div className="w-3 h-3 rounded-full bg-indigo dark:bg-teal onb-dot-bounce onb-dot-bounce-3" />
      </div>
      <p className="text-text-muted text-sm">Analyzing your teaching DNA...</p>
    </div>
  );
}

function RevealScreen({
  archetype,
  answers,
  revealed,
  onContinue,
}: {
  archetype: { name: string; traits: Record<string, unknown> };
  answers: Answers;
  revealed: boolean;
  onContinue: () => void;
}) {
  const traits = archetype.traits as { strengths?: string[]; style?: string; approach?: string };
  const parsedStyle = parseStyleFromText(answers.teachingStyle);
  const subtitle = [
    getStyleLabel(parsedStyle),
    getFeedbackLabel(answers.feedbackApproach),
    'Student-first',
  ].join(' · ');

  return (
    <div className={`max-w-2xl mx-auto w-full transition-opacity duration-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
      {/* Avatar + Name */}
      <div className="text-center mb-10">
        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal to-navy flex items-center justify-center onb-pulse-glow">
          <Brain size={48} weight="fill" className="text-white" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-2">
          {archetype.name}
        </h2>
        <p className="text-indigo dark:text-teal font-medium text-base">{subtitle}</p>
      </div>

      {/* Profile grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[
          { label: 'Teaching Style', value: getStyleLabel(parsedStyle) },
          { label: 'Classroom Vibe', value: answers.classroomVibe.join(', ') },
          { label: 'Feedback Approach', value: getFeedbackLabel(answers.feedbackApproach) },
          { label: 'Top Priority', value: getPriorityLabel(answers.assistantPriorities[0]) },
        ].map((item, i) => (
          <div
            key={item.label}
            className="p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in"
            style={{ animationDelay: `${0.2 + i * 0.1}s` }}
          >
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-heading">{item.label}</p>
            <p className="text-text-primary font-medium text-sm">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-card-bg/50 border border-border/50 mb-8 onb-card-in" style={{ animationDelay: '0.6s' }}>
        <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-heading">Guiding Principle</p>
        <p className="text-text-primary font-medium text-sm">&quot;{answers.northStar}&quot;</p>
      </div>

      {/* Strength tags */}
      {traits.strengths && (
        <div className="flex flex-wrap gap-2 justify-center mb-10 onb-fade-up" style={{ animationDelay: '0.7s' }}>
          {traits.strengths.map(s => (
            <span key={s} className="px-4 py-2 rounded-full bg-navy dark:bg-teal/10 text-white dark:text-teal text-lg font-bold capitalize">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="text-center onb-fade-up" style={{ animationDelay: '1s' }}>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white dark:bg-teal dark:text-navy font-heading font-semibold text-base rounded-full hover:bg-navy/90 dark:hover:bg-teal/90 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
