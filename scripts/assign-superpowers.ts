/**
 * One-time script: Assign superpowers to all existing students who have assessments.
 * Reads MI signals from student_assessments, determines primary intelligence, assigns default title.
 * 
 * Run: npx tsx scripts/assign-superpowers.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

type Intelligence =
  | 'linguistic'
  | 'logical_mathematical'
  | 'spatial'
  | 'musical'
  | 'bodily_kinesthetic'
  | 'interpersonal'
  | 'intrapersonal'
  | 'naturalistic';

const SUPERPOWER_TITLES: Record<Intelligence, string[]> = {
  linguistic: ['The Storyteller', 'The Word Wizard', 'The Author', 'The Poet'],
  logical_mathematical: ['The Strategist', 'The Code Breaker', 'The Problem Solver', 'The Analyst'],
  spatial: ['The Architect', 'The Designer', 'The Visionary', 'The Creator'],
  musical: ['The Composer', 'The Rhythm Master', 'The Sound Crafter', 'The Maestro'],
  bodily_kinesthetic: ['The Explorer', 'The Athlete', 'The Builder', 'The Adventurer'],
  interpersonal: ['The Leader', 'The Diplomat', 'The Team Captain', 'The Connector'],
  intrapersonal: ['The Philosopher', 'The Mind Master', 'The Deep Thinker', 'The Sage'],
  naturalistic: ['The Ranger', 'The Nature Guardian', 'The Earth Scientist', 'The Wildlife Expert'],
};

function determinePrimaryIntelligence(mi: Record<string, unknown>): Intelligence {
  const scoreMap: Record<string, number> = {
    strong: 3, upper: 2.5, developing: 2, middle: 2, emerging: 1, lower: 1,
  };

  const intelligences: Intelligence[] = [
    'linguistic', 'logical_mathematical', 'spatial', 'musical',
    'bodily_kinesthetic', 'interpersonal', 'intrapersonal', 'naturalistic',
  ];

  let topIntelligence: Intelligence = 'linguistic';
  let topScore = 0;

  for (const intel of intelligences) {
    const signal = mi[intel];
    if (typeof signal === 'string') {
      const score = scoreMap[signal] ?? 1;
      if (score > topScore) {
        topScore = score;
        topIntelligence = intel;
      }
    }
  }

  return topIntelligence;
}

async function main() {
  // Fetch all assessments with MI data
  const { data: assessments, error } = await admin
    .from('student_assessments')
    .select('student_id, multiple_intelligences, preferred_name')
    .not('multiple_intelligences', 'is', null);

  if (error) {
    console.error('Error fetching assessments:', error);
    process.exit(1);
  }

  console.log(`Found ${assessments?.length || 0} students with assessments`);

  let assigned = 0;
  let skipped = 0;

  for (const a of assessments || []) {
    const mi = a.multiple_intelligences as Record<string, unknown>;
    if (!mi || typeof mi !== 'object') {
      console.log(`  Skipping ${a.student_id} — no MI data`);
      skipped++;
      continue;
    }

    const primaryIntel = determinePrimaryIntelligence(mi);
    const defaultTitle = SUPERPOWER_TITLES[primaryIntel][0];

    const { error: updateErr } = await admin
      .from('profiles')
      .update({
        primary_intelligence: primaryIntel,
        superpower_title: defaultTitle,
      })
      .eq('id', a.student_id);

    if (updateErr) {
      console.log(`  Error updating ${a.student_id}: ${updateErr.message}`);
    } else {
      console.log(`  ✅ ${a.preferred_name || a.student_id}: ${primaryIntel} → "${defaultTitle}"`);
      assigned++;
    }
  }

  console.log(`\nDone! Assigned: ${assigned}, Skipped: ${skipped}`);
}

main();
