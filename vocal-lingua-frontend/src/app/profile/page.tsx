'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut, Settings, Edit3, Trophy, Zap, BookOpen, Mic,
  Target, Flame, MessageCircle, Star, Check, X,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNav, TopBar } from '@/components/Navigation';
import { StreakCounter } from '@/components/StreakCounter';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useStreak } from '@/hooks/useStreak';
import { userApi, lessonsApi } from '@/lib/api';
import { LEVEL_LABELS } from '@/types';
import { avatarUrl, cn } from '@/lib/utils';
import type { HeatmapData, ProgressStats } from '@/types';

const BADGES: Array<{ icon: LucideIcon; color: string; label: string; threshold: number; stat: string }> = [
  { icon: Target, color: 'text-blue-500', label: 'First Lesson', threshold: 1, stat: 'lessons_completed' },
  { icon: Flame, color: 'text-orange-500', label: '7-Day Streak', threshold: 7, stat: 'streak' },
  { icon: MessageCircle, color: 'text-violet-500', label: 'First Chat', threshold: 1, stat: 'speaking_minutes' },
  { icon: Trophy, color: 'text-amber-500', label: '10 Lessons', threshold: 10, stat: 'lessons_completed' },
  { icon: Star, color: 'text-yellow-500', label: '500 XP', threshold: 500, stat: 'xp' },
  { icon: Flame, color: 'text-red-500', label: '30-Day Streak', threshold: 30, stat: 'streak' },
];

function ProfileContent() {
  const { user, logout, refreshUser } = useAuth();
  const { streak } = useStreak();
  const router = useRouter();
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(user?.profile?.daily_goal_minutes ?? 10);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    username: user?.username ?? '',
  });

  const profile = user?.profile;
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Learner';

  useEffect(() => {
    userApi.getHeatmap().then(setHeatmap).catch(console.warn);
    lessonsApi.getStats().then(setStats).catch(console.warn);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileError('');
    try {
      await userApi.updateMe({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        username: editForm.username,
      });
      await refreshUser();
      setIsEditingProfile(false);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      await userApi.updateProfile({ daily_goal_minutes: goalMinutes });
      setIsEditingGoal(false);
    } catch (err) {
      console.warn(err);
    }
  };

  const earnedBadges = BADGES.filter((badge) => {
    if (badge.stat === 'lessons_completed') return (profile?.lessons_completed ?? 0) >= badge.threshold;
    if (badge.stat === 'streak') return (streak?.longest_streak ?? 0) >= badge.threshold;
    if (badge.stat === 'speaking_minutes') return (profile?.total_speaking_minutes ?? 0) >= badge.threshold;
    if (badge.stat === 'xp') return (profile?.total_xp ?? 0) >= badge.threshold;
    return false;
  });

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark pb-28">
      <TopBar title="Profile" right={<ThemeToggle />} />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">

        {/* Profile card */}
        <motion.div
          className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] card-shadow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={profile?.avatar_url || avatarUrl(displayName)}
                alt={displayName}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-brand-blue rounded-md px-1 py-0.5 shadow-sm">
                <span className="text-[9px] font-black text-white tracking-wide">
                  {(profile?.current_language_code || 'fr').toUpperCase()}
                </span>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                    placeholder="First name"
                    className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.06] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  />
                  <input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                    placeholder="Last name"
                    className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.06] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  />
                </div>
                <input
                  value={editForm.username}
                  onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="Username"
                  className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.06] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                {profileError && (
                  <p className="text-xs text-red-500">{profileError}</p>
                )}
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{displayName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-bold bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-brand-blue-light px-2 py-0.5 rounded-full">
                    {profile?.level || 'A1'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {LEVEL_LABELS[profile?.level || 'A1']}
                  </span>
                </div>
              </div>
            )}

            {isEditingProfile ? (
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="p-1.5 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => { setIsEditingProfile(false); setProfileError(''); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditForm({
                    first_name: user?.first_name ?? '',
                    last_name: user?.last_name ?? '',
                    username: user?.username ?? '',
                  });
                  setIsEditingProfile(true);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-xl transition-colors shrink-0"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            {[
              { icon: BookOpen, value: profile?.lessons_completed ?? 0, label: 'Lessons' },
              { icon: Zap, value: profile?.total_xp ?? 0, label: 'Total XP' },
              { icon: Mic, value: profile?.total_speaking_minutes ?? 0, label: 'Speak min' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon size={15} className="text-brand-blue mx-auto mb-1" />
                <div className="text-xl font-black text-gray-900 dark:text-white">{value}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Streak section */}
        <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Streak</h3>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/[0.06] px-2.5 py-1 rounded-full font-medium">
              Best: {streak?.longest_streak ?? 0} days
            </span>
          </div>

          <div className="flex justify-center mb-5">
            <StreakCounter count={streak?.current_streak ?? 0} size="lg" />
          </div>

          {heatmap && (
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                Activity — last 20 weeks
              </p>
              <HeatmapCalendar
                activityDates={heatmap.data.map((d) => d.date)}
                weeks={20}
              />
            </div>
          )}
        </div>

        {/* Progress by category */}
        {stats && (
          <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] card-shadow">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Progress by Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.by_category).map(([key, data]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{data.label}</span>
                    <span className="text-gray-400 text-xs">{data.completed}/{data.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand-blue to-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.completed / data.total) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3 text-center">
                <div className="text-lg font-black text-gray-900 dark:text-white">{stats.average_score}%</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Avg. Score</div>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3 text-center">
                <div className="text-lg font-black text-gray-900 dark:text-white">{Math.round(stats.completion_rate)}%</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-yellow-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">Badges</h3>
            <span className="text-xs text-gray-400 ml-auto">{earnedBadges.length}/{BADGES.length} earned</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {BADGES.map((badge) => {
              const earned = earnedBadges.some((b) => b.label === badge.label);
              return (
                <div
                  key={badge.label}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                    earned
                      ? 'border-yellow-300 dark:border-yellow-700/50 bg-yellow-50 dark:bg-yellow-950/20'
                      : 'border-gray-100 dark:border-white/[0.04] grayscale opacity-40'
                  )}
                >
                  <badge.icon
                    size={20}
                    className={earned ? badge.color : 'text-gray-400 dark:text-gray-600'}
                    fill={earned && (badge.icon === Star || badge.icon === Flame) ? 'currentColor' : 'none'}
                    strokeWidth={1.8}
                  />
                  <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-400 text-center leading-tight">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily goal */}
        <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white">Daily Goal</h3>
            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-xs font-semibold text-brand-blue dark:text-brand-blue-light"
            >
              {isEditingGoal ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingGoal ? (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(Number(e.target.value))}
                className="flex-1 accent-brand-blue"
              />
              <span className="font-bold text-gray-900 dark:text-white w-16 text-center text-sm">
                {goalMinutes} min
              </span>
              <button
                onClick={handleSaveGoal}
                className="px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-xl"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-indigo-500 rounded-full"
                  style={{ width: '40%' }}
                />
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{goalMinutes} min/day</span>
            </div>
          )}
        </div>

        {/* Settings / Logout */}
        <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden card-shadow">
          <Link href="/settings" className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors border-b border-gray-100 dark:border-white/[0.06]">
            <Settings size={16} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-500"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Sign out</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 dark:text-gray-700 py-2">
          Gabsther v0.1.0
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
