'use client';
import { ChartBar } from '@phosphor-icons/react';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mb-4">
        <ChartBar size={32} weight="fill" className="text-teal" />
      </div>
      <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Analytics</h2>
      <p className="text-text-secondary text-sm max-w-sm">Track your learning progress across all your classes. Detailed analytics coming soon!</p>
    </div>
  );
}
