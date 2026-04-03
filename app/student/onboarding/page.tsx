'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowLeft,
  ChatCircle,
  SpeakerHigh,
  Microphone,
  Gear,
  GameController,
  Trophy,
  MusicNotes,
  Palette,
  PawPrint,
  Planet,
  Flask,
  ChefHat,
  BookOpen,
  FilmSlate,
  Hammer,
  Leaf,
  Calculator,
  Scroll,
  Star,
  Car,
  Code,
  Bicycle,
  Rocket,
  UsersThree,
  UserCircle,
  Brain,
  Sparkle,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/shared/ThemeToggle';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type GradeTier = 'lower' | 'middle' | 'upper';
type LanguageTier = 'young' | 'middle' | 'older';
type ThemeName = 'gaming' | 'sports' | 'animals' | 'space';
type DifficultyShift = 'up' | 'same' | 'down';
type GardnerSignal = 'strong' | 'developing' | 'emerging';

interface StudentAnswers {
  name: string;
  age: number | null;
  interests: string[];
  otherInterests: string;
  // Gardner's Multiple Intelligences
  spatialDescription: string;
  musicalSignals: string[];
  kinestheticSignals: string[];
  interpersonalStyle: string;
  intrapersonalStrengths: string;
  intrapersonalGrowth: string;
  naturalisticSignal: string;
  // Emotional Intelligence
  eqFriendResponse: string;
  eqSelfResponse: string;
  // Logic / Reasoning
  logicAnswer: string;
  // Academic
  readingResponse: string;
  writingResponse: string;
  mathResponse1: string;
  mathResponse2: string;
}

const INITIAL_ANSWERS: StudentAnswers = {
  name: '',
  age: null,
  interests: [],
  otherInterests: '',
  spatialDescription: '',
  musicalSignals: [],
  kinestheticSignals: [],
  interpersonalStyle: '',
  intrapersonalStrengths: '',
  intrapersonalGrowth: '',
  naturalisticSignal: '',
  eqFriendResponse: '',
  eqSelfResponse: '',
  logicAnswer: '',
  readingResponse: '',
  writingResponse: '',
  mathResponse1: '',
  mathResponse2: '',
};

/* ─── Content Bank ──────────────────────────────────────────────────────────── */

interface ThemeContent {
  name: ThemeName;
  passage: Record<GradeTier, string>;
  readingQuestion: Record<GradeTier, string>;
  writingPassage: string;
  writingPrompt: string;
  mathQ1: Record<GradeTier, { question: string; answer: number }>;
  mathQ2: Record<GradeTier, { question: string; answer: number }>;
}

const THEMES: Record<ThemeName, ThemeContent> = {
  gaming: {
    name: 'gaming',
    passage: {
      lower: `Video games are made by teams of people who work together. Artists draw the characters and backgrounds. Programmers write the code that makes everything move. Sound designers create the music and sound effects. It takes a long time to build a game — sometimes years! When you play a game, you are experiencing the work of hundreds of talented people. Games can teach you how to solve puzzles, work as a team, and think creatively.`,
      middle: `Game design is a combination of art, math, and storytelling. When developers build a video game, they think about how players will feel at every moment. They use math to calculate how fast a character should move or how much damage a weapon should deal. They use storytelling to create worlds that feel alive and interesting. Some of the most popular games take over five years to make and involve teams of more than 500 people working across the globe. Learning to code is one way to start your own game-making journey.`,
      upper: `The video game industry generates over $200 billion in revenue annually, surpassing both the film and music industries combined. Behind every successful game is a complex blend of disciplines: computer science, psychology, visual design, and narrative theory. Game developers study player behavior to understand what keeps people engaged, using concepts like variable reward schedules and progression systems to create compelling experiences. Increasingly, games are being recognized not just as entertainment but as powerful tools for education, therapy, and social connection.`,
    },
    readingQuestion: {
      lower: 'What do you think the main idea of that passage was? Tell me in your own words.',
      middle: 'The passage mentioned a few different skills that go into making games. What were some of them, and which one sounds most interesting to you?',
      upper: 'What surprised you most about what you read? Do you think games are as important as the passage suggests?',
    },
    writingPassage: `Every gamer has a story. Some people play games to relax after a long day. Others play to compete and test their skills. Many players say that games taught them patience, problem-solving, and even how to work as a team. A game isn't just buttons and screens — it can be an adventure, a puzzle, or a whole new world.`,
    writingPrompt: 'What do you think — are video games just for fun, or can they teach you something real? Write what you honestly think.',
    mathQ1: {
      lower: { question: 'You and 3 friends each earn 8 coins in a game. How many coins do you have altogether?', answer: 32 },
      middle: { question: 'A game gives you 150 points for each level you complete. If you finish 7 levels, how many total points have you earned?', answer: 1050 },
      upper: { question: 'A game developer earns $75 per hour. She works 38 hours this week and 42 hours next week. How much does she earn in total over both weeks?', answer: 6000 },
    },
    mathQ2: {
      lower: { question: 'You have 24 health points. A monster takes away 9. How many health points do you have left?', answer: 15 },
      middle: { question: 'A game has 3 maps. Map A has 45 enemies, Map B has 60 enemies, and Map C has 38 enemies. What is the average number of enemies per map?', answer: 47 },
      upper: { question: 'A mobile game had 8,000 downloads in January. By March, downloads grew by 35%. How many total downloads were there by March?', answer: 10800 },
    },
  },
  sports: {
    name: 'sports',
    passage: {
      lower: `Sports are a great way to stay healthy and make friends. When you play on a team, you learn to work together and support each other. Even if your team doesn't win every game, you get better every time you practice. Athletes train hard — they stretch, run, and practice their skills over and over. The most important thing in sports isn't winning. It's showing up, trying your best, and having fun with your teammates.`,
      middle: `Elite athletes don't just rely on natural talent — they train systematically. Professional sports teams use data and science to improve performance. Coaches track statistics like sprint speed, reaction time, and heart rate to build better training programs. Sleep, nutrition, and mental focus are just as important as physical practice. Studies show that young athletes who play multiple sports develop better coordination and are less likely to get injured than those who specialize too early.`,
      upper: `Sports analytics has transformed how teams compete at every level. Using advanced statistics — from shot trajectories in basketball to exit velocity in baseball — coaches and managers make decisions that were once based purely on instinct. Technology like wearable sensors and computer vision systems track every movement an athlete makes, generating terabytes of data per game. Beyond performance, sports organizations are increasingly aware of athlete mental health, recognizing that psychological resilience is as critical as physical conditioning.`,
    },
    readingQuestion: {
      lower: 'What is one thing the passage said about playing on a team? Does that match your experience?',
      middle: 'The passage talked about how athletes train. What was one thing that surprised you about how serious training can be?',
      upper: 'The passage described sports analytics. In your own words, what does that mean and why do you think teams care about data so much?',
    },
    writingPassage: `Some people think you have to be the fastest or the strongest to be a great athlete. But coaches and sports scientists disagree. They say that mental toughness — the ability to stay calm under pressure and keep going when things get hard — is what separates good athletes from great ones. Anyone can learn mental toughness with practice.`,
    writingPrompt: 'Do you agree that mental toughness matters more than natural talent in sports? Write what you think and why.',
    mathQ1: {
      lower: { question: 'A soccer team scores 3 goals in each of their 5 games. How many total goals did they score?', answer: 15 },
      middle: { question: 'A basketball player averages 22 points per game. Over a 14-game season, how many total points did she score?', answer: 308 },
      upper: { question: 'A track runner improves her 400m time from 64 seconds to 58 seconds over 6 months. What is the percentage improvement? Round to the nearest whole percent.', answer: 9 },
    },
    mathQ2: {
      lower: { question: 'There are 11 players on a soccer field. 4 of them are defenders. How many players are NOT defenders?', answer: 7 },
      middle: { question: 'A baseball team wins 18 out of 30 games. What fraction of their games did they win? Write it as a percentage.', answer: 60 },
      upper: { question: 'A sports team\'s stadium holds 42,000 fans. At 85% capacity for a playoff game, how many fans are there?', answer: 35700 },
    },
  },
  animals: {
    name: 'animals',
    passage: {
      lower: `Animals communicate in many amazing ways. Dogs wag their tails to show they are happy. Bees do a special "waggle dance" to tell other bees where flowers are. Elephants make sounds so low that humans can't even hear them! Some animals use colors to communicate — a chameleon changes its skin color to share its feelings with other chameleons. Scientists are still discovering new ways that animals talk to each other. The more we learn, the more we realize how smart and complex animals really are.`,
      middle: `Animals have evolved remarkable adaptations to survive in their environments. The arctic fox changes its fur from brown in summer to white in winter for camouflage. The mantis shrimp has 16 types of color receptors in its eyes — humans only have 3 — allowing it to see colors we can't even imagine. Deep-sea creatures like the anglerfish create their own light through a process called bioluminescence to attract prey in total darkness. These adaptations developed over millions of years.`,
      upper: `Wildlife conservation biology sits at the intersection of ecology, genetics, and policy. As habitat loss accelerates globally, scientists are developing innovative strategies to protect biodiversity. Genetic rescue — introducing individuals from other populations to restore genetic diversity — has helped pull back several species from the brink of extinction. Rewilding programs, which reintroduce apex predators like wolves to ecosystems, have produced surprising cascading effects: wolf reintroductions in Yellowstone changed river courses by reducing deer overgrazing of riverbanks.`,
    },
    readingQuestion: {
      lower: 'What is one cool way animals communicate that you read about? Did anything surprise you?',
      middle: 'The passage described some amazing animal adaptations. Pick one and explain in your own words why that adaptation helps the animal survive.',
      upper: 'The passage mentioned "cascading effects" from wolf reintroduction. What does that mean, and what does it tell you about how ecosystems work?',
    },
    writingPassage: `Scientists once believed that only humans could use tools. Then they discovered that crows can bend wire into hooks to retrieve food. Dolphins use sea sponges to protect their noses while digging for fish. Even octopuses collect coconut shells to use as portable shelters. These discoveries have changed how we think about animal intelligence — and what makes humans unique.`,
    writingPrompt: 'After reading that, do you think animals are smarter than we usually give them credit for? Write what you think and use something from the passage to support your idea.',
    mathQ1: {
      lower: { question: 'A zookeeper feeds 4 elephants. Each elephant eats 12 pounds of food per day. How many pounds of food does she need for all the elephants in one day?', answer: 48 },
      middle: { question: 'A sea turtle swims 35 miles per day during migration. How far does it travel in 3 weeks?', answer: 735 },
      upper: { question: 'A wildlife sanctuary has 240 animals. 35% are birds, 25% are mammals, and the rest are reptiles. How many reptiles are there?', answer: 96 },
    },
    mathQ2: {
      lower: { question: 'A dog needs 2 cups of food each day. How many cups does it need in one week (7 days)?', answer: 14 },
      middle: { question: 'A cheetah can sprint at 70 mph and a lion runs at 50 mph. If both run for 30 minutes, how much farther does the cheetah travel?', answer: 10 },
      upper: { question: 'A conservation area spans 4,500 square kilometers and supports 36 tigers. What is the population density in tigers per 100 square kilometers? Round to one decimal place.', answer: 0.8 },
    },
  },
  space: {
    name: 'space',
    passage: {
      lower: `Space is full of amazing things. There are eight planets in our solar system. Earth is the only planet where we know life exists. The Sun is a giant star that gives us light and warmth. Stars look small from Earth, but many are actually bigger than our Sun! Astronauts travel to space in rockets. They float inside the spacecraft because there is no gravity in space. Scientists are always learning new things about our universe.`,
      middle: `The universe is almost impossibly large. The nearest star to our Sun — Proxima Centauri — is about 4.2 light-years away. A light-year is the distance light travels in one year, approximately 5.88 trillion miles. At the speed of our fastest spacecraft, it would take about 70,000 years to reach it. Despite these distances, space agencies around the world are planning missions to Mars, which could launch as early as the 2030s. Mars missions face enormous challenges: cosmic radiation, muscle atrophy, and the psychological effects of long-duration isolation.`,
      upper: `The search for exoplanets — planets orbiting stars outside our solar system — has become one of the most exciting frontiers in modern astronomy. NASA's James Webb Space Telescope can now analyze the atmospheres of distant worlds, searching for chemical signatures like water vapor, oxygen, and methane that might indicate life. Since 1992, astronomers have confirmed over 5,500 exoplanets, including several in the "habitable zone" where liquid water could theoretically exist. The discovery of life beyond Earth would be the most transformative scientific finding in human history.`,
    },
    readingQuestion: {
      lower: 'What is one fact about space from the passage that you found interesting? Tell me about it!',
      middle: 'The passage talked about how far away other stars are. In your own words, why is it so hard for humans to travel to other stars?',
      upper: 'The passage described the search for exoplanets. What would it mean for humanity if we discovered life on another planet?',
    },
    writingPassage: `For thousands of years, humans have looked up at the night sky and wondered what is out there. Ancient civilizations used the stars to navigate, tell time, and create calendars. Today, our telescopes can see galaxies billions of light-years away. Yet the more we discover, the more questions we have. Some scientists believe that asking questions — not having answers — is the real engine of progress.`,
    writingPrompt: 'The passage says "asking questions — not having answers — is the real engine of progress." Do you agree with that idea? Write what you think.',
    mathQ1: {
      lower: { question: 'There are 8 planets in our solar system. 4 of them are smaller rocky planets. How many are the bigger gas planets?', answer: 4 },
      middle: { question: 'A spacecraft travels at 17,500 miles per hour. How far does it travel in 8 hours?', answer: 140000 },
      upper: { question: 'Mars is about 142 million miles from the Sun. Earth is about 93 million miles from the Sun. How many times farther from the Sun is Mars compared to Earth? Round to one decimal place.', answer: 1.5 },
    },
    mathQ2: {
      lower: { question: 'An astronaut sleeps 8 hours each day on the space station. How many hours do they sleep in 5 days?', answer: 40 },
      middle: { question: 'The International Space Station orbits Earth every 90 minutes. How many full orbits does it complete in 24 hours?', answer: 16 },
      upper: { question: 'A Mars mission takes 9 months each way. Astronauts spend 18 months on Mars. What percentage of the total mission time is spent traveling? Round to the nearest whole percent.', answer: 50 },
    },
  },
};

/* ─── Interest definitions ───────────────────────────────────────────────────── */

const INTERESTS = [
  { label: 'Gaming', icon: GameController, theme: 'gaming' as ThemeName },
  { label: 'Sports', icon: Trophy, theme: 'sports' as ThemeName },
  { label: 'Music', icon: MusicNotes, theme: 'sports' as ThemeName },
  { label: 'Art', icon: Palette, theme: 'animals' as ThemeName },
  { label: 'Animals', icon: PawPrint, theme: 'animals' as ThemeName },
  { label: 'Space', icon: Planet, theme: 'space' as ThemeName },
  { label: 'Science', icon: Flask, theme: 'space' as ThemeName },
  { label: 'Cooking', icon: ChefHat, theme: 'animals' as ThemeName },
  { label: 'Reading', icon: BookOpen, theme: 'space' as ThemeName },
  { label: 'Movies', icon: FilmSlate, theme: 'gaming' as ThemeName },
  { label: 'Building Things', icon: Hammer, theme: 'gaming' as ThemeName },
  { label: 'Nature', icon: Leaf, theme: 'animals' as ThemeName },
  { label: 'Math', icon: Calculator, theme: 'space' as ThemeName },
  { label: 'History', icon: Scroll, theme: 'space' as ThemeName },
  { label: 'Dancing', icon: Star, theme: 'sports' as ThemeName },
  { label: 'Fashion', icon: Bicycle, theme: 'sports' as ThemeName },
  { label: 'Cars', icon: Car, theme: 'gaming' as ThemeName },
  { label: 'Coding', icon: Code, theme: 'gaming' as ThemeName },
];

// Ages 5–18 (18 represents 18+)
const AGES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

/* ─── Gardner signal options ─────────────────────────────────────────────────── */

const MUSICAL_OPTIONS = [
  { key: 'plays_instrument', label: '🎸 I play an instrument' },
  { key: 'likes_to_sing', label: '🎤 I like to sing' },
  { key: 'music_while_studying', label: '🎧 I listen to music while studying' },
  { key: 'makes_beats', label: '🥁 I make music or beats' },
  { key: 'music_helps_focus', label: '📻 Music helps me focus' },
  { key: 'not_my_thing', label: '😐 Music isn\'t really my thing' },
];

const KINESTHETIC_OPTIONS = [
  { key: 'hands_on', label: '🙌 Doing it with my hands' },
  { key: 'moving', label: '🚶 Moving around while I learn' },
  { key: 'watching', label: '👀 Watching someone show me first' },
  { key: 'reading_first', label: '📖 Reading or listening to instructions first' },
  { key: 'trial_error', label: '🎮 Just trying things and figuring it out' },
];

const INTERPERSONAL_OPTIONS = [
  { key: 'group', label: '👥 Working with others — I love the energy!' },
  { key: 'solo', label: '🧑 Working on my own — I focus better that way' },
  { key: 'both', label: '🤝 Depends on the day!' },
];

const NATURALISTIC_OPTIONS = [
  { key: 'love_nature', label: '🌿 I love being outside — it\'s my happy place!' },
  { key: 'sometimes', label: '🌤️ It\'s nice sometimes' },
  { key: 'indoors', label: '🏠 I\'m more of an indoors person' },
];

/* ─── Logic questions by tier ────────────────────────────────────────────────── */

interface LogicQuestion {
  question: string;
  correctAnswer: number | string;
  hint: string;
}

function getLogicQuestion(tier: GradeTier): LogicQuestion {
  if (tier === 'lower') return {
    question: 'What comes next? 2, 4, 6, 8, ___',
    correctAnswer: 10,
    hint: 'Think about what changes between each number.',
  };
  if (tier === 'middle') return {
    question: 'What comes next? 3, 6, 12, 24, ___',
    correctAnswer: 48,
    hint: 'Look at how each number relates to the one before it.',
  };
  return {
    question: 'What comes next? 2, 6, 18, ___',
    correctAnswer: 54,
    hint: 'What operation connects each number to the next?',
  };
}

function evaluateLogic(answer: string, tier: GradeTier): GardnerSignal {
  const correct = tier === 'lower' ? 10 : tier === 'middle' ? 48 : 54;
  const nums = answer.match(/\d+/g)?.map(Number) || [];
  if (nums.includes(correct)) return 'strong';
  for (const n of nums) {
    if (Math.abs(n - correct) <= correct * 0.12) return 'developing';
  }
  return 'emerging';
}

/* ─── Gardner signal computation ─────────────────────────────────────────────── */

function computeGardnerSignals(answers: StudentAnswers, readingTier: GradeTier, mathTier: GradeTier): Record<string, GardnerSignal | string[] | string> {
  const musical = answers.musicalSignals;
  const kines = answers.kinestheticSignals;

  const musicalScore: GardnerSignal =
    musical.includes('plays_instrument') || musical.includes('makes_beats') ? 'strong'
    : musical.length > 0 && !musical.includes('not_my_thing') ? 'developing'
    : 'emerging';

  const kinestheticScore: GardnerSignal =
    (kines.includes('hands_on') || kines.includes('moving')) && kines.includes('trial_error') ? 'strong'
    : kines.includes('hands_on') || kines.includes('moving') ? 'developing'
    : 'emerging';

  const spatialScore: GardnerSignal =
    answers.spatialDescription.length > 60 ? 'strong'
    : answers.spatialDescription.length > 20 ? 'developing'
    : 'emerging';

  const interpersonalScore: GardnerSignal =
    answers.interpersonalStyle === 'group' ? 'strong'
    : answers.interpersonalStyle === 'both' ? 'developing'
    : 'emerging';

  const intrapersonalScore: GardnerSignal =
    answers.intrapersonalStrengths.length > 30 && answers.intrapersonalGrowth.length > 15 ? 'strong'
    : answers.intrapersonalStrengths.length > 8 ? 'developing'
    : 'emerging';

  const naturalisticScore: GardnerSignal =
    answers.naturalisticSignal === 'love_nature' ? 'strong'
    : answers.naturalisticSignal === 'sometimes' ? 'developing'
    : 'emerging';

  return {
    linguistic: readingTier,
    logical_mathematical: mathTier,
    spatial: spatialScore,
    musical: musicalScore,
    bodily_kinesthetic: kinestheticScore,
    interpersonal: interpersonalScore,
    intrapersonal: intrapersonalScore,
    naturalistic: naturalisticScore,
    musical_signals_raw: answers.musicalSignals,
    kinesthetic_signals_raw: answers.kinestheticSignals,
  };
}

function getSpatialPrompt(interests: string[]): string {
  const theme = selectTheme(interests);
  const map: Record<ThemeName, string> = {
    gaming: 'If you could design the ultimate game level or virtual world, what would it look like? Describe it!',
    sports: 'Picture your dream sports arena or training ground. What\'s in it and what makes it special?',
    animals: 'You get to design a perfect wildlife sanctuary. What animals are there and what does it look like?',
    space: 'You\'re designing your own space station. What\'s in it and how does it work?',
  };
  return map[theme];
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

/** Maps student age to content difficulty tier. */
function ageToTier(age: number): GradeTier {
  if (age <= 8) return 'lower';
  if (age <= 12) return 'middle';
  return 'upper';
}

/** Maps student age to initial communication language tier. */
function ageToLanguageTier(age: number): LanguageTier {
  if (age <= 8) return 'young';
  if (age <= 12) return 'middle';
  return 'older';
}

/**
 * Returns age-appropriate coach text based on the current language tier.
 * - young (5–8): simple words, short sentences, lots of emoji
 * - middle (9–12): conversational, friendly, moderate detail
 * - older (13–18+): mature tone, treats student as a peer, minimal emoji
 */
function coachText(young: string, middle: string, older: string, tier: LanguageTier): string {
  if (tier === 'young') return young;
  if (tier === 'middle') return middle;
  return older;
}

/** Shifts the language tier up or down based on observed sophistication. */
function shiftLanguageTier(current: LanguageTier, shift: DifficultyShift): LanguageTier {
  if (shift === 'up') return current === 'young' ? 'middle' : 'older';
  if (shift === 'down') return current === 'older' ? 'middle' : 'young';
  return current;
}

/** Returns inline styles for age bubble buttons — rainbow effect across ages 5–18. */
function getAgeBubbleStyle(age: number, isSelected: boolean): React.CSSProperties {
  const index = age - 5; // 0–13
  const hue = Math.round((index / 13) * 300); // red → violet
  if (isSelected) {
    return {
      background: `hsl(${hue}, 70%, 50%)`,
      color: 'white',
      borderColor: `hsl(${hue}, 70%, 38%)`,
      borderWidth: '2px',
      borderStyle: 'solid',
    };
  }
  return {
    background: `hsl(${hue}, 65%, 94%)`,
    color: `hsl(${hue}, 70%, 25%)`,
    borderColor: `hsl(${hue}, 50%, 72%)`,
    borderWidth: '2px',
    borderStyle: 'solid',
  };
}

function selectTheme(interests: string[]): ThemeName {
  const scores: Record<ThemeName, number> = { gaming: 0, sports: 0, animals: 0, space: 0 };
  for (const interest of interests) {
    const found = INTERESTS.find(i => i.label === interest);
    if (found) scores[found.theme]++;
  }
  const max = Math.max(...Object.values(scores));
  const winner = (Object.keys(scores) as ThemeName[]).find(k => scores[k] === max);
  return winner || 'gaming';
}

function shiftTier(current: GradeTier, shift: DifficultyShift): GradeTier {
  if (shift === 'up') return current === 'lower' ? 'middle' : 'upper';
  if (shift === 'down') return current === 'upper' ? 'middle' : 'lower';
  return current;
}

function evaluateReadingQuality(text: string): DifficultyShift {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  if (words >= 30 && sentences >= 2) return 'up';
  if (words >= 12) return 'same';
  return 'down';
}

function evaluateMathAnswer(text: string, expected: number): DifficultyShift {
  const nums = text.match(/-?\d+\.?\d*/g)?.map(Number) || [];
  for (const n of nums) {
    if (Math.abs(n - expected) < 0.05) return 'up';
  }
  const tol = Math.max(Math.abs(expected * 0.15), 1);
  for (const n of nums) {
    if (Math.abs(n - expected) <= tol) return 'same';
  }
  return 'down';
}

/* ─── Screen + act config ──────────────────────────────────────────────────────
   0  Welcome
   1  Name + Age
   2  Interests
   3  Gardner Part 1: Spatial / Musical / Kinesthetic
   4  Gardner Part 2: Interpersonal / Intrapersonal / Naturalistic
   5  EQ + Logic
   6  Reading Passage
   7  Reading Question
   8  Writing Assessment
   9  Math Q1
   10 Math Q2
   11 Processing
   12 Results
──────────────────────────────────────────────────────────────────────────────── */

const TOTAL_SCREENS = 13;
const ACT_MAP = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5];
const TOTAL_ACTS = 5;

/* ─── Voice utilities ─────────────────────────────────────────────────────────── */

function useTTS() {
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const stored = localStorage.getItem('tts_voice_uri');
    if (stored) {
      const v = window.speechSynthesis.getVoices().find(vv => vv.voiceURI === stored);
      if (v) utt.voice = v;
    }
    window.speechSynthesis.speak(utt);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}


/* Name safety check */
const BLOCKED_NAME_PATTERNS = [
  /\b(ass|damn|hell|shit|fuck|bitch|crap|dick|cock|pussy|bastard|slut|whore|fag|retard|kill|die|hate|stupid|dumb|idiot|loser)\b/i,
  /^(admin|teacher|god|satan|devil|test|null|undefined|root|system)$/i,
];

function isNameInappropriate(name: string): boolean {
  const cleaned = name.trim().toLowerCase();
  if (cleaned.length < 1 || cleaned.length > 30) return false;
  return BLOCKED_NAME_PATTERNS.some(p => p.test(cleaned));
}
/* ─── Main component ─────────────────────────────────────────────────────────── */

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [answers, setAnswers] = useState<StudentAnswers>(INITIAL_ANSWERS);
  const [readingTier, setReadingTier] = useState<GradeTier>('lower');
  const [mathTier, setMathTier] = useState<GradeTier>('lower');
  const [languageTier, setLanguageTier] = useState<LanguageTier>('middle');
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('gaming');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const [profileFirstName, setProfileFirstName] = useState('');

  const { speak, stop } = useTTS();

  // Fetch Supabase user on mount — personalize welcome + pre-populate name
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const firstName = fullName.split(' ')[0] || '';
          if (firstName) {
            setProfileFirstName(firstName);
            setAnswers(a => ({ ...a, name: a.name || firstName }));
          }
        }
      } catch {
        // silently ignore — name stays empty
      }
    };
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('tts_voice_uri') || '';
    setSelectedVoiceUri(stored);
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const currentAct = ACT_MAP[screen] || 1;

  const goNext = useCallback(() => {
    if (animating) return;
    stop();
    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setScreen(s => s + 1);
      setAnimating(false);
    }, 300);
  }, [animating, stop]);

  const goBack = useCallback(() => {
    if (animating || screen === 0) return;
    stop();
    setDirection('back');
    setAnimating(true);
    setTimeout(() => {
      setScreen(s => s - 1);
      setAnimating(false);
    }, 300);
  }, [animating, screen, stop]);

  // Set language tier immediately when age is selected
  useEffect(() => {
    if (answers.age !== null) {
      setLanguageTier(ageToLanguageTier(answers.age));
    }
  }, [answers.age]);

  // Compute theme + starting content tiers when entering Gardner screen
  useEffect(() => {
    if (screen === 3 && answers.interests.length > 0) {
      setSelectedTheme(selectTheme(answers.interests));
      const tier = ageToTier(answers.age ?? 10);
      setReadingTier(tier);
      setMathTier(tier);
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Shift content difficulty AND language tier based on reading response (entering writing screen)
  useEffect(() => {
    if (screen === 8 && answers.readingResponse) {
      const shift = evaluateReadingQuality(answers.readingResponse);
      setMathTier(t => shiftTier(t, shift));
      setLanguageTier(t => shiftLanguageTier(t, shift));
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Further refine language tier based on writing response (entering math)
  useEffect(() => {
    if (screen === 9 && answers.writingResponse) {
      const shift = evaluateReadingQuality(answers.writingResponse);
      setLanguageTier(t => shiftLanguageTier(t, shift));
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Adjust math tier based on Q1 (entering Q2)
  useEffect(() => {
    if (screen === 10 && answers.mathResponse1) {
      const q1 = THEMES[selectedTheme].mathQ1[mathTier];
      const shift = evaluateMathAnswer(answers.mathResponse1, q1.answer);
      setMathTier(t => shiftTier(t, shift));
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Processing screen — save and auto-advance
  useEffect(() => {
    if (screen !== 11) return;

    const theme = THEMES[selectedTheme];
    const tier = ageToTier(answers.age ?? 10);
    const q1 = theme.mathQ1[mathTier];
    const q2 = theme.mathQ2[mathTier];
    const logicQ = getLogicQuestion(tier);

    const gardnerSignals = computeGardnerSignals(answers, readingTier, mathTier);
    const logicLevel = evaluateLogic(answers.logicAnswer, tier);
    const mathShift1 = evaluateMathAnswer(answers.mathResponse1, q1.answer);
    const mathShift2 = evaluateMathAnswer(answers.mathResponse2, q2.answer);

    const profile = {
      student_name: answers.name,
      preferred_name: answers.name,
      name_flagged: isNameInappropriate(answers.name),
      age: answers.age,
      interests: answers.interests,
      other_interests: answers.otherInterests || null,
      theme: selectedTheme,
      reading_level: readingTier,
      math_level: mathTier,
      language_tier: languageTier,
      math_performance_q1: mathShift1,
      math_performance_q2: mathShift2,
      writing_response: answers.writingResponse,
      multiple_intelligences: gardnerSignals,
      logic_reasoning_level: logicLevel,
      logic_question: logicQ.question,
      logic_answer_given: answers.logicAnswer,
      emotional_intelligence_signals: {
        friend_response: answers.eqFriendResponse,
        self_response: answers.eqSelfResponse,
      },
      completed_at: new Date().toISOString(),
    };

    const save = async () => {
      setSaving(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from as any)('student_assessments').upsert(
            { student_id: user.id, ...profile },
            { onConflict: 'student_id' }
          );
        } else {
          localStorage.setItem('student_assessment', JSON.stringify(profile));
        }
      } catch {
        setSaveError(true);
        localStorage.setItem('student_assessment_backup', JSON.stringify(profile));
      } finally {
        setSaving(false);
      }
    };

    save();

    const timer = setTimeout(() => {
      setDirection('forward');
      setAnimating(true);
      setTimeout(() => {
        setScreen(12);
        setAnimating(false);
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  /* canAdvance */
  const canAdvance = (): boolean => {
    switch (screen) {
      case 0: return true;
      case 1: return answers.name.trim().length > 0 && answers.age !== null;
      case 2: return answers.interests.length >= 1;
      case 3:
        return (
          answers.musicalSignals.length > 0 ||
          answers.kinestheticSignals.length > 0 ||
          answers.spatialDescription.trim().length > 3
        );
      case 4:
        return answers.interpersonalStyle !== '' && answers.intrapersonalStrengths.trim().length > 2;
      case 5:
        return answers.logicAnswer.trim().length > 0 && answers.eqFriendResponse.trim().length >= 10;
      case 6: return true;
      case 7: return answers.readingResponse.trim().length >= 10;
      case 8: return answers.writingResponse.trim().length >= 20;
      case 9: return answers.mathResponse1.trim().length > 0;
      case 10: return answers.mathResponse2.trim().length > 0;
      default: return false;
    }
  };

  const slideClass = animating
    ? direction === 'forward' ? 'onb-slide-out-left' : 'onb-slide-out-right'
    : 'onb-slide-in';

  const theme = THEMES[selectedTheme];
  const ageTier = ageToTier(answers.age ?? 10);
  const logicQ = getLogicQuestion(ageTier);

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00F6ED]/20 dark:bg-teal/5 blob-teal" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#00F6ED]/15 dark:bg-gold/5 blob-gold" />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        {screen > 0 && screen < 11 ? (
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
        <div className="flex items-center gap-3">
          {screen > 0 && screen < 11 && (
            <button
              onClick={() => setShowVoicePicker(v => !v)}
              className="w-10 h-10 rounded-full bg-card-bg border border-border shadow-sm flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Voice settings"
            >
              <Gear size={18} weight="bold" />
            </button>
          )}
          <ThemeToggle className="w-10 h-10 rounded-full bg-card-bg border border-border shadow-sm z-50" />
        </div>
      </div>

      {/* Voice picker panel */}
      {showVoicePicker && (
        <div className="fixed top-16 right-6 z-50 w-72 bg-card-bg border border-border rounded-2xl shadow-2xl p-4 onb-card-in">
          <p className="font-heading font-semibold text-sm text-text-primary mb-3">Choose a voice</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {voices.length === 0 && (
              <p className="text-text-muted text-xs italic">No voices found. Try a different browser.</p>
            )}
            {voices.map(v => (
              <button
                key={v.voiceURI}
                onClick={() => {
                  localStorage.setItem('tts_voice_uri', v.voiceURI);
                  setSelectedVoiceUri(v.voiceURI);
                  speak(`Hi! I'm ${v.name}.`);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  selectedVoiceUri === v.voiceURI
                    ? 'bg-navy text-white dark:bg-teal dark:text-navy font-medium'
                    : 'hover:bg-border text-text-primary'
                }`}
              >
                {v.name} <span className="text-xs opacity-60">({v.lang})</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowVoicePicker(false)}
            className="mt-3 w-full py-2 rounded-lg bg-border text-text-secondary text-sm font-medium hover:bg-border/80 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Progress indicator */}
      {screen > 0 && screen < 11 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          {Array.from({ length: TOTAL_ACTS }, (_, i) => i + 1).map(act => (
            <div
              key={act}
              className={`h-2 rounded-full transition-all duration-500 ${
                act < currentAct ? 'w-8 bg-navy dark:bg-teal'
                : act === currentAct ? 'w-8 bg-navy/70 dark:bg-teal/70'
                : 'w-8 bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content area */}
      <div className={`relative z-10 min-h-screen flex items-center justify-center px-4 py-24 ${slideClass}`}>
        {screen === 0 && <WelcomeScreen onBegin={goNext} firstName={profileFirstName} />}
        {screen === 1 && (
          <NameAgeScreen
            name={answers.name}
            age={answers.age}
            onNameChange={v => setAnswers(a => ({ ...a, name: v }))}
            onAgeChange={v => setAnswers(a => ({ ...a, age: v }))}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {screen === 2 && (
          <InterestsScreen
            selected={answers.interests}
            otherInterests={answers.otherInterests}
            onOtherChange={v => setAnswers(a => ({ ...a, otherInterests: v }))}
            languageTier={languageTier}
            onToggle={interest => setAnswers(a => ({
              ...a,
              interests: a.interests.includes(interest)
                ? a.interests.filter(i => i !== interest)
                : [...a.interests, interest],
            }))}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {screen === 3 && (
          <GardnerScreen1
            interests={answers.interests}
            spatialDescription={answers.spatialDescription}
            musicalSignals={answers.musicalSignals}
            kinestheticSignals={answers.kinestheticSignals}
            languageTier={languageTier}
            onSpatialChange={v => setAnswers(a => ({ ...a, spatialDescription: v }))}
            onMusicToggle={key => setAnswers(a => ({
              ...a,
              musicalSignals: a.musicalSignals.includes(key)
                ? a.musicalSignals.filter(k => k !== key)
                : [...a.musicalSignals, key],
            }))}
            onKinesToggle={key => setAnswers(a => ({
              ...a,
              kinestheticSignals: a.kinestheticSignals.includes(key)
                ? a.kinestheticSignals.filter(k => k !== key)
                : [...a.kinestheticSignals, key],
            }))}
            onNext={goNext}
            canAdvance={canAdvance()}
            speak={speak}
          />
        )}
        {screen === 4 && (
          <GardnerScreen2
            interpersonalStyle={answers.interpersonalStyle}
            intrapersonalStrengths={answers.intrapersonalStrengths}
            intrapersonalGrowth={answers.intrapersonalGrowth}
            naturalisticSignal={answers.naturalisticSignal}
            languageTier={languageTier}
            onInterpersonalChange={v => setAnswers(a => ({ ...a, interpersonalStyle: v }))}
            onStrengthsChange={v => setAnswers(a => ({ ...a, intrapersonalStrengths: v }))}
            onGrowthChange={v => setAnswers(a => ({ ...a, intrapersonalGrowth: v }))}
            onNaturalisticChange={v => setAnswers(a => ({ ...a, naturalisticSignal: v }))}
            onNext={goNext}
            canAdvance={canAdvance()}
            speak={speak}
          />
        )}
        {screen === 5 && (
          <EQLogicScreen
            logicQuestion={logicQ}
            logicAnswer={answers.logicAnswer}
            eqFriendResponse={answers.eqFriendResponse}
            eqSelfResponse={answers.eqSelfResponse}
            languageTier={languageTier}
            onLogicChange={v => setAnswers(a => ({ ...a, logicAnswer: v }))}
            onFriendChange={v => setAnswers(a => ({ ...a, eqFriendResponse: v }))}
            onSelfChange={v => setAnswers(a => ({ ...a, eqSelfResponse: v }))}
            onNext={goNext}
            canAdvance={canAdvance()}
            speak={speak}
          />
        )}
        {screen === 6 && (
          <ReadingPassageScreen
            passage={theme.passage[readingTier]}
            studentName={answers.name}
            languageTier={languageTier}
            onNext={goNext}
            speak={speak}
          />
        )}
        {screen === 7 && (
          <ReadingQuestionScreen
            question={theme.readingQuestion[readingTier]}
            value={answers.readingResponse}
            languageTier={languageTier}
            onChange={v => setAnswers(a => ({ ...a, readingResponse: v }))}
            onNext={goNext}
            canAdvance={canAdvance()}
            speak={speak}
          />
        )}
        {screen === 8 && (
          <WritingScreen
            passage={theme.writingPassage}
            prompt={theme.writingPrompt}
            value={answers.writingResponse}
            languageTier={languageTier}
            onChange={v => setAnswers(a => ({ ...a, writingResponse: v }))}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {screen === 9 && (
          <MathScreen
            question={theme.mathQ1[mathTier].question}
            value={answers.mathResponse1}
            languageTier={languageTier}
            onChange={v => setAnswers(a => ({ ...a, mathResponse1: v }))}
            onNext={goNext}
            canAdvance={canAdvance()}
            speak={speak}
            questionNumber={1}
          />
        )}
        {screen === 10 && (
          <MathScreen
            question={theme.mathQ2[mathTier].question}
            value={answers.mathResponse2}
            languageTier={languageTier}
            onChange={v => setAnswers(a => ({ ...a, mathResponse2: v }))}
            onNext={goNext}
            canAdvance={canAdvance()}
            speak={speak}
            questionNumber={2}
          />
        )}
        {screen === 11 && <ProcessingScreen saving={saving} error={saveError} />}
        {screen === 12 && (
          <ResultsScreen
            name={answers.name}
            age={answers.age}
            interests={answers.interests}
            theme={selectedTheme}
            readingTier={readingTier}
            mathTier={mathTier}
            languageTier={languageTier}
            gardnerSignals={computeGardnerSignals(answers, readingTier, mathTier)}
            logicLevel={evaluateLogic(answers.logicAnswer, ageTier)}
            onContinue={() => {
              localStorage.setItem('teachinglabs_onboarded', 'true');
              router.push('/student/dashboard');
            }}
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
        @keyframes onbAgeBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.18); }
          100% { transform: scale(1.08); }
        }
        .onb-slide-in { animation: onbSlideInRight 0.35s ease-out both; }
        .onb-slide-out-left { animation: onbSlideOutLeft 0.3s ease-in both; }
        .onb-slide-out-right { animation: onbSlideOutRight 0.3s ease-in both; }
        .onb-fade-up { animation: onbFadeUp 0.5s ease-out both; }
        .onb-card-in { animation: onbCardIn 0.4s ease-out both; }
        .onb-pulse-glow { animation: onbPulseGlow 2.5s ease-in-out infinite; }
        .onb-dot-bounce { animation: onbDotBounce 1.4s ease-in-out infinite; }
        .onb-dot-bounce-1 { animation-delay: 0s; }
        .onb-dot-bounce-2 { animation-delay: 0.2s; }
        .onb-dot-bounce-3 { animation-delay: 0.4s; }
        .onb-age-selected { animation: onbAgeBounce 0.25s ease-out both; }
      `}</style>
    </div>
  );
}

/* ─── Shared: Coach bubble ────────────────────────────────────────────────────── */

function CoachBubble({ text, speak }: { text: string; speak?: (t: string) => void }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal to-navy flex items-center justify-center shadow-md">
        <ChatCircle size={22} weight="fill" className="text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-card-bg border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm relative">
          <p className="text-text-primary text-base leading-relaxed">{text}</p>
          {speak && (
            <button
              onClick={() => speak(text)}
              className="absolute -bottom-3 right-3 w-7 h-7 rounded-full bg-teal/20 hover:bg-teal/30 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Read aloud"
            >
              <SpeakerHigh size={14} weight="fill" className="text-teal" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared: Student answer bubble ───────────────────────────────────────────── */

function StudentBubble({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-3 mt-3 onb-fade-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center">
        <span className="text-sm">💬</span>
      </div>
      <div className="px-4 py-3 bg-teal/10 rounded-2xl rounded-tl-none border border-teal/20">
        <p className="text-navy dark:text-white text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}

/* ─── Shared: Voice input button ──────────────────────────────────────────────── */

function VoiceInputButton({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<unknown>(null);

  const toggle = () => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recRef.current as any)?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => { onResult(e.results[0][0].transcript as string); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all cursor-pointer ${
        listening
          ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500 animate-pulse'
          : 'border-border bg-card-bg/50 text-text-secondary hover:border-teal hover:text-teal'
      }`}
    >
      <Microphone size={16} weight="fill" />
      {listening ? 'Listening...' : 'Speak'}
    </button>
  );
}

/* ─── Shared: Next button ─────────────────────────────────────────────────────── */

function NextButton({ onNext, canAdvance, label = 'Continue' }: { onNext: () => void; canAdvance: boolean; label?: string }) {
  return (
    <div className="mt-7 flex justify-end onb-fade-up" style={{ animationDelay: '0.4s' }}>
      <button
        onClick={onNext}
        disabled={!canAdvance}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-semibold transition-all cursor-pointer ${
          canAdvance
            ? 'bg-navy text-white dark:bg-teal dark:text-navy hover:bg-navy/90 dark:hover:bg-teal/90 shadow-md hover:shadow-lg'
            : 'bg-border text-text-muted cursor-not-allowed'
        }`}
      >
        {label}
        <ArrowRight size={18} weight="bold" />
      </button>
    </div>
  );
}

/* ─── Screen 0: Welcome ───────────────────────────────────────────────────────── */

function WelcomeScreen({ onBegin, firstName }: { onBegin: () => void; firstName: string }) {
  return (
    <div className="max-w-xl mx-auto text-center px-2">
      <div className="onb-fade-up mb-8">
        <Image src="/images/logo-stacked-light.png" alt="Teaching Labs" width={160} height={80} className="mx-auto block dark:hidden" priority />
        <Image src="/images/logo-stacked-dark.png" alt="Teaching Labs" width={160} height={80} className="mx-auto hidden dark:block" priority />
      </div>
      <div className="onb-fade-up" style={{ animationDelay: '0.15s' }}>

        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal to-navy flex items-center justify-center shadow-lg onb-pulse-glow">
          <ChatCircle size={32} weight="fill" className="text-white" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3 leading-tight">
          {firstName ? `Hi ${firstName}! Welcome to the Learning Lab! 👋` : 'Hi there! Welcome to the Learning Lab! 👋'}
        </h1>
        <p className="text-text-secondary text-base leading-relaxed mb-6">
          I&apos;m your Teaching Labs Coach, here to help you get started!
        </p>
      </div>
      <div className="grid gap-3 mb-8 text-left">
        {[
          { icon: <SpeakerHigh size={20} weight="fill" className="text-teal" />, text: 'Tap the speaker icon to hear any question read aloud.' },
          { icon: <Microphone size={20} weight="fill" className="text-teal" />, text: 'Tap the mic button to talk your answers instead of typing.' },
          { icon: <Gear size={20} weight="fill" className="text-teal" />, text: 'Tap the gear icon at the top to choose a different voice.' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
            <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">{item.icon}</div>
            <p className="text-text-primary text-sm">{item.text}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onBegin}
        className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white dark:bg-teal dark:text-navy font-heading font-semibold text-lg rounded-full hover:bg-navy/90 dark:hover:bg-teal/90 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] onb-fade-up"
        style={{ animationDelay: '0.65s' }}
      >
        Let&apos;s Go!
        <Rocket size={22} weight="fill" />
      </button>
    </div>
  );
}

/* ─── Screen 1: Name + Age ────────────────────────────────────────────────────── */

function NameAgeScreen({
  name, age, onNameChange, onAgeChange, onNext, canAdvance,
}: {
  name: string; age: number | null;
  onNameChange: (v: string) => void; onAgeChange: (v: number) => void;
  onNext: () => void; canAdvance: boolean;
}) {
  return (
    <div className="max-w-lg mx-auto w-full">
      <CoachBubble text="What would you like me to call you? It can be your name, a nickname, whatever you go by! 😊" />
      <div className="space-y-6 onb-card-in" style={{ animationDelay: '0.1s' }}>
        {/* Name input */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">What should I call you?</label>
          <input
            type="text" value={name} onChange={e => onNameChange(e.target.value)}
            placeholder="Your name or nickname..." autoFocus
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors text-base"
          />
        </div>

        {/* Age selector */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-3">How old are you? 🎂</label>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {AGES.map(a => {
              const isSelected = age === a;
              return (
                <button
                  key={a}
                  onClick={() => onAgeChange(a)}
                  style={getAgeBubbleStyle(a, isSelected)}
                  className={`w-14 h-14 rounded-full font-bold text-xl transition-transform cursor-pointer flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 active:scale-95 ${isSelected ? 'onb-age-selected' : ''}`}
                  aria-label={a === 18 ? '18 or older' : `Age ${a}`}
                >
                  <span className="text-base font-bold leading-none">
                    {a === 18 ? '18+' : a}
                  </span>
                </button>
              );
            })}
          </div>
          {age !== null && (
            <p className="text-center text-text-muted text-xs mt-2">
              {age === 18 ? '18 or older' : `Age ${age}`} selected ✓
            </p>
          )}
        </div>
      </div>

      {name && age !== null && (
        <div className="mt-4 flex items-start gap-3 onb-fade-up">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center"><span>✨</span></div>
          <div className="px-4 py-3 bg-teal/10 rounded-2xl rounded-tl-none border border-teal/20">
            <p className="text-navy dark:text-white text-sm font-medium">Nice to meet you, {name}! 👋</p>
          </div>
        </div>
      )}
      <NextButton onNext={onNext} canAdvance={canAdvance} />
    </div>
  );
}

/* ─── Screen 2: Interests ─────────────────────────────────────────────────────── */

function InterestsScreen({
  selected, onToggle, otherInterests, onOtherChange, onNext, canAdvance, languageTier,
}: {
  selected: string[]; onToggle: (interest: string) => void;
  otherInterests: string; onOtherChange: (v: string) => void;
  onNext: () => void; canAdvance: boolean; languageTier: LanguageTier;
}) {
  const bubbleText = coachText(
    'What do you like? Pick everything! 🎉 This helps make learning FUN for you!',
    'What are you into? Pick as many as you like! This helps me make learning feel more like YOU.',
    'Pick what interests you. I\'ll use this to shape your learning experience.',
    languageTier,
  );

  return (
    <div className="max-w-2xl mx-auto w-full">
      <CoachBubble text={bubbleText} />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-5">
        {INTERESTS.map((item, i) => {
          const Icon = item.icon;
          const isSelected = selected.includes(item.label);
          return (
            <button
              key={item.label} onClick={() => onToggle(item.label)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer onb-card-in ${
                isSelected
                  ? 'border-navy dark:border-teal bg-navy/10 dark:bg-teal/10 shadow-md scale-[1.05]'
                  : 'border-border bg-card-bg/30 hover:border-teal/50'
              }`}
              style={{ animationDelay: `${0.05 + i * 0.04}s` }}
            >
              <Icon size={24} weight="fill" className={isSelected ? 'text-navy dark:text-teal' : 'text-text-secondary'} />
              <span className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-navy dark:text-teal' : 'text-text-secondary'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Other interests text field */}
      <div className="mt-4 mb-4">
        <label className="block text-text-secondary text-sm font-medium mb-2">
          {coachText(
            'Is there something else you love? Tell me! 💬',
            'Into something not listed? Tell me about it!',
            'Anything else you\'re into? I\'d like to know.',
            languageTier,
          )}
        </label>
        <textarea
          value={otherInterests}
          onChange={e => onOtherChange(e.target.value)}
          placeholder="I also really like..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors text-sm resize-none"
        />
      </div>
      {selected.length > 0 && (
        <StudentBubble text={selected.length === 1 ? `${selected[0]} — great choice!` : `${selected.length} things picked — awesome!`} />
      )}
      <NextButton onNext={onNext} canAdvance={canAdvance} label="These are my interests!" />
    </div>
  );
}

/* ─── Screen 3: Gardner Part 1 — How Your Brain Works ────────────────────────── */

function GardnerScreen1({
  interests, spatialDescription, musicalSignals, kinestheticSignals,
  onSpatialChange, onMusicToggle, onKinesToggle, onNext, canAdvance, speak, languageTier,
}: {
  interests: string[];
  spatialDescription: string; musicalSignals: string[]; kinestheticSignals: string[];
  onSpatialChange: (v: string) => void;
  onMusicToggle: (key: string) => void; onKinesToggle: (key: string) => void;
  onNext: () => void; canAdvance: boolean; speak: (t: string) => void;
  languageTier: LanguageTier;
}) {
  const spatialPrompt = getSpatialPrompt(interests);

  const bubbleText = coachText(
    'Everyone\'s brain works in a super cool way! 🧠 Tell me how YOU think best!',
    'Everyone\'s brain works differently — and that\'s a great thing! Tell me how YOU think best.',
    'Everyone processes information differently. Tell me about how you learn best.',
    languageTier,
  );

  return (
    <div className="max-w-xl mx-auto w-full">
      <CoachBubble text={bubbleText} speak={speak} />

      {/* Spatial */}
      <div className="mb-6 onb-card-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-2">
          <Brain size={18} weight="fill" className="text-teal" />
          <p className="text-text-primary font-medium text-sm">{spatialPrompt}</p>
        </div>
        <textarea
          value={spatialDescription}
          onChange={e => { if (e.target.value.length <= 1000) onSpatialChange(e.target.value); }}
          placeholder="Describe it — as wild or as detailed as you want!"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors resize-none overflow-y-auto text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1">
          <VoiceInputButton onResult={text => onSpatialChange(spatialDescription ? `${spatialDescription} ${text}` : text)} />
          <span className="text-xs text-text-muted">{spatialDescription.length} / 1000</span>
        </div>
        <p className="text-xs text-teal/70 mt-1.5 italic">The more you share, the more I get to know you! ✨</p>
        {spatialDescription.trim().length > 0 && (
          spatialDescription.length > 200
            ? <StudentBubble text="Wow, you had a lot to say! 🤩" />
            : <StudentBubble text={spatialDescription} />
        )}
      </div>

      {/* Musical */}
      <div className="mb-6 onb-card-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-3">
          <MusicNotes size={18} weight="fill" className="text-teal" />
          <p className="text-text-primary font-medium text-sm">What&apos;s true for you about music? Pick everything that fits!</p>
        </div>
        <div className="flex flex-col gap-2">
          {MUSICAL_OPTIONS.map(opt => {
            const isSelected = musicalSignals.includes(opt.key);
            return (
              <button
                key={opt.key} onClick={() => onMusicToggle(opt.key)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal bg-teal/10 text-navy dark:text-teal shadow-sm'
                    : 'border-border bg-card-bg/30 text-text-secondary hover:border-teal/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kinesthetic */}
      <div className="mb-2 onb-card-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkle size={18} weight="fill" className="text-teal" />
          <p className="text-text-primary font-medium text-sm">How do YOU learn new things best? Pick all that feel right!</p>
        </div>
        <div className="flex flex-col gap-2">
          {KINESTHETIC_OPTIONS.map(opt => {
            const isSelected = kinestheticSignals.includes(opt.key);
            return (
              <button
                key={opt.key} onClick={() => onKinesToggle(opt.key)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal bg-teal/10 text-navy dark:text-teal shadow-sm'
                    : 'border-border bg-card-bg/30 text-text-secondary hover:border-teal/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <NextButton onNext={onNext} canAdvance={canAdvance} />
    </div>
  );
}

/* ─── Screen 4: Gardner Part 2 — You & Others ────────────────────────────────── */

function GardnerScreen2({
  interpersonalStyle, intrapersonalStrengths, intrapersonalGrowth, naturalisticSignal,
  onInterpersonalChange, onStrengthsChange, onGrowthChange, onNaturalisticChange,
  onNext, canAdvance, speak, languageTier,
}: {
  interpersonalStyle: string; intrapersonalStrengths: string;
  intrapersonalGrowth: string; naturalisticSignal: string;
  onInterpersonalChange: (v: string) => void; onStrengthsChange: (v: string) => void;
  onGrowthChange: (v: string) => void; onNaturalisticChange: (v: string) => void;
  onNext: () => void; canAdvance: boolean; speak: (t: string) => void;
  languageTier: LanguageTier;
}) {
  const bubbleText = coachText(
    'Let\'s keep going! 🌟 Tell me about working with friends — and about YOU!',
    'Let\'s keep going! Tell me a little about how you work with others — and how you see yourself.',
    'Let\'s keep going. How do you work with others, and what do you know about yourself?',
    languageTier,
  );

  return (
    <div className="max-w-xl mx-auto w-full">
      <CoachBubble text={bubbleText} speak={speak} />

      {/* Interpersonal */}
      <div className="mb-5 onb-card-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-3">
          <UsersThree size={18} weight="fill" className="text-teal" />
          <p className="text-text-primary font-medium text-sm">When you&apos;re working on something tricky, you prefer:</p>
        </div>
        <div className="grid gap-2">
          {INTERPERSONAL_OPTIONS.map(opt => (
            <button
              key={opt.key} onClick={() => onInterpersonalChange(opt.key)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                interpersonalStyle === opt.key
                  ? 'border-navy dark:border-teal bg-navy/10 dark:bg-teal/10 text-navy dark:text-teal shadow-sm'
                  : 'border-border bg-card-bg/30 text-text-secondary hover:border-teal/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intrapersonal */}
      <div className="mb-5 onb-card-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-3">
          <UserCircle size={18} weight="fill" className="text-teal" />
          <p className="text-text-primary font-medium text-sm">Tell me a little about YOU:</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs mb-1 block">What&apos;s something you&apos;re really good at?</label>
            <textarea
              value={intrapersonalStrengths}
              onChange={e => { if (e.target.value.length <= 1000) onStrengthsChange(e.target.value); }}
              placeholder="e.g., drawing, making people laugh, remembering facts..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors resize-none overflow-y-auto text-sm"
            />
            <div className="flex items-center justify-between mt-1">
              <VoiceInputButton onResult={text => onStrengthsChange(intrapersonalStrengths ? `${intrapersonalStrengths} ${text}` : text)} />
              <span className="text-xs text-text-muted">{intrapersonalStrengths.length} / 1000</span>
            </div>
            <p className="text-xs text-teal/70 mt-1 italic">The more you share, the more I get to know you! ✨</p>
          </div>
          <div>
            <label className="text-text-secondary text-xs mb-1 block">What&apos;s one thing you want to get better at?</label>
            <textarea
              value={intrapersonalGrowth}
              onChange={e => { if (e.target.value.length <= 1000) onGrowthChange(e.target.value); }}
              placeholder="e.g., math, being more patient, public speaking..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors resize-none overflow-y-auto text-sm"
            />
            <div className="flex items-center justify-between mt-1">
              <VoiceInputButton onResult={text => onGrowthChange(intrapersonalGrowth ? `${intrapersonalGrowth} ${text}` : text)} />
              <span className="text-xs text-text-muted">{intrapersonalGrowth.length} / 1000</span>
            </div>
            <p className="text-xs text-teal/70 mt-1 italic">The more you share, the more I get to know you! ✨</p>
          </div>
        </div>
      </div>

      {/* Naturalistic */}
      <div className="mb-2 onb-card-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Leaf size={18} weight="fill" className="text-teal" />
          <p className="text-text-primary font-medium text-sm">How much do you enjoy being outside in nature?</p>
        </div>
        <div className="grid gap-2">
          {NATURALISTIC_OPTIONS.map(opt => (
            <button
              key={opt.key} onClick={() => onNaturalisticChange(opt.key)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                naturalisticSignal === opt.key
                  ? 'border-navy dark:border-teal bg-navy/10 dark:bg-teal/10 text-navy dark:text-teal shadow-sm'
                  : 'border-border bg-card-bg/30 text-text-secondary hover:border-teal/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <NextButton onNext={onNext} canAdvance={canAdvance} />
    </div>
  );
}

/* ─── Screen 5: EQ + Logic ────────────────────────────────────────────────────── */

function EQLogicScreen({
  logicQuestion, logicAnswer, eqFriendResponse, eqSelfResponse,
  onLogicChange, onFriendChange, onSelfChange,
  onNext, canAdvance, speak, languageTier,
}: {
  logicQuestion: LogicQuestion;
  logicAnswer: string; eqFriendResponse: string; eqSelfResponse: string;
  onLogicChange: (v: string) => void; onFriendChange: (v: string) => void; onSelfChange: (v: string) => void;
  onNext: () => void; canAdvance: boolean; speak: (t: string) => void;
  languageTier: LanguageTier;
}) {
  const introBubble = coachText(
    'Time for some brain teasers! 🧩 Think out loud — there are NO wrong answers!',
    'Two of my favorite kinds of questions — think out loud! There are no wrong answers here.',
    'A couple of questions to see how you think. No right or wrong answers — just be real.',
    languageTier,
  );
  const friendBubble = coachText(
    'Your friend didn\'t get picked for the team they really wanted. What would you say to them? 🤗',
    'Your friend didn\'t get picked for the team they really wanted to be on. What would you say to them?',
    'Your friend didn\'t make the team they were hoping for. What do you say to them?',
    languageTier,
  );
  const selfBubble = coachText(
    'You worked super hard on something, but it didn\'t go the way you hoped. How do you feel? What do you do next? 💪',
    'You worked really hard on something, but it didn\'t turn out the way you hoped. How does that make you feel — and what do you do next?',
    'You put real effort into something and it still didn\'t work out. What\'s your response to that?',
    languageTier,
  );

  return (
    <div className="max-w-xl mx-auto w-full">
      <CoachBubble text={introBubble} speak={speak} />

      {/* Logic puzzle */}
      <div className="mb-6 onb-card-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-indigo/5 dark:bg-teal/5 border border-indigo/20 dark:border-teal/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} weight="fill" className="text-indigo dark:text-teal" />
            <p className="text-xs font-heading font-semibold text-indigo dark:text-teal uppercase tracking-wider">Quick puzzle</p>
          </div>
          <p className="text-text-primary font-medium text-base mb-3">{logicQuestion.question}</p>
          <input
            type="text" value={logicAnswer}
            onChange={e => onLogicChange(e.target.value)}
            placeholder="Your answer..."
            autoFocus
            className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors text-base"
          />
          <p className="text-text-muted text-xs mt-2 italic">{logicQuestion.hint}</p>
        </div>
      </div>

      {/* EQ: Friend scenario */}
      <div className="mb-5 onb-card-in" style={{ animationDelay: '0.2s' }}>
        <CoachBubble text={friendBubble} speak={speak} />
        <textarea
          value={eqFriendResponse}
          onChange={e => { if (e.target.value.length <= 1000) onFriendChange(e.target.value); }}
          placeholder="What would you actually say to your friend?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors resize-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1">
          <VoiceInputButton onResult={text => onFriendChange(eqFriendResponse ? `${eqFriendResponse} ${text}` : text)} />
          <span className="text-xs text-text-muted">{eqFriendResponse.length} / 1000</span>
        </div>
      </div>

      {/* EQ: Self scenario (optional) */}
      <div className="mb-2 onb-card-in" style={{ animationDelay: '0.3s' }}>
        <CoachBubble text={selfBubble} speak={speak} />
        <textarea
          value={eqSelfResponse}
          onChange={e => { if (e.target.value.length <= 1000) onSelfChange(e.target.value); }}
          placeholder="Be honest — there's no right or wrong answer! (Optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors resize-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1">
          <VoiceInputButton onResult={text => onSelfChange(eqSelfResponse ? `${eqSelfResponse} ${text}` : text)} />
          <span className="text-xs text-text-muted">{eqSelfResponse.length} / 1000</span>
        </div>
      </div>

      <NextButton onNext={onNext} canAdvance={canAdvance} />
    </div>
  );
}

/* ─── Screen 6: Reading Passage ───────────────────────────────────────────────── */

function ReadingPassageScreen({
  passage, studentName, onNext, speak, languageTier,
}: {
  passage: string; studentName: string; onNext: () => void; speak: (t: string) => void;
  languageTier: LanguageTier;
}) {
  const introBubble = coachText(
    `${studentName ? `Hey ${studentName}!` : 'Hey!'} Here's something cool to read! 📖 Take your time — no rush!`,
    `${studentName ? `Hey ${studentName}!` : 'Hey!'} I found something interesting for you to read. Take your time — there's no rush!`,
    `${studentName ? `${studentName},` : ''} here's a passage for you. Take your time with it.`.trim(),
    languageTier,
  );
  const continueBubble = coachText(
    'When you\'re done reading, hit continue and I\'ll ask you about it! 🎯',
    'When you\'re ready, hit continue and I\'ll ask you a quick question about it!',
    'When you\'re done, continue and I\'ll ask you a question about it.',
    languageTier,
  );

  return (
    <div className="max-w-xl mx-auto w-full">
      <CoachBubble text={introBubble} speak={speak} />
      <div className="onb-card-in mb-6" style={{ animationDelay: '0.15s' }}>
        <div className="bg-card-bg border-2 border-border rounded-2xl p-5 shadow-sm relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <button onClick={() => speak(passage)} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-teal transition-colors cursor-pointer">
              <SpeakerHigh size={14} weight="fill" /> Listen
            </button>
          </div>
          <p className="text-text-primary text-base leading-[1.75]">{passage}</p>
        </div>
      </div>
      <CoachBubble text={continueBubble} />
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy text-white dark:bg-teal dark:text-navy font-heading font-semibold hover:bg-navy/90 dark:hover:bg-teal/90 transition-all cursor-pointer shadow-md hover:shadow-lg"
        >
          I&apos;ve read it! <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 7: Reading Question ──────────────────────────────────────────────── */

function ReadingQuestionScreen({
  question, value, onChange, onNext, canAdvance, speak, languageTier,
}: {
  question: string; value: string; onChange: (v: string) => void;
  onNext: () => void; canAdvance: boolean; speak: (t: string) => void;
  languageTier: LanguageTier;
}) {
  // The question itself comes from the content bank (already tier-appropriate by readingTier).
  // We wrap it with a warm age-appropriate lead-in.
  const leadIn = coachText(
    'Here\'s my question — just tell me what you think! 🙌',
    '',
    '',
    languageTier,
  );
  const displayText = leadIn ? `${leadIn} ${question}` : question;

  return (
    <div className="max-w-xl mx-auto w-full">
      <CoachBubble text={displayText} speak={speak} />
      <div className="onb-card-in" style={{ animationDelay: '0.1s' }}>
        <textarea
          value={value}
          onChange={e => { if (e.target.value.length <= 1000) onChange(e.target.value); }}
          placeholder="Type your answer here..." rows={4} autoFocus
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors resize-none overflow-y-auto text-base leading-relaxed"
        />
        <div className="flex items-center justify-between mt-2">
          <VoiceInputButton onResult={text => onChange(value ? `${value} ${text}` : text)} />
          <span className="text-xs text-text-muted">{value.length} / 1000</span>
        </div>
      </div>
      {value.length >= 20 && <StudentBubble text={value} />}
      <NextButton onNext={onNext} canAdvance={canAdvance} />
    </div>
  );
}

/* ─── Screen 8: Writing Assessment ───────────────────────────────────────────── */

function WritingScreen({
  passage, prompt, value, onChange, onNext, canAdvance, languageTier,
}: {
  passage: string; prompt: string; value: string; onChange: (v: string) => void;
  onNext: () => void; canAdvance: boolean; languageTier: LanguageTier;
}) {
  const introBubble = coachText(
    'Here\'s a fun one! 🎉 Read the short paragraph below and tell me what YOU think! Type your answer this time!',
    'Here\'s something fun! For this one, read the paragraph below and type what you think. No voice input on this one — I want to see your writing!',
    'Read the passage below and share your perspective in writing. I want to see how you express your thinking on paper.',
    languageTier,
  );

  return (
    <div className="max-w-xl mx-auto w-full">
      <CoachBubble text={introBubble} />
      <div className="onb-card-in mb-5" style={{ animationDelay: '0.1s' }}>
        <div className="bg-indigo/5 dark:bg-teal/5 border border-indigo/20 dark:border-teal/20 rounded-xl p-4">
          <p className="text-xs font-heading font-semibold text-indigo dark:text-teal uppercase tracking-wider mb-2">Read this:</p>
          <p className="text-text-primary text-sm leading-[1.75]">{passage}</p>
        </div>
      </div>
      <CoachBubble text={prompt} />
      <div className="onb-card-in" style={{ animationDelay: '0.25s' }}>
        <p className="text-xs text-text-muted italic mb-2">For this one, read and type your answer.</p>
        <textarea
          value={value}
          onChange={e => { if (e.target.value.length <= 1000) onChange(e.target.value); }}
          placeholder="Write what you think here..." rows={5} autoFocus
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors resize-none overflow-y-auto text-base leading-relaxed"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-text-muted">{value.length} / 1000</span>
        </div>
      </div>
      <NextButton onNext={onNext} canAdvance={canAdvance} />
    </div>
  );
}

/* ─── Screens 9–10: Math ──────────────────────────────────────────────────────── */

function MathScreen({
  question, value, onChange, onNext, canAdvance, speak, questionNumber, languageTier,
}: {
  question: string; value: string; onChange: (v: string) => void;
  onNext: () => void; canAdvance: boolean; speak: (t: string) => void;
  questionNumber: number; languageTier: LanguageTier;
}) {
  const intro = questionNumber === 1
    ? coachText(
        'Here\'s a quick math puzzle for you! 🔢',
        'Here\'s a quick puzzle for you —',
        'Here\'s a problem for you —',
        languageTier,
      )
    : coachText(
        'One more! You\'re almost done! 🌟',
        'One more — think it through!',
        'Last one. Take your time.',
        languageTier,
      );

  return (
    <div className="max-w-xl mx-auto w-full">
      <CoachBubble text={`${intro} ${question}`} speak={speak} />
      <div className="onb-card-in" style={{ animationDelay: '0.1s' }}>
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder="Type your answer..." autoFocus
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card-bg/30 text-text-primary placeholder:text-text-muted/50 focus:border-teal focus:outline-none transition-colors text-base"
        />
        <div className="flex items-center justify-between mt-2">
          <VoiceInputButton onResult={text => onChange(text)} />
          <p className="text-xs text-text-muted italic">You can type a number or explain your thinking</p>
        </div>
      </div>
      {value.trim().length > 0 && <StudentBubble text={value} />}
      <NextButton onNext={onNext} canAdvance={canAdvance} />
    </div>
  );
}

/* ─── Screen 11: Processing ───────────────────────────────────────────────────── */

function ProcessingScreen({ saving, error }: { saving: boolean; error: boolean }) {
  const icons = [Rocket, Star, BookOpen, Calculator, MusicNotes, Brain];
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-teal to-navy flex items-center justify-center onb-pulse-glow">
        <ChatCircle size={40} weight="fill" className="text-white" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">Learning about you...</h2>
      <p className="text-text-muted text-sm mb-6">Building your personal learning profile!</p>
      <div className="flex items-center justify-center gap-3 mb-8">
        {icons.map((Icon, i) => (
          <div key={i} className="w-10 h-10 rounded-full bg-card-bg border border-border flex items-center justify-center onb-dot-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
            <Icon size={18} weight="fill" className="text-teal" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="w-3 h-3 rounded-full bg-indigo dark:bg-teal onb-dot-bounce onb-dot-bounce-1" />
        <div className="w-3 h-3 rounded-full bg-indigo dark:bg-teal onb-dot-bounce onb-dot-bounce-2" />
        <div className="w-3 h-3 rounded-full bg-indigo dark:bg-teal onb-dot-bounce onb-dot-bounce-3" />
      </div>
      {saving && <p className="text-text-muted text-xs mt-4 italic">Saving your profile...</p>}
      {error && <p className="text-text-muted text-xs mt-4 italic">Don&apos;t worry — everything is saved locally.</p>}
    </div>
  );
}

/* ─── Screen 12: Results ──────────────────────────────────────────────────────── */

function ResultsScreen({
  name, age, interests, theme, readingTier, mathTier, languageTier,
  gardnerSignals, logicLevel, onContinue,
}: {
  name: string; age: number | null; interests: string[]; theme: ThemeName;
  readingTier: GradeTier; mathTier: GradeTier; languageTier: LanguageTier;
  gardnerSignals: Record<string, GardnerSignal | string[] | string>;
  logicLevel: GardnerSignal;
  onContinue: () => void;
}) {
  const themeLabels: Record<ThemeName, string> = {
    gaming: 'Gaming & Technology', sports: 'Sports & Movement',
    animals: 'Animals & Nature', space: 'Science & Space',
  };
  const tierLabels: Record<GradeTier, string> = {
    lower: 'Building Strong Foundations',
    middle: 'Expanding Your Skills',
    upper: 'Advanced Explorer',
  };
  const signalLabels: Record<GardnerSignal, string> = {
    strong: 'Strong', developing: 'Developing', emerging: 'Emerging',
  };

  const ageLabel = age === 18 ? '18+' : age !== null ? `${age}` : '';

  const heading = coachText(
    `Here's what I learned about you${name ? `, ${name}` : ''}! 🎉🌟`,
    `Here's what I learned about you${name ? `, ${name}` : ''}! 🎉`,
    `Your Learning Profile${name ? ` — ${name}` : ''}`,
    languageTier,
  );

  const subheading = coachText(
    'I\'m going to make learning super fun for you! 🚀',
    'I\'m going to make learning awesome for you!',
    'Your experience will be tailored to your level and learning style.',
    languageTier,
  );

  const coachMessage = coachText(
    `You did AMAZING${name ? `, ${name}` : ''}! 🌟 I can\'t wait to make your lessons super fun!`,
    `You're all set${name ? `, ${name}` : ''}! I'll use everything I've learned to make your lessons feel interesting and just right for you. Let's start learning!`,
    `You're all set${name ? `, ${name}` : ''}. I've built a learning profile based on your answers. Your lessons will be personalized to your level and learning style.`,
    languageTier,
  );

  // Highlight the top Gardner signals (strong ones)
  const gardnerHighlights: string[] = [];
  const gardnerLabelMap: Record<string, string> = {
    spatial: 'Picture Smart', musical: 'Music Smart',
    bodily_kinesthetic: 'Hands-On Learner', interpersonal: 'People Smart',
    intrapersonal: 'Self Aware', naturalistic: 'Nature Smart',
  };

  for (const [key, val] of Object.entries(gardnerSignals)) {
    if (key in gardnerLabelMap && val === 'strong') {
      gardnerHighlights.push(gardnerLabelMap[key]);
    }
  }
  if (gardnerHighlights.length === 0) {
    for (const [key, val] of Object.entries(gardnerSignals)) {
      if (key in gardnerLabelMap && val === 'developing') {
        gardnerHighlights.push(gardnerLabelMap[key]);
        if (gardnerHighlights.length >= 2) break;
      }
    }
  }

  const topInterests = interests.slice(0, 4);

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="text-center mb-8 onb-fade-up">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal to-navy flex items-center justify-center onb-pulse-glow">
          <ChatCircle size={36} weight="fill" className="text-white" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-1">{heading}</h2>
        <p className="text-text-secondary text-base">{subheading}</p>
      </div>

      <div className="grid gap-3 mb-6">
        {/* Age */}
        {ageLabel && (
          <div className="p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in" style={{ animationDelay: '0.05s' }}>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-heading">Your Age</p>
            <p className="text-text-primary font-semibold">{ageLabel} years old</p>
          </div>
        )}

        {/* Learning theme */}
        <div className="p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-heading">Your Learning Theme</p>
          <p className="text-text-primary font-semibold">{themeLabels[theme]}</p>
        </div>

        {/* Academic levels */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-heading">Reading & Writing</p>
            <p className="text-text-primary font-semibold text-sm">{tierLabels[readingTier]}</p>
          </div>
          <div className="p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in" style={{ animationDelay: '0.25s' }}>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-heading">Math & Logic</p>
            <p className="text-text-primary font-semibold text-sm">{tierLabels[mathTier]}</p>
            <p className="text-text-muted text-xs mt-0.5">Reasoning: {signalLabels[logicLevel]}</p>
          </div>
        </div>

        {/* Gardner highlights */}
        {gardnerHighlights.length > 0 && (
          <div className="p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in" style={{ animationDelay: '0.35s' }}>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-2 font-heading">Your Learning Superpowers</p>
            <div className="flex flex-wrap gap-2">
              {gardnerHighlights.map(label => (
                <span key={label} className="px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-navy dark:text-teal text-sm font-medium">
                  ⚡ {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {topInterests.length > 0 && (
          <div className="p-4 rounded-xl bg-card-bg/50 border border-border/50 onb-card-in" style={{ animationDelay: '0.45s' }}>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-2 font-heading">Your Interests</p>
            <div className="flex flex-wrap gap-2">
              {topInterests.map(interest => (
                <span key={interest} className="px-3 py-1 rounded-full bg-navy/10 dark:bg-teal/10 text-navy dark:text-teal text-sm font-medium border border-navy/20 dark:border-teal/20">
                  {interest}
                </span>
              ))}
              {interests.length > 4 && (
                <span className="px-3 py-1 rounded-full bg-border text-text-muted text-sm">+{interests.length - 4} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <CoachBubble text={coachMessage} />

      <div className="mt-6 text-center onb-fade-up" style={{ animationDelay: '0.7s' }}>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white dark:bg-teal dark:text-navy font-heading font-semibold text-base rounded-full hover:bg-navy/90 dark:hover:bg-teal/90 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          Go to My Dashboard <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
