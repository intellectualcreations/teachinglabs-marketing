/**
 * Backfill the Q&A columns added in migration 013 for the 30 seeded students.
 * Pulls the theme content directly from the onboarding themes so teachers
 * see real passages/questions, not placeholders.
 *
 * Run: npx tsx scripts/backfill-assessment-qa.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Mirror of theme content from app/student/onboarding/page.tsx (space theme only for seeded students).
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

// Map Basic/Proficient/Advanced → reading_level tier keys
function tierFor(level: 'Basic' | 'Proficient' | 'Advanced'): 'lower' | 'middle' | 'upper' {
  if (level === 'Basic') return 'lower';
  if (level === 'Proficient') return 'middle';
  return 'upper';
}

// Believable student answers per level — shows understanding calibrated to their tier
const READING_ANSWER_BY_LEVEL: Record<string, { lower: string; middle: string; upper: string }> = {
  Basic: {
    lower: 'The Sun gives plants light and heat.',
    middle: 'Because the Space Station goes around the Earth really fast.',
    upper: 'Because it runs out of energy and gets squished by gravity.',
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

function mathAnswerFor(level: 'Basic' | 'Proficient' | 'Advanced', correct: number): string {
  // Proficient + Advanced get it right; Basic misses sometimes
  if (level === 'Advanced') return String(correct);
  if (level === 'Proficient') return String(correct);
  // Basic: 50% wrong, off by a small amount
  const off = correct > 10 ? Math.round(correct * 0.7) : Math.max(0, correct - 2);
  return String(off);
}

async function main() {
  console.log('→ Loading seeded students...');
  const { data: users } = await (admin.auth as any).admin.listUsers({ page: 1, perPage: 1000 });
  const seeded = (users.users as any[]).filter(u => /^imastudent\d+@stewart\.in$/i.test(u.email || ''));
  const ids = seeded.map(u => u.id);
  console.log(`  Found ${ids.length} seeded students.`);

  // Load their profiles (to get baseline_level) and assessments (to know reading_level tier)
  const { data: profiles } = await (admin as any).from('profiles').select('id, baseline_level').in('id', ids);
  const levelMap = new Map<string, 'Basic' | 'Proficient' | 'Advanced'>();
  (profiles || []).forEach((p: any) => {
    if (p.baseline_level) levelMap.set(p.id, p.baseline_level);
  });

  const { data: assessments } = await (admin as any).from('student_assessments').select('student_id, reading_level, math_level').in('student_id', ids);

  let updated = 0;
  for (const a of (assessments || []) as any[]) {
    const level = levelMap.get(a.student_id);
    if (!level) continue;
    const rTier = tierFor(level);
    const mTier = tierFor(level);
    const q1 = SPACE.mathQ1[mTier];
    const q2 = SPACE.mathQ2[mTier];

    const update = {
      reading_passage: SPACE.passage[rTier],
      reading_question: SPACE.readingQuestion[rTier],
      reading_student_answer: READING_ANSWER_BY_LEVEL[level][rTier],
      math_q1_question: q1.question,
      math_q1_correct_answer: String(q1.answer),
      math_q1_student_answer: mathAnswerFor(level, q1.answer),
      math_q2_question: q2.question,
      math_q2_correct_answer: String(q2.answer),
      math_q2_student_answer: mathAnswerFor(level, q2.answer),
    };

    const { error } = await (admin as any).from('student_assessments').update(update).eq('student_id', a.student_id);
    if (error) {
      console.log(`  ERROR for ${a.student_id}: ${error.message}`);
      continue;
    }
    updated++;
  }

  console.log(`\n✓ Updated ${updated}/${ids.length} seeded assessments with Q&A.`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
