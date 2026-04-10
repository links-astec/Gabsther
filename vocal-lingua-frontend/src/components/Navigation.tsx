'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Mic, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/voice', label: 'Speak', icon: Mic, accent: true },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-3">
        <div className="bg-white dark:bg-surface-dark-subtle border border-gray-100 dark:border-white/[0.06] rounded-3xl shadow-lg dark:shadow-black/40 px-2 py-1">
          <div className="flex items-center justify-around h-14">
            {NAV_ITEMS.map(({ href, label, icon: Icon, accent }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              if (accent) {
                return (
                  <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1">
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all',
                      isActive
                        ? 'bg-brand-red shadow-red-glow scale-105'
                        : 'bg-gradient-to-br from-brand-blue to-brand-blue-mid shadow-blue-glow'
                    )}>
                      <Icon size={20} className="text-white" />
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all min-w-[56px]',
                    isActive
                      ? 'text-brand-blue dark:text-brand-blue-light'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 -m-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                      />
                    )}
                    <Icon size={20} className="relative z-10" strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium relative z-10 transition-all',
                    isActive ? 'opacity-100' : 'opacity-60'
                  )}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function TopBar({
  title,
  subtitle,
  right,
  transparent = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  transparent?: boolean;
}) {
  return (
    <header className={cn(
      'sticky top-0 z-40 transition-colors',
      transparent
        ? 'bg-transparent'
        : 'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-white/[0.05]'
    )}>
      <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
        <div>
          <h1 className="font-bold text-[15px] text-gray-900 dark:text-white leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex items-center gap-1">{right}</div>}
      </div>
    </header>
  );
}
