'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, X, CheckCircle2, Lock, ChevronRight, SlidersHorizontal,
  Hand, Utensils, Plane, PenLine, Users, BookOpen, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNav, TopBar } from '@/components/Navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { lessonsApi } from '@/lib/api';
import { cn, difficultyColor } from '@/lib/utils';
import type { LessonSummary, LessonCategory } from '@/types';

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  greetings: { label: 'Greetings', icon: Hand, color: 'from-blue-500 to-blue-600' },
  food_drink: { label: 'Food & Drink', icon: Utensils, color: 'from-orange-500 to-orange-600' },
  travel: { label: 'Travel', icon: Plane, color: 'from-sky-500 to-sky-600' },
  grammar: { label: 'Grammar', icon: PenLine, color: 'from-violet-500 to-violet-600' },
  roleplay: { label: 'Role-play', icon: Users, color: 'from-pink-500 to-pink-600' },
};

const DIFFICULTIES = ['', 'A1', 'A2', 'B1', 'B2'];

function LessonPathNode({
  lesson,
  status,
  index,
}: {
  lesson: LessonSummary;
  status: 'done' | 'current' | 'locked';
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="flex items-stretch gap-4"
    >
      {/* Left: node + connector */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all',
          status === 'done' && 'bg-emerald-500 border-emerald-500',
          status === 'current' && 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/30',
          status === 'locked' && 'bg-white dark:bg-surface-dark-subtle border-gray-200 dark:border-white/[0.10]',
        )}>
          {status === 'done' && <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />}
          {status === 'current' && <span className="text-white font-black text-sm">{lesson.order}</span>}
          {status === 'locked' && <Lock size={14} className="text-gray-400 dark:text-gray-600" />}
        </div>
        {/* Vertical line */}
        <div className="w-0.5 flex-1 bg-gray-100 dark:bg-white/[0.06] mt-1" />
      </div>

      {/* Right: card */}
      <div className={cn(
        'flex-1 mb-3 rounded-2xl border overflow-hidden',
        'bg-white dark:bg-surface-dark-subtle',
        status === 'locked'
          ? 'border-gray-100 dark:border-white/[0.05] opacity-55'
          : status === 'done'
          ? 'border-emerald-100 dark:border-emerald-500/20'
          : 'border-brand-blue/30 dark:border-brand-blue/40 shadow-md shadow-brand-blue/10',
      )}>
        {status === 'done' && <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500" />}
        {status === 'current' && <div className="h-0.5 bg-gradient-to-r from-brand-blue to-indigo-500" />}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className={cn(
                'font-semibold text-[15px] leading-snug',
                status === 'locked'
                  ? 'text-gray-400 dark:text-gray-600'
                  : 'text-gray-900 dark:text-white',
              )}>
                {lesson.title}
              </h3>
              {lesson.subtitle && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{lesson.subtitle}</p>
              )}
            </div>
            {status === 'done' && <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', difficultyColor(lesson.difficulty))}>
              {lesson.difficulty}
            </span>
            <span className="text-[11px] text-gray-400">{lesson.duration_minutes}m</span>
            <span className="text-[11px] text-amber-500 font-medium">{lesson.xp_reward} XP</span>
            {lesson.user_score !== null && lesson.user_score > 0 && (
              <span className="text-[11px] text-emerald-500 font-medium">{Math.round(lesson.user_score)}%</span>
            )}
          </div>

          {status !== 'locked' && (
            <div className="flex gap-2 mt-3">
              <Link
                href={`/lessons/${lesson.id}`}
                className={cn(
                  'flex-1 text-center text-sm font-bold py-2 rounded-xl transition-colors',
                  status === 'current'
                    ? 'bg-brand-blue text-white hover:bg-brand-blue-mid'
                    : 'bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.12]',
                )}
              >
                {status === 'done' ? 'Review' : 'Start Lesson'}
              </Link>
              <Link
                href={`/voice?lesson=${lesson.id}`}
                className="flex items-center justify-center gap-1 text-sm font-medium py-2 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-xs">Practice</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LessonsContent() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await lessonsApi.list({
        language: 'fr',
        difficulty: difficulty || undefined,
        search: search || undefined,
        ordering: 'order',
      });
      setLessons(res.results);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, search]);

  useEffect(() => {
    const t = setTimeout(fetchLessons, 280);
    return () => clearTimeout(t);
  }, [fetchLessons]);

  const completedCount = lessons.filter((l) => l.is_completed).length;
  const hasFilters = !!(difficulty || search);

  // Build locked status: lesson is available if its predecessor (by order) is completed
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const completedIds = new Set(sortedLessons.filter((l) => l.is_completed).map((l) => l.id));
  const lessonStatusMap = new Map<number, 'done' | 'current' | 'locked'>();
  let foundCurrent = false;
  for (let i = 0; i < sortedLessons.length; i++) {
    const l = sortedLessons[i];
    if (l.is_completed) {
      lessonStatusMap.set(l.id, 'done');
    } else if (!foundCurrent) {
      lessonStatusMap.set(l.id, 'current');
      foundCurrent = true;
    } else {
      lessonStatusMap.set(l.id, 'locked');
    }
  }

  // Group by category (preserving order within each group)
  const grouped = new Map<string, LessonSummary[]>();
  for (const l of sortedLessons) {
    const cat = l.category as string;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(l);
  }

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark pb-28">
      <TopBar
        title="Lessons"
        subtitle={`${completedCount} of ${lessons.length} completed`}
        right={
          <>
            <ThemeToggle />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-xl transition-colors',
                showFilters || hasFilters
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.07]',
              )}
            >
              <SlidersHorizontal size={16} />
            </button>
          </>
        }
      />

      {/* Progress bar */}
      {lessons.length > 0 && (
        <div className="h-0.5 bg-gray-100 dark:bg-white/[0.05]">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-blue to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / lessons.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons…"
            className="w-full pl-9 pr-9 py-3 rounded-2xl bg-white dark:bg-surface-dark-subtle border border-gray-200 dark:border-white/[0.07] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Difficulty filter */}
        {showFilters && (
          <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-4 border border-gray-200 dark:border-white/[0.07]">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Level</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all',
                    difficulty === d
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]',
                  )}
                >
                  {d === '' ? 'All' : d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isLoading ? 'Loading…' : `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}`}
          </p>
          {hasFilters && (
            <button onClick={() => { setDifficulty(''); setSearch(''); }}
              className="text-xs font-semibold text-brand-blue dark:text-brand-blue-light">
              Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-100 dark:bg-surface-dark-subtle rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">No lessons found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          /* Path grouped by category */
          <div className="space-y-6 pt-1">
            {Array.from(grouped.entries()).map(([cat, catLessons]) => {
              const meta = CATEGORY_META[cat] ?? { label: cat, icon: BookOpen, color: 'from-gray-500 to-gray-600' };
              const CatIcon = meta.icon;
              return (
                <div key={cat}>
                  {/* Unit header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br text-white', meta.color)}>
                      <CatIcon size={15} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Unit</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{meta.label}</p>
                    </div>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06] ml-1" />
                    <span className="text-[11px] text-gray-400">
                      {catLessons.filter((l) => l.is_completed).length}/{catLessons.length}
                    </span>
                  </div>

                  {/* Lesson nodes */}
                  <div>
                    {catLessons.map((lesson, i) => (
                      <LessonPathNode
                        key={lesson.id}
                        lesson={lesson}
                        status={lessonStatusMap.get(lesson.id) ?? 'locked'}
                        index={i}
                      />
                    ))}
                    {/* Terminal dot */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-white/[0.08]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function LessonsPage() {
  return <ProtectedRoute><LessonsContent /></ProtectedRoute>;
}
