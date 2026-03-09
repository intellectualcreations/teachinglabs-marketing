'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className={`w-9 h-9 rounded-lg border border-border flex items-center justify-center ${className}`}
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`w-9 h-9 rounded-lg border border-border flex items-center justify-center
        text-text-secondary hover:text-text-primary hover:border-navy
        transition-colors cursor-pointer ${className}`}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <Sun size={18} weight="fill" />
      ) : (
        <Moon size={18} weight="fill" />
      )}
    </button>
  );
}
