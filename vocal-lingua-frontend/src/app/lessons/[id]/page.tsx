'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mic, CheckCircle2, Volume2, BookOpen, X,
  ChevronRight, Trophy, Zap, Star,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { speak } from '@/lib/speechUtils';
import { lessonsApi } from '@/lib/api';
import { useStreak } from '@/hooks/useStreak';
import { cn } from '@/lib/utils';
import type { LessonDetail, QuizQuestion } from '@/types';

type Phase = 'intro' | 'vocabulary' | 'phrases' | 'grammar' | 'quiz' | 'complete';

/* ── Vocabulary Flashcard ──────────────────────────────────────────────────── */
function VocabCard({
  word,
  translation,
  pronunciation,
  onSpeak,
}: {
  word: string;
  translation: string;
  pronunciation?: string;
  onSpeak: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [word]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className="w-full cursor-pointer"
        style={{ perspective: 800 }}
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', height: 180 }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-3xl bg-white dark:bg-surface-dark-subtle border border-gray-100 dark:border-white/[0.08] card-shadow flex flex-col items-center justify-center gap-2"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-3xl font-black text-gray-900 dark:text-white">{word}</p>
            <p className="text-sm text-gray-400">Tap to reveal</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-3xl bg-brand-blue flex flex-col items-center justify-center gap-2"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-2xl font-black text-white">{translation}</p>
            {pronunciation && (
              <p className="text-sm text-blue-200 font-mono">/{pronunciation}/</p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onSpeak(); }}
              className="mt-1 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            >
              <Volume2 size={13} />
              Listen
            </button>
          </div>
        </motion.div>
      </div>
      {!flipped && (
        <p className="text-xs text-gray-400 dark:text-gray-500">Tap the card to reveal the translation</p>
      )}
    </div>
  );
}

/* ── Quiz Single Question ──────────────────────────────────────────────────── */
function QuizStep({
  question,
  qIndex,
  total,
  onAnswer,
}: {
  question: QuizQuestion;
  qIndex: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
        <span>Question {qIndex + 1} of {total}</span>
        <span className="font-semibold text-brand-blue dark:text-brand-blue-light">
          {Math.round(((qIndex) / total) * 100)}%
        </span>
      </div>
      {/* Mini progress */}
      <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden -mt-2">
        <motion.div
          className="h-full bg-brand-blue rounded-full"
          animate={{ width: `${(qIndex / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] card-shadow">
        <p className="font-bold text-gray-900 dark:text-white text-base mb-4">{question.question}</p>
        <div className="space-y-2.5">
          {question.options.map((opt, oi) => {
            const isSelected = selected === oi;
            const isCorrect = oi === question.answer;
            return (
              <button
                key={oi}
                onClick={() => handleSelect(oi)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium',
                  !answered
                    ? isSelected
                      ? 'border-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-blue-light'
                      : 'border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-brand-blue/40'
                    : isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : isSelected
                    ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                    : 'border-gray-100 dark:border-white/[0.05] text-gray-400',
                )}
              >
                <span className="font-black mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl p-4 flex items-center gap-3',
            selected === question.answer
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30'
              : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30',
          )}
        >
          {selected === question.answer
            ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
            : <X size={18} className="text-red-500 flex-shrink-0" />
          }
          <p className={cn(
            'text-sm font-semibold flex-1',
            selected === question.answer ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
          )}>
            {selected === question.answer ? 'Correct!' : `Correct: ${question.options[question.answer]}`}
          </p>
        </motion.div>
      )}

      {answered && (
        <button
          onClick={() => onAnswer(selected === question.answer)}
          className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue-mid transition-colors shadow-lg shadow-brand-blue/20"
        >
          Continue
        </button>
      )}
    </div>
  );
}

/* ── Main Lesson Page ──────────────────────────────────────────────────────── */
function LessonDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recordActivity } = useStreak();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    lessonsApi.get(Number(id)).then(setLesson).finally(() => setIsLoading(false));
  }, [id]);

  const handleSpeak = (text: string) => {
    speak(text, { language: lesson?.language.tts_locale || 'fr-FR' });
  };

  /* Determine ordered phases based on lesson content */
  const getPhases = (): Phase[] => {
    if (!lesson) return [];
    const phases: Phase[] = ['intro'];
    if ((lesson.content.vocabulary || []).length > 0) phases.push('vocabulary');
    if ((lesson.content.phrases || []).length > 0) phases.push('phrases');
    if (lesson.content.grammar_notes) phases.push('grammar');
    if ((lesson.content.quiz || []).length > 0) phases.push('quiz');
    phases.push('complete');
    return phases;
  };

  const phases = getPhases();
  const phaseIndex = phases.indexOf(phase);
  const contentPhases = phases.filter((p) => p !== 'intro' && p !== 'complete');
  const contentPhaseIndex = (phase !== 'intro' && phase !== 'complete') ? contentPhases.indexOf(phase) : -1;
  const progress = phaseIndex >= 0 ? phaseIndex / (phases.length - 1) : 0;

  const advancePhase = () => {
    const next = phases[phaseIndex + 1];
    if (next) {
      setPhase(next);
      setVocabIndex(0);
      setPhraseIndex(0);
      setQuizIndex(0);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    const questions = lesson.content.quiz || [];
    const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 100;
    try {
      await lessonsApi.markComplete(lesson.id, score, 300);
      await recordActivity('lesson');
      setLesson((prev) => prev ? { ...prev, is_completed: true } : prev);
    } catch (err) {
      console.warn('Failed to mark complete:', err);
    }
    setPhase('complete');
  };

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) setCorrectAnswers((c) => c + 1);
    const quiz = lesson?.content.quiz || [];
    if (quizIndex + 1 >= quiz.length) {
      // Last question — complete lesson
      setQuizIndex(quizIndex + 1);
      handleCompleteLesson();
    } else {
      setQuizIndex(quizIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle dark:bg-surface-dark">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!lesson) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle dark:bg-surface-dark">
      <p className="text-gray-500">Lesson not found.</p>
    </div>
  );

  const vocab = lesson.content.vocabulary || [];
  const phrases = lesson.content.phrases || [];
  const quiz = lesson.content.quiz || [];

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark-subtle border-b border-gray-100 dark:border-white/[0.06]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => phase === 'intro' ? router.back() : setPhase(phases[phaseIndex - 1])}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
          >
            <ArrowLeft size={19} />
          </button>

          {/* Step progress bar */}
          <div className="flex-1 h-2.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-blue to-indigo-500 rounded-full"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-amber-500">
            <Zap size={14} />
            <span className="text-sm font-black">{lesson.xp_reward}</span>
          </div>
        </div>
      </div>

      {/* Phase labels */}
      {phase !== 'intro' && phase !== 'complete' && contentPhases.length > 1 && (
        <div className="bg-white dark:bg-surface-dark-subtle border-b border-gray-100 dark:border-white/[0.06]">
          <div className="max-w-lg mx-auto px-4 flex overflow-x-auto scrollbar-hide">
            {contentPhases.map((p, i) => (
              <div key={p} className={cn(
                'flex-shrink-0 px-4 py-2.5 text-xs font-bold border-b-2 transition-all',
                p === phase
                  ? 'border-brand-blue text-brand-blue dark:text-brand-blue-light'
                  : i < contentPhaseIndex
                  ? 'border-emerald-400 text-emerald-500'
                  : 'border-transparent text-gray-400',
              )}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col">
        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 pb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center shadow-xl shadow-brand-blue/30">
                  <BookOpen size={32} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-brand-blue-light">
                      {lesson.difficulty}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{lesson.category.replace('_', ' ')}</span>
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{lesson.title}</h1>
                  {lesson.subtitle && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{lesson.subtitle}</p>
                  )}
                </div>

                {/* What you'll learn */}
                <div className="w-full bg-white dark:bg-surface-dark-subtle rounded-2xl p-4 border border-gray-100 dark:border-white/[0.06] text-left space-y-2.5">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">In this lesson</p>
                  {vocab.length > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={13} className="text-brand-blue" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{vocab.length} vocabulary words</span>
                    </div>
                  )}
                  {phrases.length > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
                        <ChevronRight size={13} className="text-violet-600" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{phrases.length} key phrases</span>
                    </div>
                  )}
                  {quiz.length > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                        <Star size={13} className="text-amber-500" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{quiz.length}-question quiz</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{lesson.duration_minutes} min</span>
                  <span>·</span>
                  <span className="text-amber-500 font-semibold flex items-center gap-1">
                    <Zap size={13} />{lesson.xp_reward} XP
                  </span>
                  {lesson.is_completed && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} />Completed
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={advancePhase}
                  className="flex-1 py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue-mid transition-colors shadow-lg shadow-brand-blue/20 text-base"
                >
                  {lesson.is_completed ? 'Review Lesson' : 'Start Lesson'}
                </button>
                <Link
                  href={`/voice?lesson=${lesson.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors font-medium text-sm"
                >
                  <Mic size={16} />
                  Practice
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── VOCABULARY ── */}
          {phase === 'vocabulary' && (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="text-center">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Vocabulary</h2>
                <p className="text-sm text-gray-400 mt-0.5">{vocabIndex + 1} of {vocab.length}</p>
              </div>

              {vocab[vocabIndex] && (
                <VocabCard
                  word={vocab[vocabIndex].word}
                  translation={vocab[vocabIndex].translation}
                  pronunciation={vocab[vocabIndex].pronunciation}
                  onSpeak={() => handleSpeak(vocab[vocabIndex].word)}
                />
              )}

              <div className="mt-auto">
                {vocabIndex + 1 < vocab.length ? (
                  <button
                    onClick={() => setVocabIndex(vocabIndex + 1)}
                    className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue-mid transition-colors shadow-lg shadow-brand-blue/20"
                  >
                    Next Word
                  </button>
                ) : (
                  <button
                    onClick={advancePhase}
                    className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Continue
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── PHRASES ── */}
          {phase === 'phrases' && (
            <motion.div
              key="phrases"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="text-center">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Key Phrases</h2>
                <p className="text-sm text-gray-400 mt-0.5">{phraseIndex + 1} of {phrases.length}</p>
              </div>

              <AnimatePresence mode="wait">
                {phrases[phraseIndex] && (
                  <motion.div
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="bg-white dark:bg-surface-dark-subtle rounded-3xl p-6 border border-gray-100 dark:border-white/[0.06] card-shadow text-center"
                  >
                    <p className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                      {phrases[phraseIndex].french}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{phrases[phraseIndex].english}</p>
                    {phrases[phraseIndex].usage && (
                      <p className="text-xs text-brand-blue dark:text-brand-blue-light italic mb-4">
                        {phrases[phraseIndex].usage}
                      </p>
                    )}
                    <button
                      onClick={() => handleSpeak(phrases[phraseIndex].french)}
                      className="inline-flex items-center gap-2 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-blue-light px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-blue/20 transition-colors"
                    >
                      <Volume2 size={14} />
                      Listen
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto">
                {phraseIndex + 1 < phrases.length ? (
                  <button
                    onClick={() => setPhraseIndex(phraseIndex + 1)}
                    className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue-mid transition-colors shadow-lg shadow-brand-blue/20"
                  >
                    Next Phrase
                  </button>
                ) : (
                  <button
                    onClick={advancePhase}
                    className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Continue
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── GRAMMAR ── */}
          {phase === 'grammar' && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="text-center">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Grammar Notes</h2>
              </div>

              <div className="bg-white dark:bg-surface-dark-subtle rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] card-shadow flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={18} className="text-brand-blue" />
                  <span className="font-bold text-gray-900 dark:text-white">Key Concepts</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {lesson.content.grammar_notes}
                </p>
              </div>

              <button
                onClick={advancePhase}
                className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue-mid transition-colors shadow-lg shadow-brand-blue/20"
              >
                Continue to Quiz
              </button>
            </motion.div>
          )}

          {/* ── QUIZ ── */}
          {phase === 'quiz' && quiz.length > 0 && quizIndex < quiz.length && (
            <motion.div
              key={`quiz-${quizIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col gap-4"
            >
              <div className="text-center">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Quiz Time</h2>
              </div>
              <QuizStep
                question={quiz[quizIndex]}
                qIndex={quizIndex}
                total={quiz.length}
                onAnswer={handleQuizAnswer}
              />
            </motion.div>
          )}

          {/* ── COMPLETE ── */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-5"
            >
              {/* Trophy animation */}
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-400/40"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                <Trophy size={44} className="text-white" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Lesson Complete!</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {quiz.length > 0
                    ? `${correctAnswers}/${quiz.length} quiz questions correct`
                    : 'Great work!'
                  }
                </p>
              </div>

              {/* XP badge */}
              <motion.div
                className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-5 py-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Zap size={18} className="text-amber-500" />
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">+{lesson.xp_reward} XP</span>
              </motion.div>

              {/* Score stars */}
              {quiz.length > 0 && (
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -30 }}
                      animate={{
                        opacity: 1, scale: 1, rotate: 0,
                        color: i < Math.round((correctAnswers / quiz.length) * 3) ? '#f59e0b' : '#e5e7eb',
                      }}
                      transition={{ delay: 0.4 + i * 0.15, type: 'spring', bounce: 0.5 }}
                    >
                      <Star
                        size={32}
                        className={i < Math.round((correctAnswers / quiz.length) * 3) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}
                        fill={i < Math.round((correctAnswers / quiz.length) * 3) ? 'currentColor' : 'none'}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 w-full mt-4">
                <Link
                  href="/lessons"
                  className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue-mid transition-colors shadow-lg shadow-brand-blue/20 text-center"
                >
                  Back to Lessons
                </Link>
                <Link
                  href={`/voice?lesson=${lesson.id}`}
                  className="w-full py-3.5 rounded-2xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Mic size={16} />
                  Practice Speaking
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LessonDetailPage() {
  return (
    <ProtectedRoute>
      <LessonDetailContent />
    </ProtectedRoute>
  );
}
