'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'w-9 h-9 flex items-center justify-center rounded-xl',
        'text-gray-500 dark:text-gray-400',
        'hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors',
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun size={16} className="dark:hidden" />
      <Moon size={16} className="hidden dark:block" />
    </button>
  );
}
