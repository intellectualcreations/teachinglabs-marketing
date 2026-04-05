'use client';

import { useState } from 'react';
import { BookOpen, Brain, MusicNote, HandGrabbing, UsersThree, TreeEvergreen, Heart, Lightning, PencilSimple, MathOperations, Microphone, ChartBar, Info, CaretDown, CaretUp } from '@phosphor-icons/react';

/* ------------------------------------------------------------------ */
/*  Assessment Guide — explains the WHY behind each onboarding step   */
/* ------------------------------------------------------------------ */

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  screen: string;
  what: string;
  why: string;
  measures: string[];
  teacherUse: string;
  defaultOpen?: boolean;
}

function Section({ icon, title, screen, what, why, measures, teacherUse, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card-bg border border-border rounded-2xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-surface/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-teal/10 flex items-center justify-center text-navy dark:text-teal shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-text-primary text-base">{title}</h3>
          <p className="text-text-muted text-sm">{screen}</p>
        </div>
        {open ? <CaretUp size={20} className="text-text-muted shrink-0" /> : <CaretDown size={20} className="text-text-muted shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">What Students Do</p>
            <p className="text-text-secondary text-sm leading-relaxed">{what}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Why It Matters</p>
            <p className="text-text-secondary text-sm leading-relaxed">{why}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">What It Measures</p>
            <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
              {measures.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
          <div className="bg-navy/5 dark:bg-teal/5 rounded-xl p-4">
            <p className="text-xs font-semibold text-navy dark:text-teal uppercase tracking-wide mb-1">How This Helps You</p>
            <p className="text-text-primary text-sm leading-relaxed">{teacherUse}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">
          Student Assessment Guide
        </h1>
        <p className="text-text-secondary leading-relaxed">
          When students first join your class, they complete a guided onboarding assessment. Here is what each section measures, why we include it, and how the results help you teach more effectively.
        </p>
      </div>

      {/* Overview card */}
      <div className="bg-navy/5 dark:bg-teal/5 border border-navy/10 dark:border-teal/10 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info size={20} className="text-navy dark:text-teal" />
          <h2 className="font-heading font-semibold text-text-primary">How the Assessment Works</h2>
        </div>
        <ul className="text-text-secondary text-sm space-y-2 leading-relaxed">
          <li><strong>Adaptive difficulty:</strong> Questions adjust based on the student&apos;s age and grade tier (lower elementary, middle school, upper/high school).</li>
          <li><strong>Interest-driven content:</strong> Reading passages and math word problems are themed around the student&apos;s chosen interests (gaming, sports, animals, etc.).</li>
          <li><strong>No grades, no pressure:</strong> Students are told this is not a test. It helps the AI understand how to teach them best.</li>
          <li><strong>Voice-first option:</strong> Students can speak their answers using text-to-speech, making it accessible for younger or reluctant readers.</li>
          <li><strong>Takes 10-15 minutes:</strong> Designed to feel like a conversation, not an exam.</li>
        </ul>
      </div>

      {/* Assessment Sections */}
      <div className="space-y-3">
        <h2 className="font-heading font-semibold text-text-primary text-lg">Assessment Sections</h2>

        <Section
          icon={<Heart size={22} weight="fill" />}
          title="Welcome and Identity"
          screen="Screens 0-1"
          what="Students enter their preferred name and age. They choose a visual theme that appeals to them."
          why="Knowing a student's preferred name builds trust from the first interaction. Age determines the difficulty tier for all subsequent questions, ensuring content is developmentally appropriate."
          measures={[
            'Preferred name (used throughout the platform)',
            'Age → mapped to grade tier (lower/middle/upper)',
            'Visual preference (theme selection)',
          ]}
          teacherUse="You'll see the student's preferred name on all dashboards. Their age tier determines the starting difficulty of AI-generated activities and conversations."
          defaultOpen={true}
        />

        <Section
          icon={<Lightning size={22} weight="fill" />}
          title="Interest Selection"
          screen="Screen 2"
          what="Students pick topics they're excited about: gaming, sports, animals, space, music, art, science, food, or other."
          why="Interest-based learning is one of the strongest engagement drivers in education research. When math problems involve topics a student cares about, they're more motivated and retain information better."
          measures={[
            'Primary interests (1 or more topics)',
            'Used to personalize reading passages, math word problems, and writing prompts',
          ]}
          teacherUse="The interest data lets you connect lesson plans to what students actually care about. The AI uses these interests to generate personalized activities."
        />

        <Section
          icon={<Brain size={22} weight="fill" />}
          title="Gardner's Multiple Intelligences: Spatial"
          screen="Screen 3"
          what="Students describe a room, scene, or space from memory using words. They're asked to be as detailed as possible about what they 'see' in their mind."
          why="Based on Howard Gardner's theory of Multiple Intelligences, spatial intelligence reflects how well a student thinks in images and visualizes concepts. Strong spatial thinkers often excel with diagrams, maps, and visual organizers."
          measures={[
            'Spatial-visual intelligence strength',
            'Descriptive vocabulary range',
            'Ability to translate mental images into words',
          ]}
          teacherUse="Students with strong spatial intelligence benefit from visual aids, mind maps, and diagram-based learning. The AI adapts its teaching style accordingly."
        />

        <Section
          icon={<MusicNote size={22} weight="fill" />}
          title="Gardner's: Musical and Bodily-Kinesthetic"
          screen="Screen 4"
          what="Students indicate their relationship with music (play an instrument, enjoy rhythms, etc.) and physical/hands-on activities (sports, building, dancing)."
          why="Musical intelligence reflects sensitivity to rhythm, pitch, and pattern. Bodily-kinesthetic intelligence relates to physical coordination and learning through movement. Both are key to understanding how a student learns best."
          measures={[
            'Musical intelligence signals',
            'Kinesthetic/bodily intelligence signals',
            'Preference for hands-on vs. auditory learning',
          ]}
          teacherUse="Musical learners respond well to rhythm-based memorization and audio content. Kinesthetic learners need movement breaks and hands-on activities to stay engaged."
        />

        <Section
          icon={<UsersThree size={22} weight="fill" />}
          title="Gardner's: Interpersonal and Naturalistic"
          screen="Screen 5"
          what="Students share how they prefer to work (alone, small group, large group) and their connection to nature/the outdoors."
          why="Interpersonal intelligence determines whether a student thrives in collaborative or independent settings. Naturalistic intelligence reflects their connection to the natural world and classification/pattern skills."
          measures={[
            'Social learning preference (solo, small group, large group)',
            'Naturalistic intelligence signal',
            'Collaboration readiness',
          ]}
          teacherUse="This helps you form effective groups. Students who prefer solo work shouldn't always be forced into groups, and social learners shouldn't always work alone. The AI balances both."
        />

        <Section
          icon={<Heart size={22} weight="fill" />}
          title="Gardner's: Intrapersonal"
          screen="Screen 6"
          what="Students describe their personal strengths and what they're good at in their own words."
          why="Intrapersonal intelligence is self-awareness: knowing your own strengths, motivations, and feelings. It's a strong predictor of self-directed learning success."
          measures={[
            'Self-awareness level',
            'Ability to articulate personal strengths',
            'Growth mindset indicators',
          ]}
          teacherUse="Students with high intrapersonal intelligence can set their own goals effectively. Those who struggle here benefit from more structured goal-setting and check-ins."
        />

        <Section
          icon={<Heart size={22} weight="fill" />}
          title="Emotional Intelligence (EQ)"
          screen="Screen 7"
          what="Students read a scenario about a friend having a tough day and write how they'd respond."
          why="Emotional intelligence is the #1 predictor of classroom success beyond academics. A student who can recognize and respond to emotions (their own and others') navigates school challenges more effectively."
          measures={[
            'Empathy and perspective-taking ability',
            'Emotional vocabulary',
            'Social problem-solving approach',
          ]}
          teacherUse="EQ data helps you identify students who may need social-emotional support or who could be peer mentors. The AI adjusts its communication tone based on EQ level."
        />

        <Section
          icon={<Lightning size={22} weight="fill" />}
          title="Logic and Reasoning"
          screen="Screen 8"
          what="Students solve an age-appropriate logic puzzle (pattern completion, sequence prediction, or deductive reasoning)."
          why="Logical-mathematical intelligence goes beyond math computation. It measures pattern recognition, sequential thinking, and deductive reasoning, which are foundational skills across all subjects."
          measures={[
            'Logical reasoning ability',
            'Pattern recognition',
            'Problem-solving approach (systematic vs. intuitive)',
          ]}
          teacherUse="Strong logical thinkers respond well to structured, step-by-step instruction. More intuitive thinkers may need big-picture context before diving into details."
        />

        <Section
          icon={<BookOpen size={22} weight="fill" />}
          title="Reading Comprehension"
          screen="Screen 10"
          what="Students read a passage themed to their interests (e.g., gaming, sports, animals) and answer a comprehension question. The passage difficulty matches their age tier."
          why="Reading level is one of the most important academic indicators. It determines how a student can access all other content. This isn't about testing; it's about knowing where to start."
          measures={[
            'Reading comprehension level',
            'Ability to extract meaning from text',
            'Response depth and critical thinking',
            'Content tier calibration (shifts difficulty up/down based on response)',
          ]}
          teacherUse="Reading level directly affects how the AI presents instructions and content. A student reading below grade level gets simpler language without being patronized."
        />

        <Section
          icon={<PencilSimple size={22} weight="fill" />}
          title="Writing and Expression"
          screen="Screen 11"
          what="Students respond to a thought-provoking writing prompt connected to their interest theme. They're asked to share their opinion and reasoning."
          why="Writing reveals more than literacy. It shows how a student organizes thoughts, constructs arguments, and expresses ideas. The prompt is designed to have no 'right answer' so every student can succeed."
          measures={[
            'Writing fluency and sentence structure',
            'Ability to form and defend an opinion',
            'Vocabulary range in context',
            'Language tier calibration',
          ]}
          teacherUse="Writing level affects how the AI scaffolds assignments. Students who write in short fragments get more sentence starters and structure. Fluent writers get more open-ended challenges."
        />

        <Section
          icon={<MathOperations size={22} weight="fill" />}
          title="Math Skills (Two Questions)"
          screen="Screens 12-13"
          what="Students solve two math word problems themed to their interests. Problems are age-appropriate and cover different skill areas (multiplication/division, percentages, multi-step problems)."
          why="Two questions instead of one gives a more reliable signal. The problems are word problems (not naked equations) because real-world math application matters more than computation speed."
          measures={[
            'Math computation accuracy',
            'Word problem comprehension',
            'Multi-step problem solving',
            'Math tier calibration (adjusts after first question)',
          ]}
          teacherUse="Math level determines the difficulty of AI-generated math content and how much scaffolding the AI provides when helping with math-related activities."
        />
      </div>

      {/* How scores are used */}
      <div className="bg-card-bg border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ChartBar size={20} className="text-navy dark:text-teal" />
          <h2 className="font-heading font-semibold text-text-primary">How Results Are Used</h2>
        </div>
        <div className="space-y-3 text-text-secondary text-sm leading-relaxed">
          <p>
            Assessment results create a <strong>Learning Profile</strong> for each student. This profile is used in three ways:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>AI Personalization:</strong> The AI teaching assistant adapts its language level, explanation style, and content themes to match each student&apos;s profile.</li>
            <li><strong>Teacher Insights:</strong> You can view each student&apos;s strengths and learning preferences on the Student Detail page, helping you differentiate instruction.</li>
            <li><strong>Activity Generation:</strong> When you generate activities with AI, it considers the class&apos;s collective profiles to create appropriately challenging content.</li>
          </ol>
          <p>
            Students can retake the assessment at any time. Profiles update automatically, so the AI grows with the student.
          </p>
        </div>
      </div>

      {/* Research foundation */}
      <div className="bg-card-bg border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">Research Foundation</h2>
        <div className="space-y-2 text-text-secondary text-sm leading-relaxed">
          <p><strong>Howard Gardner&apos;s Multiple Intelligences (1983):</strong> The theory that intelligence is not a single general ability but a set of distinct capacities. Our assessment measures 7 of the 8 intelligences.</p>
          <p><strong>Interest-Driven Learning (Hidi &amp; Renninger, 2006):</strong> Research shows that personal interest significantly increases attention, effort, and learning outcomes.</p>
          <p><strong>Adaptive Assessment:</strong> Questions adjust based on student responses, following the principle of the Zone of Proximal Development (Vygotsky) to find each student&apos;s instructional level.</p>
          <p><strong>Social-Emotional Learning (CASEL):</strong> The EQ component aligns with CASEL&apos;s competency framework for self-awareness and social awareness.</p>
        </div>
      </div>
    </div>
  );
}
