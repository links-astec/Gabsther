'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, RefreshCw, ChevronDown, ChevronUp, Sparkles, BookOpen,
  Coffee, ShoppingCart, MapPin, Building2, Hand, Utensils, Briefcase, MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { VoiceOrb, VoiceWave } from '@/components/VoiceWave';
import { useSpeech } from '@/hooks/useSpeech';
import { useStreak } from '@/hooks/useStreak';
import { voiceApi, lessonsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ChatMessage, Correction, LessonDetail } from '@/types';

const SCENARIOS: Array<{ icon: LucideIcon; label: string; prompt: string }> = [
  { icon: Coffee, label: 'At the Café', prompt: 'You are ordering coffee and a croissant at a Parisian café.' },
  { icon: ShoppingCart, label: 'Grocery Shopping', prompt: 'You are shopping for fruit and vegetables at a French market.' },
  { icon: MapPin, label: 'Asking Directions', prompt: 'You are lost in Paris and asking a local for directions to the Eiffel Tower.' },
  { icon: Building2, label: 'Hotel Check-in', prompt: 'You are checking into a Paris hotel and asking about amenities.' },
  { icon: Hand, label: 'Meeting Someone', prompt: 'You are meeting a French person at a social event and making small talk.' },
  { icon: Utensils, label: 'Restaurant', prompt: 'You are dining at a French restaurant and ordering a full meal.' },
  { icon: Briefcase, label: 'Job Interview', prompt: 'You are interviewing for a position at a French company.' },
  { icon: MessageCircle, label: 'Free Chat', prompt: 'Have a free-flowing conversation to practice your French.' },
];

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';

/** Strip parenthetical English translations before sending to TTS */
function frenchOnly(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, '').trim();
}

const STORAGE_KEY = 'gabsther_voice_session';

function loadPersistedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      messages: ChatMessage[];
      corrections: Correction[];
      scenarioLabel: string;
    };
  } catch {
    return null;
  }
}

function VoiceChatContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lesson');

  const persisted = !lessonId ? loadPersistedSession() : null;
  const initialScenario = persisted
    ? SCENARIOS.find((s) => s.label === persisted.scenarioLabel) ?? SCENARIOS[7]
    : SCENARIOS[7];

  const [messages, setMessages] = useState<ChatMessage[]>(persisted?.messages ?? []);
  const [corrections, setCorrections] = useState<Correction[]>(persisted?.corrections ?? []);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0]>(initialScenario);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [, setLesson] = useState<LessonDetail | null>(null);
  const [sessionStart] = useState(Date.now());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { recordActivity } = useStreak();

  // Persist messages + scenario to localStorage on every change
  useEffect(() => {
    if (lessonId) return; // don't persist lesson-linked sessions
    if (messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages,
        corrections,
        scenarioLabel: selectedScenario.label,
      }));
    } catch { /* storage full — ignore */ }
  }, [messages, corrections, selectedScenario.label, lessonId]);

  useEffect(() => {
    if (lessonId) {
      lessonsApi.get(Number(lessonId)).then((l) => {
        setLesson(l);
        if (l.scenario_prompt) {
          setSelectedScenario({ icon: BookOpen, label: l.title, prompt: l.scenario_prompt });
        }
      });
    }
  }, [lessonId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFinalTranscript = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setOrbState('processing');

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const response = await voiceApi.chat({
        message: text, language_code: 'fr',
        scenario: selectedScenario.prompt,
        history,
        lesson_id: lessonId ? Number(lessonId) : undefined,
      });

      const aiMsg: ChatMessage = { role: 'assistant', content: response.reply, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      if (response.corrections.length > 0) setCorrections((prev) => [...prev, ...response.corrections]);

      setOrbState('speaking');
      await speakText(frenchOnly(response.reply));
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Désolée, une erreur s'est produite. (Sorry, an error occurred.) Please try again!",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setOrbState('idle');
    }
  }, [messages, selectedScenario, lessonId]);

  const { isListening, isSpeaking, interimText, isSupported, startListening, stopListening, speakText } =
    useSpeech({ language: 'fr-FR', onFinalTranscript: handleFinalTranscript });

  useEffect(() => {
    if (isListening) setOrbState('listening');
    else if (isSpeaking) setOrbState('speaking');
    else if (orbState !== 'processing') setOrbState('idle');
  }, [isListening, isSpeaking]);

  const handleOrbPress = () => {
    if (orbState === 'idle') startListening();
    else if (orbState === 'listening') stopListening();
  };

  const handleSave = async () => {
    if (!messages.length) return;
    setIsSaving(true);
    try {
      await voiceApi.saveSession({
        lesson: lessonId ? Number(lessonId) : undefined,
        transcript: messages,
        corrections,
        scenario: selectedScenario.label,
        duration_seconds: Math.floor((Date.now() - sessionStart) / 1000),
        messages_sent: messages.filter((m) => m.role === 'user').length,
      });
      await recordActivity('voice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCorrections([]);
    setOrbState('idle');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white select-none">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-white/[0.06]">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <button
          onClick={() => setShowScenarios(!showScenarios)}
          className="flex items-center gap-2 bg-gray-100 dark:bg-white/[0.07] hover:bg-gray-200 dark:hover:bg-white/[0.12] rounded-xl px-3 h-9 text-sm transition-colors max-w-[180px]"
        >
          <selectedScenario.icon size={15} className="flex-shrink-0 text-gray-500 dark:text-gray-300" />
          <span className="font-medium truncate text-gray-800 dark:text-white">{selectedScenario.label}</span>
          {showScenarios
            ? <ChevronUp size={13} className="text-gray-400 flex-shrink-0" />
            : <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />}
        </button>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <>
              <button onClick={handleReset} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors">
                <RefreshCw size={16} />
              </button>
              <button onClick={handleSave} disabled={isSaving} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors disabled:opacity-40">
                {isSaving
                  ? <div className="w-4 h-4 border border-gray-400 border-t-gray-700 dark:border-gray-500 dark:border-t-gray-300 rounded-full animate-spin" />
                  : <Save size={16} />
                }
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scenario picker */}
      <AnimatePresence>
        {showScenarios && (
          <motion.div
            className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/[0.06] p-4 grid grid-cols-2 gap-2 z-40"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {SCENARIOS.map((sc) => (
              <button
                key={sc.label}
                onClick={() => { setSelectedScenario(sc); setShowScenarios(false); handleReset(); }}
                className={cn(
                  'flex items-center gap-2.5 p-3 rounded-xl text-sm text-left transition-all',
                  selectedScenario.label === sc.label
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
                )}
              >
                <sc.icon size={16} className={selectedScenario.label === sc.label ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                <span className="font-medium leading-tight">{sc.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-16">
            <motion.div
              className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center mb-5"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <selectedScenario.icon size={36} className="text-gray-500 dark:text-white/80" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedScenario.label}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              {selectedScenario.prompt}
            </p>
            {!isSupported && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/40 rounded-xl p-3 text-xs text-yellow-700 dark:text-yellow-300 max-w-xs">
                Voice not supported in this browser. Use Chrome or Safari for the best experience.
              </div>
            )}
            {isSupported && (
              <p className="text-sm text-gray-400 dark:text-gray-500">Hold the mic below and speak French!</p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn('flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-1">
                S
              </div>
            )}
            <div className={cn(
              'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-brand-blue text-white rounded-br-sm'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Interim text */}
        {interimText && (
          <motion.div className="flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="max-w-[78%] bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/40 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-blue-700 dark:text-blue-300 italic">
              {interimText}…
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Corrections panel */}
      <AnimatePresence>
        {corrections.length > 0 && (
          <motion.div
            className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200 dark:border-white/[0.06]"
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
          >
            <button
              onClick={() => setShowCorrections(!showCorrections)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm"
            >
              <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
                <Sparkles size={14} />
                <span className="font-semibold">{corrections.length} correction{corrections.length > 1 ? 's' : ''}</span>
              </div>
              <ChevronDown size={14} className={cn('text-gray-400 dark:text-gray-500 transition-transform', showCorrections && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {showCorrections && (
                <motion.div
                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 space-y-2 max-h-36 overflow-y-auto">
                    {corrections.map((c, i) => (
                      <div key={i} className="text-xs flex flex-wrap gap-1 items-center">
                        <span className="line-through text-red-500 dark:text-red-400">{c.original}</span>
                        <span className="text-gray-400 dark:text-gray-500">→</span>
                        <span className="font-semibold text-emerald-600 dark:text-green-400">{c.corrected}</span>
                        {c.explanation && <span className="text-gray-400 dark:text-gray-500">· {c.explanation}</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice controls */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur border-t border-gray-200 dark:border-white/[0.04] flex flex-col items-center py-7 gap-4 pb-safe">
        {orbState === 'speaking' && (
          <VoiceWave isActive barCount={7} className="text-emerald-500 dark:text-emerald-400 h-8" />
        )}
        <VoiceOrb state={orbState} onPress={handleOrbPress} onRelease={orbState === 'listening' ? stopListening : undefined} />
      </div>
    </div>
  );
}

export default function VoicePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-900 dark:text-white">Loading…</div>}>
        <VoiceChatContent />
      </Suspense>
    </ProtectedRoute>
  );
}
