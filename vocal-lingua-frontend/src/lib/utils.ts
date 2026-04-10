import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui utility — merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconds to "Xm Ys" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/** Format a date string to relative time */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Difficulty → Tailwind color class */
export function difficultyColor(level: string): string {
  const map: Record<string, string> = {
    A1: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    A2: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    B1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    B2: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    C1: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    C2: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return map[level] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

/** Check if we're on a mobile-sized screen */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/** Generate avatar URL from initials */
export function avatarUrl(name: string): string {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=002395&textColor=ffffff`;
}

/** Today's date as YYYY-MM-DD */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}
