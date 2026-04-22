/**
 * Seed 30 test students for Coach Stewart's 7 classes.
 *
 * Creates:
 *  - auth users (email-confirmed) — magic-link-ready
 *  - profiles (first/last/preferred/age/superpower/baseline_level/primary_intelligence)
 *  - student_assessments (calibrated to Basic / Proficient / Advanced)
 *  - enrollments (~5-6 per class, 7 classes, overlap)
 *
 * Safe to re-run: upserts profiles/assessments, updates existing enrollments.
 *
 * Run: npx tsx scripts/seed-coach-stewart-students.ts
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, COACH_STEWART_TEACHER_ID (optional)
 *
 * If COACH_STEWART_TEACHER_ID is not set, finds the teacher whose display_name
 * or preferred_name contains "Stewart".
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_ID_OVERRIDE = process.env.COACH_STEWART_TEACHER_ID || '';

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

// ── Students ──────────────────────────────────────────────────────────
// Based on the "student data sample set.xlsx" provided by Dottie.
interface StudentRow {
  firstName: string;
  lastName: string;
  preferredName: string;
  nameFlagged: boolean;
  email: string;
  enrolledDate: string;     // ISO date
  baselineDate: string;     // ISO date
  level: 'Basic' | 'Proficient' | 'Advanced';
}

const STUDENTS: StudentRow[] = [
  { firstName: 'Liam',     lastName: 'O\u2019Connor',       preferredName: 'Liam',   nameFlagged: false, email: 'imastudent1@stewart.in',  enrolledDate: '2026-01-15', baselineDate: '2026-01-15', level: 'Proficient' },
  { firstName: 'Aaliyah',  lastName: 'Johnson',              preferredName: 'Aaliyah',nameFlagged: false, email: 'imastudent2@stewart.in',  enrolledDate: '2026-02-03', baselineDate: '2026-02-03', level: 'Advanced'   },
  { firstName: 'Mateo',    lastName: 'Ramirez',              preferredName: 'Mateo',  nameFlagged: true,  email: 'imastudent3@stewart.in',  enrolledDate: '2026-01-28', baselineDate: '2026-01-28', level: 'Basic'      },
  { firstName: 'Sophia',   lastName: 'Chen',                 preferredName: 'Sophie', nameFlagged: false, email: 'imastudent4@stewart.in',  enrolledDate: '2026-03-01', baselineDate: '2026-03-01', level: 'Proficient' },
  { firstName: 'Elijah',   lastName: 'Washington',           preferredName: 'Eli',    nameFlagged: true,  email: 'imastudent5@stewart.in',  enrolledDate: '2026-02-10', baselineDate: '2026-02-10', level: 'Basic'      },
  { firstName: 'Isabella', lastName: 'Rossi',                preferredName: 'Bella',  nameFlagged: false, email: 'imastudent6@stewart.in',  enrolledDate: '2026-01-22', baselineDate: '2026-01-22', level: 'Advanced'   },
  { firstName: 'Noah',     lastName: 'Kim',                  preferredName: 'Noah',   nameFlagged: false, email: 'imastudent7@stewart.in',  enrolledDate: '2026-02-18', baselineDate: '2026-02-18', level: 'Proficient' },
  { firstName: 'Ava',      lastName: 'Patel',                preferredName: 'Ava',    nameFlagged: false, email: 'imastudent8@stewart.in',  enrolledDate: '2026-01-30', baselineDate: '2026-01-30', level: 'Proficient' },
  { firstName: 'Jayden',   lastName: 'Brooks',               preferredName: 'Jay',    nameFlagged: true,  email: 'imastudent9@stewart.in',  enrolledDate: '2026-02-25', baselineDate: '2026-02-25', level: 'Basic'      },
  { firstName: 'Fatima',   lastName: 'Hassan',               preferredName: 'Fatima', nameFlagged: false, email: 'imastudent10@stewart.in', enrolledDate: '2026-03-05', baselineDate: '2026-03-05', level: 'Advanced'   },
  { firstName: 'Lucas',    lastName: 'M\u00fcller',          preferredName: 'Luke',   nameFlagged: false, email: 'imastudent11@stewart.in', enrolledDate: '2026-01-19', baselineDate: '2026-01-19', level: 'Proficient' },
  { firstName: 'Mia',      lastName: 'Nguyen',               preferredName: 'Mia',    nameFlagged: false, email: 'imastudent12@stewart.in', enrolledDate: '2026-02-07', baselineDate: '2026-02-07', level: 'Advanced'   },
  { firstName: 'Ethan',    lastName: 'Cohen',                preferredName: 'Ethan',  nameFlagged: false, email: 'imastudent13@stewart.in', enrolledDate: '2026-01-26', baselineDate: '2026-01-26', level: 'Proficient' },
  { firstName: 'Zoe',      lastName: 'Papadopoulos',         preferredName: 'Zoe',    nameFlagged: false, email: 'imastudent14@stewart.in', enrolledDate: '2026-03-03', baselineDate: '2026-03-03', level: 'Advanced'   },
  { firstName: 'Amir',     lastName: 'Khan',                 preferredName: 'Amir',   nameFlagged: true,  email: 'imastudent15@stewart.in', enrolledDate: '2026-02-12', baselineDate: '2026-02-12', level: 'Basic'      },
  { firstName: 'Chloe',    lastName: 'Dubois',               preferredName: 'Chloe',  nameFlagged: false, email: 'imastudent16@stewart.in', enrolledDate: '2026-01-31', baselineDate: '2026-01-31', level: 'Proficient' },
  { firstName: 'Daniel',   lastName: 'Park',                 preferredName: 'Danny',  nameFlagged: true,  email: 'imastudent17@stewart.in', enrolledDate: '2026-02-20', baselineDate: '2026-02-20', level: 'Basic'      },
  { firstName: 'Gabriela', lastName: 'Silva',                preferredName: 'Gabby',  nameFlagged: false, email: 'imastudent18@stewart.in', enrolledDate: '2026-01-24', baselineDate: '2026-01-24', level: 'Proficient' },
  { firstName: 'Jackson',  lastName: 'Smith',                preferredName: 'Jack',   nameFlagged: true,  email: 'imastudent19@stewart.in', enrolledDate: '2026-02-14', baselineDate: '2026-02-14', level: 'Basic'      },
  { firstName: 'Priya',    lastName: 'Shah',                 preferredName: 'Priya',  nameFlagged: false, email: 'imastudent20@stewart.in', enrolledDate: '2026-03-06', baselineDate: '2026-03-06', level: 'Advanced'   },
  { firstName: 'Caleb',    lastName: 'Brown',                preferredName: 'Caleb',  nameFlagged: true,  email: 'imastudent21@stewart.in', enrolledDate: '2026-01-18', baselineDate: '2026-01-18', level: 'Basic'      },
  { firstName: 'Leila',    lastName: 'Haddad',               preferredName: 'Leila',  nameFlagged: false, email: 'imastudent22@stewart.in', enrolledDate: '2026-02-09', baselineDate: '2026-02-09', level: 'Proficient' },
  { firstName: 'Oliver',   lastName: 'Schmidt',              preferredName: 'Ollie',  nameFlagged: false, email: 'imastudent23@stewart.in', enrolledDate: '2026-01-27', baselineDate: '2026-01-27', level: 'Proficient' },
  { firstName: 'Arjun',    lastName: 'Reddy',                preferredName: 'Arjun',  nameFlagged: false, email: 'imastudent24@stewart.in', enrolledDate: '2026-02-22', baselineDate: '2026-02-22', level: 'Advanced'   },
  { firstName: 'Sofia',    lastName: 'Martinez',             preferredName: 'Sofi',   nameFlagged: false, email: 'imastudent25@stewart.in', enrolledDate: '2026-03-04', baselineDate: '2026-03-04', level: 'Proficient' },
  { firstName: 'Benjamin', lastName: 'Taylor',               preferredName: 'Ben',    nameFlagged: false, email: 'imastudent26@stewart.in', enrolledDate: '2026-01-21', baselineDate: '2026-01-21', level: 'Advanced'   },
  { firstName: 'Nia',      lastName: 'Okafor',               preferredName: 'Nia',    nameFlagged: false, email: 'imastudent27@stewart.in', enrolledDate: '2026-02-16', baselineDate: '2026-02-16', level: 'Proficient' },
  { firstName: 'Dylan',    lastName: 'Murphy',               preferredName: 'Dylan',  nameFlagged: true,  email: 'imastudent28@stewart.in', enrolledDate: '2026-01-29', baselineDate: '2026-01-29', level: 'Basic'      },
  { firstName: 'Hana',     lastName: 'Suzuki',               preferredName: 'Hana',   nameFlagged: false, email: 'imastudent29@stewart.in', enrolledDate: '2026-02-27', baselineDate: '2026-02-27', level: 'Advanced'   },
  { firstName: 'Marcus',   lastName: 'Johnson',              preferredName: 'Marcus', nameFlagged: false, email: 'imastudent30@stewart.in', enrolledDate: '2026-01-23', baselineDate: '2026-01-23', level: 'Proficient' },
];

// ── Multiple-intelligence profiles & superpower titles ───────────────
type Intelligence =
  | 'linguistic' | 'logical_mathematical' | 'spatial' | 'musical'
  | 'bodily_kinesthetic' | 'interpersonal' | 'intrapersonal' | 'naturalistic';

const ALL_INTEL: Intelligence[] = [
  'linguistic', 'logical_mathematical', 'spatial', 'musical',
  'bodily_kinesthetic', 'interpersonal', 'intrapersonal', 'naturalistic',
];

const INTEL_LABEL: Record<Intelligence, string> = {
  linguistic: 'Linguistic',
  logical_mathematical: 'Logical-Mathematical',
  spatial: 'Visual-Spatial',
  musical: 'Musical',
  bodily_kinesthetic: 'Bodily-Kinesthetic',
  interpersonal: 'Interpersonal',
  intrapersonal: 'Intrapersonal',
  naturalistic: 'Naturalistic',
};

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

// Placeholder avatar URLs. Replace with real avatar asset paths once available.
const AVATARS = [
  '/avatars/superhero-1.png', '/avatars/superhero-2.png', '/avatars/superhero-3.png',
  '/avatars/superhero-4.png', '/avatars/superhero-5.png', '/avatars/superhero-6.png',
  '/avatars/superhero-7.png', '/avatars/superhero-8.png',
];

const INTERESTS_POOL = [
  'space', 'animals', 'sports', 'music', 'art', 'video_games', 'building',
  'reading', 'cooking', 'coding', 'science', 'dance', 'writing', 'robotics',
];

// ── Helpers ──────────────────────────────────────────────────────────

function hashNumber(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

function pick<T>(arr: T[], key: string, offset = 0): T {
  return arr[(hashNumber(key) + offset) % arr.length];
}

function pickN<T>(arr: T[], n: number, key: string): T[] {
  const out: T[] = [];
  const seen = new Set<number>();
  let i = 0;
  while (out.length < Math.min(n, arr.length) && i < arr.length * 5) {
    const idx = (hashNumber(key + ':' + i)) % arr.length;
    if (!seen.has(idx)) { seen.add(idx); out.push(arr[idx]); }
    i++;
  }
  return out;
}

function buildGardnerSignals(primary: Intelligence, level: StudentRow['level']): Record<string, string> {
  // Build a plausible multiple_intelligences JSON: primary = strong, two others developing, rest emerging
  const signals: Record<string, string> = {};
  for (const i of ALL_INTEL) signals[i] = 'emerging';
  signals[primary] = 'strong';

  // Two secondary strengths (rotated based on primary) → developing
  const secondaryCandidates = ALL_INTEL.filter(x => x !== primary);
  const sec = pickN(secondaryCandidates, 2, primary + ':' + level);
  for (const s of sec) signals[s] = 'developing';
  return signals;
}

function tierForLevel(level: StudentRow['level']): { reading: string; math: string; language: string; logic: string } {
  if (level === 'Basic')      return { reading: 'below', math: 'below', language: 'emerging', logic: 'developing' };
  if (level === 'Proficient') return { reading: 'on',    math: 'on',    language: 'developing', logic: 'developing' };
  return                              { reading: 'above', math: 'above', language: 'strong',    logic: 'strong' };
}

function writingResponseFor(level: StudentRow['level'], firstName: string): string {
  if (level === 'Basic') {
    return `My name is ${firstName}. I like games and my dog. School is ok. Math is hard sometimes.`;
  }
  if (level === 'Proficient') {
    return `I'm ${firstName}. I like spending time with friends, playing soccer, and video games. My favorite class is science because we do experiments. I want to be better at writing stories because I have a lot of ideas but I get stuck when I try to put them on paper.`;
  }
  return `I'm ${firstName}, and I've been obsessed with how things work since I was little. I spend most of my free time reading about space, building with my 3D printer, and arguing with my friends about whether AI is going to change everything. My biggest goal this year is to finish the short novel I started during winter break. School can be frustrating when we move too slow, but I love it when a teacher lets us go deep.`;
}

async function ensureUser(row: StudentRow): Promise<string> {
  // Look up existing user by email via listUsers paging
  let page = 1;
  while (true) {
    const { data, error } = await (admin.auth as any).admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find((u: any) => (u.email || '').toLowerCase() === row.email.toLowerCase());
    if (found) return found.id as string;
    if (data.users.length < 1000) break;
    page++;
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: row.email,
    email_confirm: true,
    password: `TL-seed-${hashNumber(row.email).toString(36)}!Aa1`,
    user_metadata: {
      first_name: row.firstName,
      last_name: row.lastName,
      preferred_name: row.preferredName,
      age: 12,
    },
  });
  if (createErr || !created?.user) throw createErr || new Error('createUser failed');
  return created.user.id;
}

async function getCoachStewartClasses(): Promise<{ id: string; name: string; teacherId: string }[]> {
  let teacherId = TEACHER_ID_OVERRIDE;
  if (!teacherId) {
    // Find teacher with "Stewart" in name
    const { data, error } = await (admin.from as any)('profiles')
      .select('id, display_name, preferred_name, role')
      .eq('role', 'teacher');
    if (error) throw error;
    const match = (data ?? []).find((p: any) =>
      (p.display_name || '').toLowerCase().includes('stewart') ||
      (p.preferred_name || '').toLowerCase().includes('stewart')
    );
    if (!match) {
      throw new Error('Could not find a teacher with "Stewart" in their name. Set COACH_STEWART_TEACHER_ID env var.');
    }
    teacherId = match.id;
  }

  const { data: classes, error } = await (admin.from as any)('classes')
    .select('id, name, teacher_id')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (classes ?? []).map((c: any) => ({ id: c.id, name: c.name, teacherId: c.teacher_id }));
}

// Distribute students across classes so each class has 5-6 students; each student in 2-3 classes (overlap).
function buildEnrollmentPlan(students: StudentRow[], classIds: string[]): Map<string, string[]> {
  // returns map of email -> [class_id, ...]
  const plan = new Map<string, string[]>();
  const classLoad = new Map<string, number>(classIds.map(id => [id, 0]));
  const target = 6;   // aim for up to 6 per class

  students.forEach((s, idx) => {
    const preferredCount = 2 + (idx % 2); // 2 or 3 classes per student
    // Pick the `preferredCount` classes with lowest current load
    const sorted = [...classIds].sort((a, b) => (classLoad.get(a)! - classLoad.get(b)!) || (hashNumber(s.email + a) - hashNumber(s.email + b)));
    const chosen = sorted.slice(0, preferredCount).filter(cid => (classLoad.get(cid) ?? 0) < target);
    if (chosen.length === 0) chosen.push(sorted[0]); // force at least 1
    chosen.forEach(cid => classLoad.set(cid, (classLoad.get(cid) ?? 0) + 1));
    plan.set(s.email, chosen);
  });

  return plan;
}

async function main() {
  console.log('→ Fetching Coach Stewart\'s classes...');
  const classes = await getCoachStewartClasses();
  if (classes.length === 0) {
    console.error('No classes found for Coach Stewart. Aborting.');
    process.exit(1);
  }
  console.log(`  Found ${classes.length} classes:`);
  classes.forEach(c => console.log(`    - ${c.name} (${c.id})`));

  const classIds = classes.map(c => c.id);
  const plan = buildEnrollmentPlan(STUDENTS, classIds);

  console.log('\n→ Seeding students...');
  const summary: Array<{ name: string; email: string; level: string; classes: string[] }> = [];

  for (const s of STUDENTS) {
    process.stdout.write(`  ${s.firstName} ${s.lastName} (${s.level})... `);

    // 1. Auth user
    const userId = await ensureUser(s);

    // 2. Profile
    const primary = pick<Intelligence>(ALL_INTEL, s.email);
    const title = pick<string>(SUPERPOWER_TITLES[primary], s.email, 1);
    const avatar = pick<string>(AVATARS, s.email, 2);

    const profileRow = {
      id: userId,
      role: 'student',
      display_name: `${s.firstName} ${s.lastName}`,
      first_name: s.firstName,
      last_name: s.lastName,
      preferred_name: s.preferredName,
      name_flagged: s.nameFlagged,
      age: 12,
      superpower_title: title,
      superpower_avatar: avatar,
      primary_intelligence: INTEL_LABEL[primary],
      baseline_level: s.level,
      baseline_assessment_at: s.baselineDate,
      enrolled_at: s.enrolledDate,
    };
    const { error: profErr } = await (admin.from as any)('profiles').upsert(profileRow, { onConflict: 'id' });
    if (profErr) { console.log('profile err:', profErr.message); continue; }

    // 3. Assessment
    const tiers = tierForLevel(s.level);
    const mi = buildGardnerSignals(primary, s.level);
    const assessmentRow = {
      student_id: userId,
      student_name: `${s.firstName} ${s.lastName}`,
      preferred_name: s.preferredName,
      name_flagged: s.nameFlagged,
      age: 12,
      interests: pickN(INTERESTS_POOL, 3, s.email),
      other_interests: null,
      theme: 'space',
      reading_level: tiers.reading,
      math_level: tiers.math,
      language_tier: tiers.language,
      math_performance_q1: s.level === 'Basic' ? 'struggling' : s.level === 'Proficient' ? 'on-track' : 'above',
      math_performance_q2: s.level === 'Basic' ? 'struggling' : s.level === 'Proficient' ? 'on-track' : 'above',
      writing_response: writingResponseFor(s.level, s.preferredName),
      multiple_intelligences: mi,
      logic_reasoning_level: tiers.logic,
      logic_question: 'If a shelf has 3 books and you add 2 more then take 1 away, how many books are left?',
      logic_answer_given: s.level === 'Basic' ? '5' : '4',
      emotional_intelligence_signals: {
        self_awareness: s.level === 'Basic' ? 'emerging' : 'developing',
        self_regulation: 'developing',
        empathy: 'developing',
      },
      completed_at: s.baselineDate,
    };
    const { error: assErr } = await (admin.from as any)('student_assessments').upsert(assessmentRow, { onConflict: 'student_id' });
    if (assErr) { console.log('assessment err:', assErr.message); continue; }

    // 4. Enrollments
    const classIdsForStudent = plan.get(s.email) ?? [];
    for (const cid of classIdsForStudent) {
      const enrollRow = {
        student_id: userId,
        class_id: cid,
        status: 'active',
        enrolled_at: s.enrolledDate,
      };
      const { error: enErr } = await (admin.from as any)('enrollments').upsert(enrollRow, { onConflict: 'student_id,class_id' });
      if (enErr && !/duplicate/i.test(enErr.message)) {
        console.log('enroll err:', enErr.message);
      }
    }

    const classNames = classIdsForStudent.map(id => classes.find(c => c.id === id)?.name || id);
    summary.push({ name: `${s.preferredName} ${s.lastName}`, email: s.email, level: s.level, classes: classNames });
    console.log('ok');
  }

  console.log('\n──────── Seed Summary ────────');
  const byLevel = { Basic: 0, Proficient: 0, Advanced: 0 };
  summary.forEach(s => { byLevel[s.level as keyof typeof byLevel]++; });
  console.log(`Students created: ${summary.length}/${STUDENTS.length}`);
  console.log(`  Basic: ${byLevel.Basic}, Proficient: ${byLevel.Proficient}, Advanced: ${byLevel.Advanced}`);
  console.log('\nClass rosters:');
  for (const cls of classes) {
    const roster = summary.filter(s => s.classes.includes(cls.name));
    console.log(`  ${cls.name} (${roster.length}): ${roster.map(r => r.name).join(', ')}`);
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
