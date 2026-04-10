'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Bell, Globe, Moon, Sun, Shield,
  ChevronRight, Check, LogOut, Trash2, Monitor,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Level } from '@/types';

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_DESCS: Record<Level, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
  B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery',
};
const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-2">
        {title}
      </p>
      <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden card-shadow">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  sub,
  right,
  onClick,
  danger = false,
  border = true,
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  border?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors',
        border && 'border-b border-gray-100 dark:border-white/[0.05]',
        danger
          ? 'hover:bg-red-50 dark:hover:bg-red-950/20'
          : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]',
        onClick ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
        danger
          ? 'bg-red-100 dark:bg-red-950/30'
          : 'bg-gray-100 dark:bg-white/[0.07]',
      )}>
        <Icon size={15} className={danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', danger ? 'text-red-500' : 'text-gray-800 dark:text-gray-200')}>
          {label}
        </p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {right ?? (onClick && !danger && <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />)}
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const profile = user?.profile;

  const [level, setLevel] = useState<Level>(profile?.level ?? 'A1');
  const [goalMinutes, setGoalMinutes] = useState(profile?.daily_goal_minutes ?? 10);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  useEffect(() => {
    if (profile) {
      setLevel(profile.level);
      setGoalMinutes(profile.daily_goal_minutes);
    }
  }, [profile]);

  const save = async (field: string, data: object) => {
    setSaving(field);
    try {
      await userApi.updateProfile(data);
      await refreshUser();
      setSaved(field);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.warn(err);
    } finally {
      setSaving(null);
    }
  };

  const handleLevelSelect = async (l: Level) => {
    setLevel(l);
    setShowLevelPicker(false);
    await save('level', { level: l });
  };

  const handleGoalSelect = async (g: number) => {
    setGoalMinutes(g);
    setShowGoalPicker(false);
    await save('goal', { daily_goal_minutes: g });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark-subtle border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
          >
            <ArrowLeft size={19} />
          </button>
          <h1 className="font-bold text-[15px] text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Account */}
        <Section title="Account">
          <Row
            icon={User}
            label={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Your account'}
            sub={user?.email}
            border={false}
          />
        </Section>

        {/* Learning */}
        <Section title="Learning">
          <div>
            <Row
              icon={Globe}
              label="French level"
              sub={`${level} — ${LEVEL_DESCS[level]}`}
              onClick={() => { setShowLevelPicker(!showLevelPicker); setShowGoalPicker(false); }}
              right={
                saving === 'level'
                  ? <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-blue rounded-full animate-spin" />
                  : saved === 'level'
                  ? <Check size={14} className="text-emerald-500" />
                  : <ChevronRight size={14} className={cn('text-gray-300 dark:text-gray-600 transition-transform', showLevelPicker && 'rotate-90')} />
              }
            />
            {showLevelPicker && (
              <div className="border-t border-gray-100 dark:border-white/[0.05] px-4 py-3 grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLevelSelect(l)}
                    className={cn(
                      'py-2 rounded-xl text-sm font-bold transition-all',
                      level === l
                        ? 'bg-brand-blue text-white'
                        : 'bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.12]',
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Row
              icon={Bell}
              label="Daily goal"
              sub={`${goalMinutes} minutes per day`}
              onClick={() => { setShowGoalPicker(!showGoalPicker); setShowLevelPicker(false); }}
              border={false}
              right={
                saving === 'goal'
                  ? <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-blue rounded-full animate-spin" />
                  : saved === 'goal'
                  ? <Check size={14} className="text-emerald-500" />
                  : <ChevronRight size={14} className={cn('text-gray-300 dark:text-gray-600 transition-transform', showGoalPicker && 'rotate-90')} />
              }
            />
            {showGoalPicker && (
              <div className="border-t border-gray-100 dark:border-white/[0.05] px-4 py-3 flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGoalSelect(g)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all',
                      goalMinutes === g
                        ? 'bg-brand-blue text-white'
                        : 'bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.12]',
                    )}
                  >
                    {g}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              {theme === 'dark' ? <Moon size={14} /> : theme === 'light' ? <Sun size={14} /> : <Monitor size={14} />}
              Theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all',
                    theme === value
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.12]',
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Privacy & Security">
          <Row
            icon={Shield}
            label="Privacy policy"
            sub="How we handle your data"
            border={false}
          />
        </Section>

        {/* Danger zone */}
        <Section title="Account Actions">
          <Row
            icon={LogOut}
            label="Sign out"
            onClick={handleLogout}
            danger
            border
          />
          <Row
            icon={Trash2}
            label="Delete account"
            sub="Permanently remove your data"
            danger
            border={false}
          />
        </Section>

        <motion.p
          className="text-center text-xs text-gray-300 dark:text-gray-700 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Gabsther v0.1.0
        </motion.p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
