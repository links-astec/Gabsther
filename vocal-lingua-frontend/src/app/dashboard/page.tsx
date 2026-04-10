'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mic, ChevronRight, Zap, BookOpen, Target, TrendingUp, Trophy, Flame } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNav, TopBar } from '@/components/Navigation';
import { StreakCounter } from '@/components/StreakCounter';
import { LessonCard } from '@/components/LessonCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useStreak } from '@/hooks/useStreak';
import { lessonsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { LessonSummary } from '@/types';

function DashboardContent() {
  const { user } = useAuth();
  const { streak } = useStreak();
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const profile = user?.profile;
  const firstName = user?.first_name || user?.username || 'Learner';
  const currentStreak = streak?.current_streak ?? 0;
  const totalXP = profile?.total_xp ?? 0;

  useEffect(() => {
    lessonsApi.list({ language: profile?.current_language_code || 'fr', ordering: 'order' })
      .then((r) => setLessons(r.results.slice(0, 5)))
      .finally(() => setIsLoading(false));
  }, [profile?.current_language_code]);

  const completedCount = lessons.filter((l) => l.is_completed).length;
  const goalMinutes = profile?.daily_goal_minutes ?? 10;
  const goalProgress = Math.min((completedCount * 5 / goalMinutes) * 100, 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark pb-28">
      <TopBar
        title="Gabsther"
        subtitle={`French · ${profile?.level || 'A1'}`}
        right={<ThemeToggle />}
      />

      <main className="max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {greeting}, {firstName}!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {currentStreak > 0
              ? `You're on a ${currentStreak}-day streak — don't break it!`
              : 'Complete a lesson to start your streak'}
          </p>
        </motion.div>

        {/* Hero card — streak + XP */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue via-brand-blue-mid to-indigo-700 p-5 text-white"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -right-4 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Total XP</span>
              </div>
              <motion.div
                className="text-5xl font-black tracking-tight"
                key={totalXP}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {totalXP.toLocaleString()}
              </motion.div>
              <div className="mt-2 flex items-center gap-2">
                <div className="bg-white/15 rounded-lg px-2 py-0.5 text-xs font-bold">
                  {profile?.level || 'A1'}
                </div>
                <span className="text-xs text-blue-200">{profile?.lessons_completed ?? 0} lessons done</span>
              </div>
            </div>

            <StreakCounter count={currentStreak} size="lg" />
          </div>

          {/* Daily goal bar */}
          <div className="relative mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs text-blue-200 mb-1.5">
              <span className="flex items-center gap-1"><Target size={10} /> Daily goal</span>
              <span>{Math.min(completedCount * 5, goalMinutes)}/{goalMinutes} min</span>
            </div>
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/voice">
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-brand-red p-4 text-white h-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <Mic size={26} className="mb-2" />
              </motion.div>
              <p className="font-bold text-sm relative">Start Speaking</p>
              <p className="text-red-200 text-xs relative mt-0.5">Talk with Sophie AI</p>
            </motion.div>
          </Link>

          <Link href="/lessons">
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark-subtle border border-gray-100 dark:border-white/[0.06] p-4 h-full card-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen size={26} className="text-brand-blue mb-2" />
              <p className="font-bold text-sm text-gray-900 dark:text-white">Browse Lessons</p>
              <p className="text-gray-400 text-xs mt-0.5">21 French lessons</p>
            </motion.div>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: BookOpen, label: 'Completed', value: profile?.lessons_completed ?? 0, color: 'text-brand-blue' },
            { icon: Mic, label: 'Speak min', value: profile?.total_speaking_minutes ?? 0, color: 'text-violet-500' },
            { icon: Trophy, label: 'Best streak', value: streak?.longest_streak ?? 0, color: 'text-amber-500' },
          ].map((s) => (
            <div key={s.label}
              className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-3.5 text-center border border-gray-100 dark:border-white/[0.06] card-shadow">
              <s.icon size={20} className={cn('mx-auto mb-1.5', s.color)} strokeWidth={1.8} />
              <div className="text-xl font-black text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-brand-blue" />
              <h3 className="font-bold text-[15px] text-gray-900 dark:text-white">Continue Learning</h3>
            </div>
            <Link href="/lessons" className="flex items-center gap-0.5 text-sm text-brand-blue dark:text-brand-blue-light font-semibold">
              See all <ChevronRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-surface-dark-subtle rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.slice(0, 4).map((lesson, i) => (
                <LessonCard key={lesson.id} lesson={lesson} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Streak milestone nudge */}
        {currentStreak > 0 && currentStreak < 7 && (
          <motion.div
            className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-100 dark:border-orange-900/40 rounded-2xl p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0">
              <Flame size={20} className="text-orange-500" fill="currentColor" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {7 - currentStreak} more day{7 - currentStreak > 1 ? 's' : ''} to a 7-day streak!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Keep showing up — consistency is everything.</p>
            </div>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
