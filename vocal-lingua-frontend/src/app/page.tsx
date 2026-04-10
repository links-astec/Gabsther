'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mic, BookOpen, Zap, ArrowRight, Globe, Brain, Smartphone, Flame } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Mic,
    title: 'Speak from Day 1',
    desc: 'Real conversations with an AI French tutor who listens, corrects, and encourages.',
    color: 'bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-brand-blue-light',
  },
  {
    icon: Brain,
    title: 'Smart Corrections',
    desc: 'Get instant, gentle corrections on grammar, pronunciation, and vocabulary.',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400',
  },
  {
    icon: Flame,
    title: 'Daily Streaks',
    desc: 'Build a habit with daily goals, streak tracking, and XP rewards.',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400',
  },
  {
    icon: Smartphone,
    title: 'Works Offline',
    desc: 'Study lessons anywhere — no internet required. PWA support included.',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
];

const TESTIMONIALS = [
  { name: 'Marie L.', country: 'US', text: '"I went from zero to holding a café conversation in 3 weeks!"' },
  { name: 'James K.', country: 'UK', text: '"The voice practice is unlike any app I\'ve tried. Sophie is incredible."' },
  { name: 'Ana R.', country: 'BR', text: '"French grammar finally clicked after the grammar lessons with voice practice."' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark overflow-x-hidden">

      {/* Nav */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-surface-dark/90 backdrop-blur border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center">
            <Mic size={14} className="text-white" />
          </div>
          <span className="font-black text-gray-900 dark:text-white text-lg tracking-tight">Gabsther</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm text-gray-600 dark:text-gray-400 font-semibold px-3 py-2 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold bg-brand-blue text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Start free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 pt-16 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-transparent dark:from-blue-950/20 dark:to-transparent" />

        {/* Animated rings */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-blue-200/40 dark:border-blue-700/20"
              style={{
                width: 100 + i * 100,
                height: 100 + i * 100,
                left: -(50 + i * 50),
                top: -(50 + i * 50),
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-blue-light rounded-full text-sm font-semibold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Globe size={13} />
            <span>Now available — French</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            Learn French{' '}
            <span className="text-gradient-french">by Speaking</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-sm mx-auto">
            AI-powered speaking practice that listens, corrects, and celebrates your progress.
            From <em>Bonjour</em> to fluent — at your pace.
          </p>

          {/* Animated mic */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full bg-brand-blue/15"
                  animate={{ scale: [1, 2.8], opacity: [0.4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.65, ease: 'easeOut' }}
                />
              ))}
              <Link
                href="/register"
                className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-indigo-600 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-shadow"
              >
                <Mic size={36} className="text-white" />
              </Link>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              Tap to start learning for free
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-4 px-8 rounded-2xl text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
            >
              Start Learning Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/lessons"
              className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-gray-300 font-semibold py-4 px-8 rounded-2xl text-base hover:bg-gray-200 dark:hover:bg-white/[0.12] transition-colors"
            >
              <BookOpen size={18} />
              Browse Lessons
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
            No credit card required · Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-8">
          Everything you need to speak French
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={i}
              className="p-4 bg-gray-50 dark:bg-surface-dark-subtle rounded-2xl border border-gray-100 dark:border-white/[0.06] card-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', feat.color)}>
                <feat.icon size={18} strokeWidth={1.8} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{feat.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats banner */}
      <section className="px-4 py-12 bg-gradient-to-br from-brand-blue via-brand-blue-mid to-indigo-700 text-white">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '21+', label: 'French Lessons' },
            { value: '5', label: 'Categories' },
            { value: 'A1–C2', label: 'All Levels' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-8">
          What learners say
        </h2>
        <div className="flex flex-col gap-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              className="p-4 bg-gray-50 dark:bg-surface-dark-subtle rounded-2xl border border-gray-100 dark:border-white/[0.06] card-shadow"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">{t.text}</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/[0.1] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">{t.country}</span>
                </div>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 text-center">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
          Ready to say <em className="text-brand-blue not-italic">Bonjour ?</em>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
          Start your first lesson in under 60 seconds.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-brand-red text-white font-bold py-4 px-10 rounded-2xl text-base hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 hover:-translate-y-0.5"
        >
          <Zap size={18} />
          Start Free Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-gray-100 dark:border-white/[0.06] text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center">
            <Mic size={11} className="text-white" />
          </div>
          <span className="font-bold text-gray-700 dark:text-gray-300">Gabsther</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Built for language learners everywhere · Next.js + Django
        </p>
      </footer>
    </div>
  );
}
