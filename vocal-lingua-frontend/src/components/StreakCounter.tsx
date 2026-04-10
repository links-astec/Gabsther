'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StreakCounter({ count, size = 'md', showLabel = true, className }: StreakCounterProps) {
  const isActive = count > 0;

  const sizes = {
    sm: { iconSize: 24, number: 'text-2xl', label: 'text-xs' },
    md: { iconSize: 32, number: 'text-3xl', label: 'text-sm' },
    lg: { iconSize: 40, number: 'text-4xl', label: 'text-sm' },
  };
  const { iconSize, number, label } = sizes[size];

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative flex items-center justify-center">
        {isActive && (
          <motion.div
            className="absolute w-16 h-16 rounded-full bg-orange-400/15 blur-xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
        <motion.div
          className={cn('relative', !isActive && 'opacity-25')}
          animate={isActive ? { rotate: [-4, 4, -4] } : {}}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame
            size={iconSize}
            className={isActive ? 'text-orange-500' : 'text-gray-400 dark:text-gray-600'}
            strokeWidth={1.8}
            fill={isActive ? 'currentColor' : 'none'}
          />
        </motion.div>
      </div>

      <motion.span
        key={count}
        className={cn(number, 'font-black leading-none', isActive ? 'text-orange-500' : 'text-gray-300 dark:text-gray-700')}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        {count}
      </motion.span>

      {showLabel && (
        <p className={cn(label, 'text-gray-400 dark:text-gray-500 font-medium')}>
          day streak
        </p>
      )}
    </div>
  );
}
