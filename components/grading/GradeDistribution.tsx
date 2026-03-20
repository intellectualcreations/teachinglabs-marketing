'use client';

import { ChartBar } from '@phosphor-icons/react';

interface GradeDistributionProps {
  distribution: Record<string, number>;
  avgScore: number;
  totalSubmissions: number;
  gradedCount: number;
}

function barColor(label: string): string {
  // Extract the lower bound of the range
  const lower = parseInt(label.split('-')[0], 10);
  if (lower >= 71) return 'bg-emerald-500';
  if (lower >= 51) return 'bg-amber-500';
  return 'bg-red-400';
}

export default function GradeDistribution({
  distribution,
  avgScore,
  totalSubmissions,
  gradedCount,
}: GradeDistributionProps) {
  const labels = Object.keys(distribution);
  const values = Object.values(distribution);
  const maxVal = Math.max(...values, 1);

  return (
    <div className="bg-card-bg border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ChartBar size={22} weight="duotone" className="text-teal" />
          <h3 className="text-lg font-heading font-bold text-text-primary">
            Grade Distribution
          </h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-muted">
            Avg: <span className="font-bold text-teal">{avgScore}%</span>
          </span>
          <span className="text-text-muted">
            {gradedCount}/{totalSubmissions} graded
          </span>
        </div>
      </div>

      {gradedCount === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">No graded submissions yet.</p>
        </div>
      ) : (
        <div className="flex items-end gap-2" style={{ height: 140 }}>
          {labels.map((label, i) => {
            const val = values[i];
            const barH = maxVal > 0 ? Math.max(val > 0 ? 8 : 2, Math.round((val / maxVal) * 130)) : 2;

            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                {val > 0 && (
                  <span className="text-[10px] font-bold text-text-primary">{val}</span>
                )}
                <div
                  className={`w-full rounded-t min-h-[2px] transition-all ${barColor(label)}`}
                  style={{ height: barH }}
                />
                <span className="text-[9px] text-text-muted font-medium whitespace-nowrap">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
