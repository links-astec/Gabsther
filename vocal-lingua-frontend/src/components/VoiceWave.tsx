'use client';

import { motion } from 'framer-motion';
import { Mic, Volume2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VoiceWave({ isActive, barCount = 5, className }: {
  isActive: boolean;
  barCount?: number;
  className?: string;
}) {
  const delays = [0.1, 0.2, 0, 0.15, 0.05];
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-current"
          animate={isActive
            ? { scaleY: [0.3, 1.5, 0.3], opacity: [0.5, 1, 0.5] }
            : { scaleY: 0.3, opacity: 0.2 }
          }
          transition={isActive
            ? { duration: 0.7, repeat: Infinity, delay: delays[i % delays.length], ease: 'easeInOut' }
            : { duration: 0.3 }
          }
          style={{ height: 28 }}
        />
      ))}
    </div>
  );
}

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';

interface OrbConfig {
  gradient: string;
  ring: string;
  icon: LucideIcon;
  label: string;
  pulseColor: string;
}

export function VoiceOrb({ state, onPress, onRelease }: {
  state: OrbState;
  onPress?: () => void;
  onRelease?: () => void;
}) {
  const config: Record<OrbState, OrbConfig> = {
    idle: {
      gradient: 'from-slate-600 to-slate-700',
      ring: 'ring-slate-400/20',
      icon: Mic,
      label: 'Tap to speak',
      pulseColor: 'bg-slate-400/20',
    },
    listening: {
      gradient: 'from-brand-red to-rose-600',
      ring: 'ring-red-400/40',
      icon: Mic,
      label: 'Listening…',
      pulseColor: 'bg-red-400/20',
    },
    processing: {
      gradient: 'from-brand-blue to-indigo-600',
      ring: 'ring-blue-400/40',
      icon: Mic,
      label: 'Processing…',
      pulseColor: 'bg-blue-400/20',
    },
    speaking: {
      gradient: 'from-emerald-500 to-teal-600',
      ring: 'ring-emerald-400/40',
      icon: Volume2,
      label: 'Sophie is speaking',
      pulseColor: 'bg-emerald-400/20',
    },
  };

  const { gradient, ring, icon: Icon, label, pulseColor } = config[state];
  const isPulsing = state === 'listening' || state === 'speaking';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {isPulsing && [1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn('absolute rounded-full', pulseColor)}
            style={{ width: 112 + i * 36, height: 112 + i * 36 }}
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
          />
        ))}

        <motion.button
          className={cn(
            'relative w-28 h-28 rounded-full bg-gradient-to-br ring-4',
            'flex items-center justify-center shadow-2xl',
            'focus:outline-none transition-shadow select-none',
            gradient, ring,
          )}
          animate={state === 'processing' ? { rotate: 360 } : {}}
          transition={state === 'processing' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
          onPointerDown={onPress}
          onPointerUp={onRelease}
          onPointerLeave={onRelease}
        >
          {state === 'processing' ? (
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Icon size={32} className="text-white" strokeWidth={1.8} />
          )}
        </motion.button>
      </div>

      <motion.p
        key={label}
        className="text-sm font-medium text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.p>
    </div>
  );
}
