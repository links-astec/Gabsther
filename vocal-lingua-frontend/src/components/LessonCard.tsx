'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock, Zap, CheckCircle2, Mic, Lock,
  Hand, Utensils, Plane, PenLine, Users, Landmark,
  Briefcase, Hash, ShoppingBag, Heart, Leaf, BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { cn, difficultyColor } from '@/lib/utils';
import type { LessonSummary } from '@/types';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  greetings: Hand,
  food_drink: Utensils,
  travel: Plane,
  grammar: PenLine,
  roleplay: Users,
  culture: Landmark,
  business: Briefcase,
  numbers: Hash,
  family: Users,
  shopping: ShoppingBag,
  health: Heart,
  nature: Leaf,
};

const CATEGORY_COLORS: Record<string, string> = {
  greetings: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  food_drink: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
  travel: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
  grammar: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
  roleplay: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
  culture: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  business: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
  numbers: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
  family: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  shopping: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  health: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  nature: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
};

interface LessonCardProps {
  lesson: LessonSummary;
  index?: number;
  compact?: boolean;
  locked?: boolean;
}

export function LessonCard({ lesson, index = 0, compact = false, locked = false }: LessonCardProps) {
  const CategoryIcon = CATEGORY_ICONS[lesson.category] ?? BookOpen;
  const iconColor = CATEGORY_COLORS[lesson.category] ?? 'bg-gray-50 text-gray-500 dark:bg-white/[0.05] dark:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: 'easeOut' }}
    >
      <div className={cn(
        'group relative bg-white dark:bg-surface-dark-subtle rounded-2xl overflow-hidden',
        'border border-gray-100 dark:border-white/[0.06] card-shadow',
        !locked && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        lesson.is_completed && 'ring-1 ring-green-400/30 dark:ring-green-500/20',
        locked && 'opacity-55',
      )}>
        {lesson.is_completed && (
          <div className="h-0.5 bg-gradient-to-r from-green-400 to-emerald-500" />
        )}

        <div className={cn('flex items-start gap-3.5', compact ? 'p-3.5' : 'p-4')}>
          {/* Category icon */}
          <div className={cn(
            'flex-shrink-0 flex items-center justify-center rounded-xl relative',
            iconColor,
            compact ? 'w-10 h-10' : 'w-12 h-12',
          )}>
            {locked
              ? <Lock size={compact ? 14 : 16} className="text-gray-400 dark:text-gray-500" />
              : <CategoryIcon size={compact ? 16 : 20} strokeWidth={1.8} />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className={cn(
                  'font-semibold text-gray-900 dark:text-white leading-snug',
                  locked && 'text-gray-400 dark:text-gray-600',
                  compact ? 'text-sm' : 'text-[15px]',
                )}>
                  {lesson.title}
                </h3>
                {!compact && lesson.subtitle && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                    {lesson.subtitle}
                  </p>
                )}
              </div>
              {locked
                ? null
                : lesson.is_completed
                  ? <CheckCircle2 size={16} className="flex-shrink-0 text-green-500 mt-0.5" />
                  : !compact && <span className="text-[11px] font-bold text-brand-blue dark:text-brand-blue-light px-2 py-0.5 bg-brand-blue/10 rounded-full mt-0.5">New</span>
              }
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', difficultyColor(lesson.difficulty))}>
                {lesson.difficulty}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                <Clock size={10} />
                <span>{lesson.duration_minutes}m</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-500">
                <Zap size={10} />
                <span>{lesson.xp_reward} XP</span>
              </div>
              {lesson.is_free && !locked && (
                <span className="text-[11px] font-semibold text-emerald-500">Free</span>
              )}
            </div>

            {lesson.user_score !== null && lesson.user_score > 0 && !locked && (
              <div className="mt-2.5">
                <div className="h-1 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-blue to-brand-blue-light rounded-full"
                    style={{ width: `${lesson.user_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {!compact && !locked && (
          <div className="flex gap-2 px-4 pb-4">
            <Link
              href={`/lessons/${lesson.id}`}
              className="flex-1 text-center text-sm font-bold py-2.5 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-mid transition-colors"
            >
              {lesson.is_completed ? 'Review' : 'Start'}
            </Link>
            <Link
              href={`/voice?lesson=${lesson.id}`}
              className="flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 px-4 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <Mic size={13} />
              <span>Practice</span>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
