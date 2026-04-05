import * as Icons from '@phosphor-icons/react';
import { detectSubject } from '@/lib/constants';

interface ClassIconProps {
  name: string;
  icon?: string | null;
  size?: number;
  iconSize?: number;
}

// Map string icon names to Phosphor components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.ComponentType<any>> = {
  MathOperations: Icons.MathOperations,
  Calculator: Icons.Calculator,
  Ruler: Icons.Ruler,
  ChartBar: Icons.ChartBar,
  BookOpenText: Icons.BookOpenText,
  Article: Icons.Article,
  Flask: Icons.Flask,
  TestTube: Icons.TestTube,
  Dna: Icons.Dna,
  Planet: Icons.Planet,
  GlobeHemisphereWest: Icons.GlobeHemisphereWest,
  Bank: Icons.Bank,
  MapTrifold: Icons.MapTrifold,
  PencilLine: Icons.PencilLine,
  Palette: Icons.Palette,
  MusicNotes: Icons.MusicNotes,
  Desktop: Icons.Desktop,
  Translate: Icons.Translate,
  ChatsCircle: Icons.ChatsCircle,
  Basketball: Icons.Basketball,
  PersonSimpleRun: Icons.PersonSimpleRun,
  Books: Icons.Books,
  MasksTheater: Icons.MaskHappy,
  Heartbeat: Icons.Heartbeat,
  Leaf: Icons.Leaf,
  Robot: Icons.Robot,
  HouseLine: Icons.HouseLine,
  Star: Icons.Star,
};

// Map database icon values (e.g. 'math', 'reading') to Phosphor components + colors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbIconMap: Record<string, { component: React.ComponentType<any>, bg: string }> = {
  math: { component: Icons.MathOperations, bg: '#1F3A5F' },
  reading: { component: Icons.BookOpenText, bg: '#4FA3A5' },
  science: { component: Icons.Flask, bg: '#7C3AED' },
  social: { component: Icons.GlobeHemisphereWest, bg: '#0891B2' },
  writing: { component: Icons.PencilLine, bg: '#E8836B' },
  art: { component: Icons.Palette, bg: '#EC4899' },
  music: { component: Icons.MusicNotes, bg: '#8B5CF6' },
  cs: { component: Icons.Desktop, bg: '#334155' },
  algebra: { component: Icons.Calculator, bg: '#1F3A5F' },
  ela: { component: Icons.Article, bg: '#4FA3A5' },
  chem: { component: Icons.TestTube, bg: '#059669' },
  astro: { component: Icons.Planet, bg: '#6366F1' },
  bio: { component: Icons.Dna, bg: '#10B981' },
  stats: { component: Icons.ChartBar, bg: '#F59E0B' },
  history: { component: Icons.Bank, bg: '#92400E' },
  geo: { component: Icons.MapTrifold, bg: '#0D9488' },
  spanish: { component: Icons.Translate, bg: '#DC2626' },
  french: { component: Icons.ChatsCircle, bg: '#2563EB' },
  pe: { component: Icons.Basketball, bg: '#EA580C' },
  fitness: { component: Icons.PersonSimpleRun, bg: '#D97706' },
  library: { component: Icons.Books, bg: '#7C3AED' },
  drama: { component: Icons.MaskHappy, bg: '#BE185D' },
  health: { component: Icons.Heartbeat, bg: '#DC2626' },
  env: { component: Icons.Leaf, bg: '#059669' },
  robotics: { component: Icons.Robot, bg: '#475569' },
  geometry: { component: Icons.Ruler, bg: '#1F3A5F' },
  focus: { component: Icons.Target, bg: '#E8836B' },
  ideas: { component: Icons.Lightbulb, bg: '#F59E0B' },
  star: { component: Icons.Star, bg: '#4FA3A5' },
  homeroom: { component: Icons.HouseLine, bg: '#64748B' },
};

export default function ClassIcon({ name, icon: iconVal, size = 36, iconSize }: ClassIconProps) {
  // If a database icon value is provided, use it directly
  if (iconVal && dbIconMap[iconVal]) {
    const entry = dbIconMap[iconVal];
    const iSize = iconSize || Math.round(size * 0.5);
    return (
      <div
        className="rounded-lg flex items-center justify-center shrink-0"
        style={{ width: size, height: size, backgroundColor: entry.bg }}
      >
        <entry.component size={iSize} weight="fill" color="white" />
      </div>
    );
  }

  // Fallback: lightbulb when no icon set
  if (!iconVal) {
    const iSize = iconSize || Math.round(size * 0.5);
    return (
      <div
        className="rounded-lg flex items-center justify-center shrink-0"
        style={{ width: size, height: size, backgroundColor: '#F59E0B' }}
      >
        <Icons.Lightbulb size={iSize} weight="fill" color="white" />
      </div>
    );
  }

  // Legacy fallback: detect from name
  const { icon, color } = detectSubject(name);
  const IconComponent = iconMap[icon] || Icons.Star;
  const iSize = iconSize || Math.round(size * 0.5);

  return (
    <div
      className="rounded-lg flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <IconComponent size={iSize} weight="fill" color="white" />
    </div>
  );
}
