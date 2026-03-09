import * as Icons from '@phosphor-icons/react';
import { detectSubject } from '@/lib/constants';

interface ClassIconProps {
  name: string;
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

export default function ClassIcon({ name, size = 36, iconSize }: ClassIconProps) {
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
