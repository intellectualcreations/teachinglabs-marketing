/**
 * Learning Superpower System
 * Maps Gardner MI results to superpower titles.
 */

export type Intelligence =
  | 'linguistic'
  | 'logical_mathematical'
  | 'spatial'
  | 'musical'
  | 'bodily_kinesthetic'
  | 'interpersonal'
  | 'intrapersonal'
  | 'naturalistic';

export const SUPERPOWER_TITLES: Record<Intelligence, string[]> = {
  linguistic: ['The Storyteller', 'The Word Wizard', 'The Author', 'The Poet'],
  logical_mathematical: ['The Strategist', 'The Code Breaker', 'The Problem Solver', 'The Analyst'],
  spatial: ['The Architect', 'The Designer', 'The Visionary', 'The Creator'],
  musical: ['The Composer', 'The Rhythm Master', 'The Sound Crafter', 'The Maestro'],
  bodily_kinesthetic: ['The Explorer', 'The Athlete', 'The Builder', 'The Adventurer'],
  interpersonal: ['The Leader', 'The Diplomat', 'The Team Captain', 'The Connector'],
  intrapersonal: ['The Philosopher', 'The Mind Master', 'The Deep Thinker', 'The Sage'],
  naturalistic: ['The Ranger', 'The Nature Guardian', 'The Earth Scientist', 'The Wildlife Expert'],
};

export const INTELLIGENCE_LABELS: Record<Intelligence, string> = {
  linguistic: 'Word Smart',
  logical_mathematical: 'Number Smart',
  spatial: 'Picture Smart',
  musical: 'Music Smart',
  bodily_kinesthetic: 'Body Smart',
  interpersonal: 'People Smart',
  intrapersonal: 'Self Smart',
  naturalistic: 'Nature Smart',
};

export const INTELLIGENCE_DESCRIPTIONS: Record<Intelligence, string> = {
  linguistic: 'You think in words and stories. Language is your superpower — you can express ideas, persuade, and create with words like a pro.',
  logical_mathematical: 'You think in patterns and logic. Numbers, puzzles, and strategies light up your brain like nothing else.',
  spatial: 'You think in pictures and space. You can visualize, design, and build things in your mind before they exist.',
  musical: 'You think in rhythms and melodies. Sound patterns, music, and beats are your natural language.',
  bodily_kinesthetic: 'You think through movement and touch. Your body is smart — you learn by doing, building, and exploring physically.',
  interpersonal: 'You think through connections with others. Reading people, leading groups, and collaborating are your natural strengths.',
  intrapersonal: 'You think deeply about yourself and the world. Self-awareness, reflection, and understanding your own mind are your gifts.',
  naturalistic: 'You think through patterns in nature. The natural world speaks to you — animals, plants, ecosystems, and the outdoors are where you thrive.',
};

export const INTELLIGENCE_EMOJIS: Record<Intelligence, string> = {
  linguistic: '📖',
  logical_mathematical: '🧮',
  spatial: '🏗️',
  musical: '🎵',
  bodily_kinesthetic: '🏃',
  interpersonal: '🤝',
  intrapersonal: '🧠',
  naturalistic: '🌿',
};

/**
 * Determine primary intelligence from Gardner MI signals.
 * Scoring: strong=3, developing/upper=2.5, middle=2, emerging/lower=1
 */
export function determinePrimaryIntelligence(
  mi: Record<string, string | string[]>
): Intelligence {
  const scoreMap: Record<string, number> = {
    strong: 3,
    upper: 2.5,
    developing: 2,
    middle: 2,
    emerging: 1,
    lower: 1,
  };

  const intelligences: Intelligence[] = [
    'linguistic',
    'logical_mathematical',
    'spatial',
    'musical',
    'bodily_kinesthetic',
    'interpersonal',
    'intrapersonal',
    'naturalistic',
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

/**
 * Get the default title (first option) for an intelligence.
 */
export function getDefaultTitle(intelligence: Intelligence): string {
  return SUPERPOWER_TITLES[intelligence][0];
}
