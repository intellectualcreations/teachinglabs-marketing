'use client';

import { useState, useEffect, useRef } from 'react';
import { User, ArrowRight } from '@phosphor-icons/react';
import Link from 'next/link';

type MessageRole = 'ai' | 'student';

interface Message {
  id: string;
  role: MessageRole;
  text: string;
}

interface ResponseOption {
  label: string;
  labelColor: string;
  levelBg: string;
  text: string;
  onSelect: () => void;
}

type ConvState =
  | 'intro'
  | 'grade'
  | 'interests'
  | 'followup'
  | 'walkthrough'
  | 'learning-pref'
  | 'math-question'
  | 'done';

const GRADES = [
  { label: 'K', sub: 'Kinder' }, { label: '1st', sub: '' }, { label: '2nd', sub: '' },
  { label: '3rd', sub: '' }, { label: '4th', sub: '' }, { label: '5th', sub: '' },
  { label: '6th', sub: '' }, { label: '7th', sub: '' }, { label: '8th', sub: '' },
  { label: '9th', sub: 'Fresh' }, { label: '10th', sub: 'Soph' }, { label: '11th', sub: 'Junior' },
  { label: '12th', sub: 'Senior' },
];

let msgCounter = 0;
function makeId() { return `msg-${++msgCounter}`; }

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState(0);
  const [convState, setConvState] = useState<ConvState>('intro');
  const [options, setOptions] = useState<ResponseOption[]>([]);
  const [showGrades, setShowGrades] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('5th');
  const bottomRef = useRef<HTMLDivElement>(null);

  const addAiMsg = (text: string, onDone?: () => void) => {
    setIsTyping(true);
    const delay = Math.min(800 + text.length * 8, 2000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: makeId(), role: 'ai', text }]);
      if (onDone) setTimeout(onDone, 400);
    }, delay);
  };

  const addStudentMsg = (text: string) => {
    setMessages(prev => [...prev, { id: makeId(), role: 'student', text }]);
  };

  const clearOptions = () => { setOptions([]); setShowGrades(false); };

  const pickOption = (text: string, onSelect: () => void) => {
    clearOptions();
    addStudentMsg(text);
    setTimeout(onSelect, 600);
  };

  // Step helpers
  const stepGradeSelector = () => {
    setShowGrades(true);
    setProgress(0);
  };

  const stepInterests = (grade: string) => {
    setConvState('interests');
    setProgress(15);
    addAiMsg(
      `Nice, ${grade} grade! So tell me, what's something you're really into right now? Could be anything: games, sports, music, drawing, building stuff — whatever you like.`,
      () => {
        setOptions([
          {
            label: 'Detailed',
            labelColor: '#10B981',
            levelBg: 'rgba(16,185,129,0.1)',
            text: "I'm really into Minecraft, especially the redstone engineering part. I've been building automated farms. I also like reading — I just finished Percy Jackson.",
            onSelect: () => stepFollowup('advanced'),
          },
          {
            label: 'Typical',
            labelColor: '#F59E0B',
            levelBg: 'rgba(251,191,36,0.1)',
            text: 'I like playing Minecraft and basketball after school.',
            onSelect: () => stepFollowup('gradelevel'),
          },
          {
            label: 'Brief',
            labelColor: '#E8836B',
            levelBg: 'rgba(232,131,107,0.1)',
            text: 'games',
            onSelect: () => stepFollowup('support'),
          },
        ]);
      }
    );
  };

  const stepFollowup = (level: string) => {
    setConvState('followup');
    setProgress(30);
    const followups: Record<string, { q: string; opts: ResponseOption[] }> = {
      advanced: {
        q: "Redstone logic gates? That's seriously impressive. And Percy Jackson is a great series. Who was your favorite character and why?",
        opts: [
          {
            label: 'Detailed', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)',
            text: "Annabeth — she solves problems by thinking strategically instead of just fighting. She plans everything out and uses logic. Kind of like how I approach redstone.",
            onSelect: () => stepWalkthrough('advanced'),
          },
          {
            label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
            text: "Percy, because he's funny and has cool powers.",
            onSelect: () => stepWalkthrough('gradelevel'),
          },
        ],
      },
      gradelevel: {
        q: "Nice! Minecraft is awesome. What's your favorite thing to do in it — building, exploring, survival mode?",
        opts: [
          {
            label: 'Detailed', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)',
            text: "I do survival mode. I like building a base, then exploring caves to find diamonds and trade with villagers for enchanted books.",
            onSelect: () => stepWalkthrough('advanced'),
          },
          {
            label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
            text: "I like building houses and playing with friends.",
            onSelect: () => stepWalkthrough('gradelevel'),
          },
          {
            label: 'Brief', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)',
            text: "I just build stuff and fight zombies.",
            onSelect: () => stepWalkthrough('support'),
          },
        ],
      },
      support: {
        q: 'Cool! What kind of games? 🎮',
        opts: [
          {
            label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
            text: "Minecraft and Roblox. I play after school with my friends.",
            onSelect: () => stepWalkthrough('gradelevel'),
          },
          {
            label: 'Brief', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)',
            text: 'minecraft',
            onSelect: () => stepWalkthrough('support'),
          },
        ],
      },
    };
    const data = followups[level] || followups.gradelevel;
    addAiMsg(data.q, () => setOptions(data.opts.map(o => ({ ...o, onSelect: () => { clearOptions(); addStudentMsg(o.text); setTimeout(o.onSelect, 600); } }))));
  };

  const stepWalkthrough = (level: string) => {
    setConvState('walkthrough');
    setProgress(50);
    const prompts: Record<string, string> = {
      advanced: "I can tell you think about things deeply. Walk me through something you built or made recently that you're proud of — in a game, at school, anywhere. Tell me the whole story.",
      gradelevel: "That's cool! Here's a fun one: can you walk me through something you built or made that you're really proud of? Tell me how you did it, step by step.",
      support: "Nice! 🏗️ Tell me about the coolest thing you ever built in Minecraft.",
    };
    const optSets: Record<string, ResponseOption[]> = {
      advanced: [
        {
          label: 'Detailed', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)',
          text: "I built an automatic chicken farm with hoppers, a dispenser, and a redstone clock with different tick delays. It took three days to get the timing right but now it runs completely by itself.",
          onSelect: () => stepLearningPref('advanced'),
        },
        {
          label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
          text: "I built a treehouse with my dad. We got wood, used a drill, built the floor and walls. We still need to do the roof.",
          onSelect: () => stepLearningPref('gradelevel'),
        },
      ],
      gradelevel: [
        {
          label: 'Detailed', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)',
          text: "I made a volcano for the science fair. Paper mache, baking soda and vinegar with red food coloring. I practiced the eruption a bunch of times and won second place!",
          onSelect: () => stepLearningPref('gradelevel'),
        },
        {
          label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
          text: "A fort out of couch cushions with my friends. It had three rooms and a door you could crawl through.",
          onSelect: () => stepLearningPref('gradelevel'),
        },
        {
          label: 'Brief', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)',
          text: "I don't know. A picture in art class I guess.",
          onSelect: () => stepLearningPref('support'),
        },
      ],
      support: [
        {
          label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
          text: "A big castle with towers and a bridge over water. It took a long time.",
          onSelect: () => stepLearningPref('support'),
        },
        {
          label: 'Brief', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)',
          text: 'a house',
          onSelect: () => stepLearningPref('support'),
        },
      ],
    };
    const prompt = prompts[level] || prompts.gradelevel;
    const opts = optSets[level] || optSets.gradelevel;
    addAiMsg(prompt, () => setOptions(opts.map(o => ({ ...o, onSelect: () => { clearOptions(); addStudentMsg(o.text); setTimeout(o.onSelect, 600); } }))));
  };

  const stepLearningPref = (level: string) => {
    setConvState('learning-pref');
    setProgress(70);
    const prompts: Record<string, string> = {
      advanced: "You explain things really clearly. One more thing: is there anything you'd want me to know about how you learn best? Do you prefer examples, or figuring things out on your own first?",
      gradelevel: "Thanks for sharing that! Last question: is there anything you want me to know about you? Like what helps you learn, or something that's hard sometimes?",
      support: "You're doing great! 😊 One more thing: what's your favorite subject? Or is there something at school that's hard sometimes?",
    };
    addAiMsg(prompts[level] || prompts.gradelevel, () => {
      const opts: ResponseOption[] = level === 'advanced'
        ? [
            {
              label: 'Detailed', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)',
              text: "I learn best when I understand WHY something works, not just the steps. Also I get bored if things are too easy.",
              onSelect: () => stepMathQuestion('advanced'),
            },
            {
              label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
              text: "I like when teachers show examples first, then I try it.",
              onSelect: () => stepMathQuestion('gradelevel'),
            },
          ]
        : level === 'gradelevel'
        ? [
            {
              label: 'Thoughtful', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)',
              text: "Sometimes I need a minute to think before I answer. And I like examples with real-life situations.",
              onSelect: () => stepMathQuestion('gradelevel'),
            },
            {
              label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
              text: "Math is kind of hard for me. I like reading though.",
              onSelect: () => stepMathQuestion('gradelevel'),
            },
            {
              label: 'Brief', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)',
              text: 'no',
              onSelect: () => stepMathQuestion('support'),
            },
          ]
        : [
            {
              label: 'Typical', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)',
              text: "I like art and PE. Math is hard.",
              onSelect: () => stepMathQuestion('support'),
            },
            {
              label: 'Brief', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)',
              text: "I don't know",
              onSelect: () => stepMathQuestion('support'),
            },
          ];
      setOptions(opts.map(o => ({ ...o, onSelect: () => { clearOptions(); addStudentMsg(o.text); setTimeout(o.onSelect, 600); } })));
    });
  };

  const stepMathQuestion = (level: string) => {
    setConvState('math-question');
    setProgress(85);
    const prompts: Record<string, string> = {
      advanced: "OK one quick math puzzle for fun — not a test, I promise 😄. If you have 3 bags of marbles and each bag has 24 marbles, but then you give away a quarter of all your marbles, how many do you have left?",
      gradelevel: "Let's do a quick fun one! 🧩 If you have 12 cookies and want to share them equally with 3 friends (so 4 people total), how many does each person get?",
      support: "OK let's do something fun! 🍕 If you have 8 pizza slices and you eat 3, how many are left?",
    };
    const optSets: Record<string, ResponseOption[]> = {
      advanced: [
        { label: 'Correct', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)', text: "72 total, a quarter is 18, so 54 marbles left.", onSelect: () => stepDone('advanced') },
        { label: 'Working', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)', text: "Um, 3 times 24 is 72... a quarter... that's 25%... so 72 minus 18? 54?", onSelect: () => stepDone('gradelevel') },
        { label: 'Struggling', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)', text: "I'm not sure, that's a lot of math at once.", onSelect: () => stepDone('gradelevel') },
      ],
      gradelevel: [
        { label: 'Quick', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)', text: "3 each! 12 divided by 4 is 3.", onSelect: () => stepDone('gradelevel') },
        { label: 'Working', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)', text: "12 divided by... 4 people... 3?", onSelect: () => stepDone('gradelevel') },
        { label: 'Unsure', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)', text: "I'm not sure. Do I divide or multiply?", onSelect: () => stepDone('support') },
      ],
      support: [
        { label: 'Quick', labelColor: '#10B981', levelBg: 'rgba(16,185,129,0.1)', text: "5 slices left!", onSelect: () => stepDone('gradelevel') },
        { label: 'Working', labelColor: '#F59E0B', levelBg: 'rgba(251,191,36,0.1)', text: "umm... 5?", onSelect: () => stepDone('support') },
        { label: 'Thinking', labelColor: '#E8836B', levelBg: 'rgba(232,131,107,0.1)', text: "Let me think... 8 minus 3... 5?", onSelect: () => stepDone('support') },
      ],
    };
    addAiMsg(prompts[level] || prompts.gradelevel, () => {
      const opts = optSets[level] || optSets.gradelevel;
      setOptions(opts.map(o => ({ ...o, onSelect: () => { clearOptions(); addStudentMsg(o.text); setTimeout(o.onSelect, 600); } })));
    });
  };

  const stepDone = (level: string) => {
    setConvState('done');
    setProgress(100);
    const closings: Record<string, string> = {
      advanced: "That was fun! I can already tell we're going to have some great conversations this year. Ready to jump in? 🚀",
      gradelevel: "Thanks for chatting with me! I'm excited to work with you this year. Let's do this! 😊",
      support: "Thanks! I'm really glad you're here. Let's have fun! 😊🎉",
    };
    addAiMsg(closings[level] || closings.gradelevel, () => {
      setTimeout(() => setShowContinue(true), 600);
    });
  };

  // Start the conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      addAiMsg(
        "Hi Alex! 👋 I'm your learning assistant for Mrs. Martinez's class. I'm here to help you this year, and I want to make sure I explain things in a way that works best for you.",
        () => {
          addAiMsg("Before we dive in, let's chat for a bit so I can get to know you. First up — what grade are you in?", () => {
            stepGradeSelector();
          });
        }
      );
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, isTyping, options, showGrades]);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <div className="w-full max-w-[600px] mx-auto px-4 pt-5 pb-32 flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-5">
          <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
            <User size={24} weight="fill" className="text-white" />
          </div>
          <div className="flex-1">
            <div className="font-heading font-semibold text-sm text-text-primary">Mrs. Martinez&apos;s Assistant</div>
            <div className="text-xs text-text-secondary">5th Period Math · Lincoln Elementary</div>
          </div>
          <span className="px-2.5 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold">Getting to know you</span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span>Getting started</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[90%] ${msg.role === 'student' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold mt-1
                ${msg.role === 'ai' ? 'bg-navy text-white' : 'bg-teal text-white'}`}>
                {msg.role === 'ai' ? <User size={16} weight="fill" /> : 'A'}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'ai'
                  ? 'bg-card-bg border border-border rounded-bl-sm text-text-primary'
                  : 'bg-teal text-white rounded-br-sm'}`}
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 self-start max-w-[90%]">
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} weight="fill" className="text-white" />
              </div>
              <div className="bg-card-bg border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-text-muted opacity-40"
                      style={{ animation: `typingBounce 1.4s infinite ease-in-out ${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grade selector */}
          {showGrades && !isTyping && (
            <div className="grid grid-cols-4 gap-2 self-start w-full max-w-sm">
              {GRADES.map(g => (
                <button
                  key={g.label}
                  onClick={() => {
                    setShowGrades(false);
                    setSelectedGrade(g.label);
                    addStudentMsg(`${g.label} grade`);
                    setTimeout(() => stepInterests(g.label), 600);
                  }}
                  className="py-3 px-2 bg-card-bg border border-border rounded-xl cursor-pointer text-center hover:border-teal hover:bg-teal/[0.04] transition-all font-heading font-semibold text-sm text-text-primary"
                >
                  {g.label}
                  {g.sub && <span className="block text-[10px] font-normal text-text-muted mt-0.5">{g.sub}</span>}
                </button>
              ))}
            </div>
          )}

          {/* Response options */}
          {options.length > 0 && !isTyping && (
            <div className="flex flex-col gap-2 self-start w-full">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={opt.onSelect}
                  className="flex items-start gap-2.5 px-4 py-3.5 bg-card-bg border border-border rounded-xl cursor-pointer text-left hover:border-teal hover:bg-teal/[0.04] hover:-translate-y-0.5 transition-all text-sm text-text-primary leading-relaxed"
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs" style={{ background: opt.levelBg }}>
                    <span style={{ color: opt.labelColor }}>●</span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: opt.labelColor }}>{opt.label}</span>
                    {opt.text}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Continue bar */}
      {showContinue && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white border-t border-border">
          <div className="max-w-[600px] mx-auto">
            <Link
              href="/student/dashboard"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-teal text-white font-heading font-semibold rounded-xl text-base hover:bg-teal/90 transition-colors"
            >
              Let&apos;s start learning!
              <ArrowRight size={18} weight="fill" />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
