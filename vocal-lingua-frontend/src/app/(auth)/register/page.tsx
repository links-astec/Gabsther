'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Mic } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await register(form);
      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle dark:bg-surface-dark">
      <div className="h-1 bg-gradient-to-r from-brand-blue via-indigo-500 to-brand-red" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-blue/25">
                <Mic size={28} className="text-white" strokeWidth={1.8} />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gabsther</h1>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create your free account</p>
          </div>

          <div className="bg-white dark:bg-surface-dark-subtle rounded-3xl border border-gray-100 dark:border-white/[0.07] card-shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Get started free</h2>

            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    First name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => update('first_name', e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 dark:focus:ring-brand-blue-light/30 transition"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => update('last_name', e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 dark:focus:ring-brand-blue-light/30 transition"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 dark:focus:ring-brand-blue-light/30 transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 dark:focus:ring-brand-blue-light/30 transition"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password_confirm}
                  onChange={(e) => update('password_confirm', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 dark:focus:ring-brand-blue-light/30 transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-lg shadow-brand-blue/20 mt-1"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={17} />
                    Create account
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By signing up, you agree to our Terms & Privacy Policy.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-blue dark:text-brand-blue-light font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
