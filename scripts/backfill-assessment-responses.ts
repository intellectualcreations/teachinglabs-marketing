/**
 * Backfill `assessment_responses` for the 30 seeded Coach Stewart students.
 * Populates every category with realistic Q&A calibrated to each student's
 * baseline_level (Basic / Proficient / Advanced).
 *
 * Run: npx tsx scripts/backfill-assessment-responses.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type Level = 'Emerging' | 'Developing' | 'Proficient' | 'Advanced' | 'Exemplary';

// Space-themed content (since seeded students all have theme='space')
const SPACE = {
  passage: {
    lower: `The Sun is a giant ball of hot gas. It is so big that more than a million Earths could fit inside it. The Sun gives us light and heat. Without the Sun, plants could not grow, and there would be no food to eat. Even at night, the Sun is still shining — it is just on the other side of Earth. The Sun is actually a star, but it looks bigger and brighter than other stars because it is much closer to us.`,
    middle: `The International Space Station orbits Earth about 250 miles above the ground, traveling at 17,500 miles per hour. It completes one trip around our planet every 90 minutes, which means astronauts on board see 16 sunrises and sunsets every day. Built as a partnership between 15 countries, the station has been continuously occupied since the year 2000. Astronauts who live there conduct science experiments you cannot do on Earth, because without gravity, things behave differently — even the way their muscles and bones react changes.`,
    upper: `When a massive star exhausts its nuclear fuel, it cannot sustain the outward pressure of fusion against the inward pull of gravity, leading to a catastrophic collapse. The star's core compresses so densely that protons and electrons merge into neutrons, and if the mass exceeds approximately three solar masses, not even neutron degeneracy pressure can stop the collapse — the result is a black hole. The event horizon that surrounds it marks the boundary beyond which light itself cannot escape. Recent observations by the Event Horizon Telescope have given us our first direct images of these cosmic phenomena.`,
  },
  readingQuestion: {
    lower: `What does the Sun give us that helps plants grow?`,
    middle: `Why do astronauts on the Space Station see 16 sunrises every day?`,
    upper: `Why does a massive star collapse after it runs out of fuel?`,
  },
  mathQ1: {
    lower: { question: 'A rocket launches 12 satellites. If 3 are for weather and the rest are for communication, how many are for communication?', answer: 9 },
    middle: { question: 'A space probe travels 240 million miles in 4 years. On average, how many million miles per year does it travel?', answer: 60 },
    upper: { question: 'If a planet has an orbital period of 8 Earth years and its star has 4x the mass of our Sun, estimate the planet\'s average distance from the star using Kepler\'s third law (T² = a³/M). Round to one decimal.', answer: 6.3 },
  },
  mathQ2: {
    lower: { question: 'An astronaut eats 3 meals a day in space. How many meals does she eat in a full week?', answer: 21 },
    middle: { question: 'The rover drives 18 meters, stops, and then drives another 27 meters. How many total meters did it drive?', answer: 45 },
    upper: { question: 'A satellite orbits at 400 km altitude with a period of 92 minutes. What fraction of a full day (in hours) does one orbit represent? Round to three decimal places.', answer: 0.064 },
  },
};

function tierFor(level: Level): 'lower' | 'middle' | 'upper' {
  if (level === 'Emerging' || level === 'Developing') return 'lower';
  if (level === 'Proficient') return 'middle';
  return 'upper'; // Advanced or Exemplary
}

const READING_ANSWER_BY_LEVEL: Record<Level, { lower: string; middle: string; upper: string }> = {
  Emerging: {
    lower: 'Light and heat.',
    middle: 'Because it goes fast.',
    upper: 'It collapses.',
  },
  Developing: {
    lower: 'The Sun gives plants light and heat.',
    middle: 'Because the Space Station goes around the Earth really fast.',
    upper: 'Because it runs out of energy and gets squished by gravity.',
  },
  Exemplary: {
    lower: 'The Sun provides energy in the form of light (for photosynthesis) and heat (for the temperatures plants need). Without these, the carbon fixation cycle that creates plant tissue could not run.',
    middle: 'The Station orbits once every 90 minutes at ~17,500 mph, completing 16 orbits per 24-hour day. Because each orbit passes through both the day and night side of Earth, astronauts see 16 sunrises and 16 sunsets in a single Earth day — not because the Sun moves faster, but because they do.',
    upper: 'In equilibrium, a massive star balances outward radiation pressure from thermonuclear fusion against inward gravitational force. When fuel is exhausted, fusion ceases and the outward pressure vanishes. Gravitational collapse begins: electron degeneracy pressure first halts collapse into a white dwarf, then neutron degeneracy pressure at higher masses yields a neutron star. Above ~3 solar masses (the Tolman-Oppenheimer-Volkoff limit) even that fails, and the core continues collapsing past the Schwarzschild radius into a black hole with an event horizon beyond which no information can escape.',
  },
  Proficient: {
    lower: 'The Sun gives us light and heat, which plants need to grow food.',
    middle: 'It orbits Earth every 90 minutes at 17,500 mph, so it circles the planet many times each day which means the astronauts keep seeing the Sun come up and set.',
    upper: 'When the star runs out of fuel, nuclear fusion stops pushing outward, and gravity becomes stronger than the pressure inside, so the star collapses.',
  },
  Advanced: {
    lower: 'The Sun gives Earth light and heat, and plants use the light to grow food through photosynthesis.',
    middle: 'Because the Space Station orbits Earth once every 90 minutes at 17,500 mph, astronauts complete 16 full orbits daily. Each orbit moves them from day side to night side of Earth, so they see 16 sunrises and 16 sunsets every single day.',
    upper: 'Fusion reactions in a massive star\'s core generate outward radiation pressure that counteracts gravitational collapse. When the star exhausts its fuel, fusion stops, outward pressure vanishes, and gravity compresses the core until — if the mass is above the Tolman-Oppenheimer-Volkoff limit (~3 solar masses) — neutron degeneracy pressure fails and the core collapses into a black hole.',
  },
};

const WRITING_BY_LEVEL: Record<Level, string> = {
  Emerging: `My name is {name}. I like games.`,
  Exemplary: `I'm {name}, and I've always been drawn to the edges of what we understand — the places where physics stops giving clean answers, where ecosystems hold intricate relationships no one has fully mapped, where language can almost-but-not-quite describe a feeling. I read widely, write daily, and keep a lab notebook for the experiments I run in my garage. This year I'm co-writing a zine with two friends and training for my first half-marathon. What I want from school is fewer answers and better questions.`,
  Developing: `My name is {name}. I like games and my dog. School is ok. Math is hard sometimes.`,
  Proficient: `I'm {name}. I like spending time with friends, playing soccer, and video games. My favorite class is science because we do experiments. I want to be better at writing stories because I have a lot of ideas but I get stuck when I try to put them on paper.`,
  Advanced: `I'm {name}, and I've been obsessed with how things work since I was little. I spend most of my free time reading about space, building with my 3D printer, and arguing with my friends about whether AI is going to change everything. My biggest goal this year is to finish the short novel I started during winter break. School can be frustrating when we move too slow, but I love it when a teacher lets us go deep.`,
};

const SPATIAL_BY_LEVEL: Record<Level, string> = {
  Emerging: `a house`,
  Exemplary: `A self-healing biosphere cube — the outer shell is algae-infused bioglass that photosynthesizes and scrubs CO2, the interior is stratified: lower third hydroponic farms, middle third living quarters with rotating fabric architecture (walls change based on activity), upper third is a micro-cloud forest with resident hummingbirds and amphibians. Heating and cooling is passive via salt-hydrate phase-change walls. The whole cube floats on water and tracks the sun for optimal light exposure.`,
  Developing: `A spaceship with a big lazer and a kitchen inside`,
  Proficient: `A colony on Mars with three round buildings for houses, a greenhouse dome with food plants, and tunnels connecting everything so no one has to go outside when there's a dust storm.`,
  Advanced: `A modular orbital habitat that spins to create artificial gravity — two counter-rotating rings connected by a central hub. The inner ring has agricultural zones with rotating hydroponic towers, the outer ring has living quarters, and the hub is for arrival docks and zero-G research labs. The windows would polarize automatically based on sun exposure.`,
};

const INTERPERSONAL_BY_LEVEL: Record<Level, string> = {
  Emerging: `with my mom`,
  Exemplary: `I flex between modes based on the work. For creative divergence I want a small diverse group because we collectively surface angles I'd never reach alone. For deep analysis I need solo time first — I have to form my own thesis before exposing it. When I lead a group I deliberately invite disagreement early because consensus reached too fast is usually wrong.`,
  Developing: `I like to work with my best friend.`,
  Proficient: `I like working in a group of 2 or 3. We talk through the problem together and split up the hard parts. If I get stuck I ask someone to explain it a different way.`,
  Advanced: `It depends on the task. For creative work I love bouncing ideas with a small team because other people spot things I miss. But for deep problem-solving I need quiet solo time first, then I bring what I figured out back to the group.`,
};

const INTRA_STRENGTHS_BY_LEVEL: Record<Level, string> = {
  Emerging: `games`,
  Exemplary: `Metacognition — I'm genuinely good at noticing why I'm struggling and reframing the approach. Also: spotting when two unrelated-looking things are structurally the same. And I can usually tell within 30 seconds whether a conversation needs a question, a joke, or just silence.`,
  Developing: `I am good at coloring`,
  Proficient: `I'm good at remembering facts about animals and I can read fast.`,
  Advanced: `I'm really good at noticing patterns — like when someone's mood changes, or when a math problem has the same shape as a different one I already solved. I also pick up new video games crazy fast because I figure out the system.`,
};

const INTRA_GROWTH_BY_LEVEL: Record<Level, string> = {
  Emerging: `be good`,
  Exemplary: `Patience with iteration. I see the end state clearly and I want to be there immediately. I have to consciously remind myself that craft comes from finishing the unglamorous middle sections of a project, not just inspired starts and endings.`,
  Developing: `math and cleaning my room`,
  Proficient: `Being more patient when things don't work the first time. I get frustrated and want to quit.`,
  Advanced: `Public speaking — I have clear ideas in my head but my voice gets shaky when I have to explain them in front of the class. I also want to get better at asking for help earlier instead of trying to figure everything out alone.`,
};

const NATURAL_BY_LEVEL: Record<Level, string> = {
  Emerging: `I like my dog`,
  Exemplary: `Foundational. I've been keeping a seasonal observation journal since I was 7. I can identify every bird that nests within a mile of my house, I know which trees leaf out first in spring, and I get real joy from watching how ecosystems negotiate change. My favorite class would be one held entirely outside.`,
  Developing: `I like dogs and trees`,
  Proficient: `I love being outside. I go on hikes with my family and I can name a bunch of bird species.`,
  Advanced: `Deeply. I keep a nature journal where I sketch what I see and I've been tracking the same red-tailed hawk pair that nests near our house for two years. Watching ecosystems respond to seasonal change is genuinely one of my favorite things.`,
};

const EQ_FRIEND_BY_LEVEL: Record<Level, string> = {
  Emerging: `ask what happened`,
  Exemplary: `First I'd read their state — some people want to talk, some want distraction, some want quiet company. I'd ask which, honestly: "Do you want to talk about it, or do you want me to just hang with you?" If they want to talk, my job is to listen without rushing to fix. I try to reflect back what I hear so they know they're understood, and I only offer thoughts if they ask. And I'd check in again the next day.`,
  Developing: `Ask them what is wrong.`,
  Proficient: `I'd ask them what happened and really listen. I try not to jump in with advice right away because sometimes people just need to be heard first.`,
  Advanced: `I'd check if they want to talk or just want someone to sit with them — those are different needs. If they want to talk I'd ask open questions. If they want company I'd just be there without making it weird. And I wouldn't try to fix it unless they asked.`,
};

const EQ_SELF_BY_LEVEL: Record<Level, string> = {
  Emerging: `play games`,
  Exemplary: `Naming the emotion specifically — not "bad" but "disappointed" or "overwhelmed" or "grief-adjacent." Accuracy changes what I need. Then I pick the right regulation tool: breath work if it's panic, movement if it's anger, journaling if it's confusion, company if it's loneliness. I learned the hard way that isolating when I'm low makes it worse, so now I force myself to send one text.`,
  Developing: `I go to my room and play games.`,
  Proficient: `I usually take a walk or listen to music. If I'm really upset I'll talk to my mom later when I'm calmer.`,
  Advanced: `First I recognize what I'm actually feeling — sometimes what feels like anger is really disappointment or fear. Then I either write it out or go do something physical to burn the energy. If it's about a person I'll reach out later when I can talk without reacting.`,
};

const MUSICAL_SIGNALS_BY_LEVEL: Record<Level, string[]> = {
  Emerging: [],
  Exemplary: ['plays_instrument', 'makes_beats', 'sings', 'listens_daily'],
  Developing: ['listens_daily'],
  Proficient: ['listens_daily', 'sings'],
  Advanced: ['plays_instrument', 'makes_beats', 'listens_daily'],
};

const KINES_SIGNALS_BY_LEVEL: Record<Level, string[]> = {
  Emerging: [],
  Exemplary: ['hands_on', 'moving', 'trial_error'],
  Developing: ['hands_on'],
  Proficient: ['hands_on', 'trial_error'],
  Advanced: ['hands_on', 'moving', 'trial_error'],
};

function mathAnswerFor(level: Level, correct: number): string {
  if (level === 'Advanced' || level === 'Proficient' || level === 'Exemplary') return String(correct);
  // Emerging / Developing get it wrong-ish
  const off = correct > 10 ? Math.round(correct * 0.7) : Math.max(0, correct - 2);
  return String(off);
}

// All signals below are returned in the unified capitalized scale.
function signalForMath(level: Level): string {
  if (level === 'Exemplary') return 'Exemplary';
  if (level === 'Advanced')  return 'Advanced';
  if (level === 'Proficient')return 'Proficient';
  if (level === 'Developing')return 'Developing';
  return 'Emerging';
}

function signalForLogic(level: Level): string {
  if (level === 'Exemplary') return 'Exemplary';
  if (level === 'Advanced')  return 'Advanced';
  if (level === 'Proficient')return 'Proficient';
  if (level === 'Developing')return 'Developing';
  return 'Emerging';
}

function signalForGardner(level: Level, high: boolean): string {
  if (level === 'Exemplary') return high ? 'Exemplary' : 'Advanced';
  if (level === 'Advanced')  return high ? 'Advanced'  : 'Proficient';
  if (level === 'Proficient')return high ? 'Proficient': 'Developing';
  if (level === 'Developing')return high ? 'Developing': 'Emerging';
  return 'Emerging';
}

async function main() {
  console.log('→ Loading seeded students...');
  const { data: users } = await (admin.auth as any).admin.listUsers({ page: 1, perPage: 1000 });
  const seeded = (users.users as any[]).filter(u => /^imastudent\d+@stewart\.in$/i.test(u.email || ''));
  console.log(`  Found ${seeded.length} seeded students.`);

  const { data: profiles } = await (admin as any).from('profiles').select('id, preferred_name, baseline_level').in('id', seeded.map(u => u.id));
  const profMap = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));

  let updated = 0;
  for (const user of seeded) {
    const prof = profMap.get(user.id);
    if (!prof?.baseline_level) continue;
    const level = prof.baseline_level as Level;
    const tier = tierFor(level);
    const name = prof.preferred_name || 'the student';

    const q1 = SPACE.mathQ1[tier];
    const q2 = SPACE.mathQ2[tier];

    const rows = [
      // Reading
      { category: 'reading', question_key: 'reading_passage_comprehension', question_order: 1,
        question_text: `Reading passage: ${SPACE.passage[tier]}\n\nQuestion: ${SPACE.readingQuestion[tier]}`,
        question_type: 'text',
        student_answer: READING_ANSWER_BY_LEVEL[level][tier],
        signal_result: tier, scoring_metadata: { theme: 'space', tier } },

      // Math
      { category: 'math', question_key: 'math_q1', question_order: 2,
        question_text: q1.question, question_type: 'number',
        student_answer: mathAnswerFor(level, q1.answer), correct_answer: String(q1.answer),
        signal_result: signalForMath(level) },
      { category: 'math', question_key: 'math_q2', question_order: 3,
        question_text: q2.question, question_type: 'number',
        student_answer: mathAnswerFor(level, q2.answer), correct_answer: String(q2.answer),
        signal_result: signalForMath(level) },

      // Logic
      { category: 'logic', question_key: 'logic_reasoning', question_order: 4,
        question_text: 'If a shelf has 3 books and you add 2 more then take 1 away, how many books are left?',
        question_type: 'text',
        student_answer: (level === 'Emerging' || level === 'Developing') ? '5' : '4', correct_answer: '4',
        signal_result: signalForLogic(level) },

      // Writing
      { category: 'writing', question_key: 'writing_prompt', question_order: 5,
        question_text: 'Tell us about yourself \u2014 what do you love, what do you want to get better at, what makes you curious?',
        question_type: 'text',
        student_answer: WRITING_BY_LEVEL[level].replace('{name}', name) },

      // Spatial
      { category: 'spatial', question_key: 'spatial_description', question_order: 6,
        question_text: 'Describe your dream invention, world, or game \u2014 as wild or detailed as you want.',
        question_type: 'text', student_answer: SPATIAL_BY_LEVEL[level],
        signal_result: signalForGardner(level, true) },

      // Musical
      { category: 'musical', question_key: 'musical_signals', question_order: 7,
        question_text: 'Which of these describe how music fits into your life?',
        question_type: 'checkbox',
        options_shown: ['plays_instrument', 'makes_beats', 'sings', 'listens_daily', 'not_my_thing'],
        student_answer: JSON.stringify(MUSICAL_SIGNALS_BY_LEVEL[level]),
        signal_result: signalForGardner(level, MUSICAL_SIGNALS_BY_LEVEL[level].includes('plays_instrument')) },

      // Kinesthetic
      { category: 'kinesthetic', question_key: 'kinesthetic_signals', question_order: 8,
        question_text: 'How do you like to learn new things?',
        question_type: 'checkbox',
        options_shown: ['hands_on', 'moving', 'trial_error', 'watch_first'],
        student_answer: JSON.stringify(KINES_SIGNALS_BY_LEVEL[level]),
        signal_result: signalForGardner(level, KINES_SIGNALS_BY_LEVEL[level].includes('trial_error')) },

      // Interpersonal
      { category: 'interpersonal', question_key: 'interpersonal_style', question_order: 9,
        question_text: 'When you are working on a project, how do you usually like to work?',
        question_type: 'text', student_answer: INTERPERSONAL_BY_LEVEL[level],
        signal_result: signalForGardner(level, true) },

      // Intrapersonal
      { category: 'intrapersonal', question_key: 'intrapersonal_strengths', question_order: 10,
        question_text: 'What is something you are really good at?',
        question_type: 'text', student_answer: INTRA_STRENGTHS_BY_LEVEL[level],
        signal_result: signalForGardner(level, true) },
      { category: 'intrapersonal', question_key: 'intrapersonal_growth', question_order: 11,
        question_text: 'What is something you want to get better at?',
        question_type: 'text', student_answer: INTRA_GROWTH_BY_LEVEL[level] },

      // Naturalistic
      { category: 'naturalistic', question_key: 'naturalistic_signal', question_order: 12,
        question_text: 'How do you feel about nature, plants, animals, or the outdoors?',
        question_type: 'text', student_answer: NATURAL_BY_LEVEL[level],
        signal_result: signalForGardner(level, level === 'Advanced') },

      // EQ
      { category: 'eq', question_key: 'eq_friend_response', question_order: 13,
        question_text: 'Your friend is upset about something that happened at school. What do you do?',
        question_type: 'text', student_answer: EQ_FRIEND_BY_LEVEL[level] },
      { category: 'eq', question_key: 'eq_self_response', question_order: 14,
        question_text: 'When you are feeling really frustrated or upset, what helps you feel better?',
        question_type: 'text', student_answer: EQ_SELF_BY_LEVEL[level] },
    ].map(r => ({ ...r, student_id: user.id }));

    const { error } = await (admin.from as any)('assessment_responses').upsert(rows, { onConflict: 'student_id,question_key' });
    if (error) { console.log(`  ERROR for ${user.email}: ${error.message}`); continue; }
    updated++;
  }

  console.log(`\n\u2713 Backfilled responses for ${updated}/${seeded.length} students. Each student now has ~15 rows spanning reading, math, logic, writing, spatial, musical, kinesthetic, interpersonal, intrapersonal, naturalistic, and eq categories.`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
