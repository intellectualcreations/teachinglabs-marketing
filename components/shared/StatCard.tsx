import * as Icons from '@phosphor-icons/react';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.ComponentType<any>> = {
  ChatsCircle: Icons.ChatsCircle,
  ClipboardText: Icons.ClipboardText,
  ChatText: Icons.ChatText,
  Trophy: Icons.Trophy,
  UsersThree: Icons.UsersThree,
  BookOpenText: Icons.BookOpenText,
  ChartBar: Icons.ChartBar,
  Target: Icons.Target,
};

export default function StatCard({ icon, value, label, color, change, changeType }: StatCardProps) {
  const IconComponent = iconMap[icon] || Icons.Star;

  return (
    <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2"
        style={{ backgroundColor: color }}
      >
        <IconComponent size={18} weight="fill" color="white" />
      </div>
      <div className="font-heading font-bold text-2xl text-text-primary">{value}</div>
      <div className="text-xs text-text-secondary font-medium mt-0.5">{label}</div>
      {change && (
        <div className={`text-xs font-semibold mt-1 ${
          changeType === 'up' ? 'text-success' :
          changeType === 'down' ? 'text-danger' :
          'text-text-secondary'
        }`}>
          {change}
        </div>
      )}
    </div>
  );
}
