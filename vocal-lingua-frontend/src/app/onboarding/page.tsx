'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plane, Utensils, Landmark, Briefcase, Users, Music, Target, Film, BookOpen, Cpu, type LucideIcon } from 'lucide-react';
import { lessonsApi, userApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { Language, Level } from '@/types';
import { cn } from '@/lib/utils';

const LEVELS: Array<{ value: Level; label: string; desc: string }> = [
  { value: 'A1', label: 'A1 — Beginner', desc: 'I know a few words' },
  { value: 'A2', label: 'A2 — Elementary', desc: 'I can handle basic situations' },
  { value: 'B1', label: 'B1 — Intermediate', desc: 'I can have simple conversations' },
  { value: 'B2', label: 'B2 — Upper Intermediate', desc: 'I can discuss most topics' },
  { value: 'C1', label: 'C1 — Advanced', desc: "I'm nearly fluent" },
  { value: 'C2', label: 'C2 — Mastery', desc: 'I speak French fluently' },
];

const INTERESTS: Array<{ value: string; icon: LucideIcon; label: string }> = [
  { value: 'travel', icon: Plane, label: 'Travel' },
  { value: 'food', icon: Utensils, label: 'Food & Wine' },
  { value: 'culture', icon: Landmark, label: 'Culture & Art' },
  { value: 'business', icon: Briefcase, label: 'Business' },
  { value: 'family', icon: Users, label: 'Family' },
  { value: 'music', icon: Music, label: 'Music' },
  { value: 'sports', icon: Target, label: 'Sports' },
  { value: 'cinema', icon: Film, label: 'Cinema' },
  { value: 'literature', icon: BookOpen, label: 'Literature' },
  { value: 'tech', icon: Cpu, label: 'Technology' },
];

function OnboardingContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    lessonsApi.listLanguages().then((langs) => {
      setLanguages(langs);
      const fr = langs.find((l) => l.code === 'fr');
      if (fr) setSelectedLanguage(fr);
    });
  }, []);

  const toggleInterest = (val: string) => {
    setSelectedInterests((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await userApi.completeOnboarding({
        language_id: selectedLanguage?.id,
        level: selectedLevel,
        interests: selectedInterests,
      });
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      router.push('/dashboard');
    }
  };

  const steps = ['Language', 'Level', 'Interests'];

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark flex flex-col">
      {/* Top accent + progress */}
      <div className="h-1 bg-gray-200 dark:bg-white/[0.06]">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-blue to-indigo-500"
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-8">

        {/* Step dots */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <motion.div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  i < step
                    ? 'bg-emerald-500 text-white'
                    : i === step
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                    : 'bg-gray-200 dark:bg-white/[0.08] text-gray-400'
                )}
                animate={i === step ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div
                  className={cn('h-0.5 w-8', i < step ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-white/[0.08]')}
                  animate={{ backgroundColor: i < step ? '#34d399' : undefined }}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{steps[step]}</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Language */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1"
            >
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                What language are you learning?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">More languages coming soon!</p>
              <div className="flex flex-col gap-2.5">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang)}
                    disabled={!lang.is_active}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                      selectedLanguage?.id === lang.id
                        ? 'border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10'
                        : 'border-gray-200 dark:border-white/[0.08] bg-white dark:bg-surface-dark-subtle hover:border-brand-blue/30',
                      !lang.is_active && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-brand-blue dark:text-brand-blue-light tracking-wide">
                        {lang.code.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">{lang.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{lang.native_name} · {lang.lesson_count} lessons</p>
                    </div>
                    {selectedLanguage?.id === lang.id && (
                      <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
                        <Check size={13} className="text-white" />
                      </div>
                    )}
                    {!lang.is_active && (
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/[0.06] px-2 py-1 rounded-full">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Level */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1"
            >
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                What's your French level?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                Be honest — we'll find the right lessons for you.
              </p>
              <div className="flex flex-col gap-2">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    onClick={() => setSelectedLevel(lvl.value)}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left',
                      selectedLevel === lvl.value
                        ? 'border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10'
                        : 'border-gray-200 dark:border-white/[0.08] bg-white dark:bg-surface-dark-subtle hover:border-brand-blue/30'
                    )}
                  >
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{lvl.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lvl.desc}</p>
                    </div>
                    {selectedLevel === lvl.value && (
                      <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
                        <Check size={13} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1"
            >
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                What are your interests?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                We'll tailor lessons to topics you love. Pick as many as you want!
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.value);
                  return (
                    <button
                      key={interest.value}
                      onClick={() => toggleInterest(interest.value)}
                      className={cn(
                        'flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10'
                          : 'border-gray-200 dark:border-white/[0.08] bg-white dark:bg-surface-dark-subtle hover:border-brand-blue/30'
                      )}
                    >
                      <interest.icon
                        size={18}
                        className={cn(
                          'flex-shrink-0',
                          isSelected ? 'text-brand-blue dark:text-brand-blue-light' : 'text-gray-500 dark:text-gray-400',
                        )}
                        strokeWidth={1.8}
                      />
                      <span className={cn(
                        'text-sm font-semibold',
                        isSelected ? 'text-brand-blue dark:text-brand-blue-light' : 'text-gray-700 dark:text-gray-300',
                      )}>
                        {interest.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !selectedLanguage}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-brand-blue/25"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-blue/25 disabled:opacity-60"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Start Learning!'
              )}
            </button>
          )}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
