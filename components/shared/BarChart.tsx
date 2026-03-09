'use client';

interface BarChartProps {
  labels: string[];
  values: number[];
  height?: number;
}

export default function BarChart({ labels, values, height = 120 }: BarChartProps) {
  const maxVal = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {labels.map((label, i) => {
        const val = values[i] || 0;
        const barH = Math.round((val / maxVal) * height);
        const color = val > 30 ? '#4FA3A5' : val > 15 ? '#8FC4C5' : '#BFE0E1';

        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 min-w-[28px]">
            <div
              className="w-full rounded-t min-h-1"
              style={{ height: barH, backgroundColor: color }}
            />
            <span className="text-[10px] text-text-secondary font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
