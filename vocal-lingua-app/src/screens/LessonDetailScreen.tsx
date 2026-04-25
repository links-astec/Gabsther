import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation';
import { lessonsApi, userApi } from '@/api';
import type { LessonDetail, VocabItem, Phrase } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LessonDetail'>;
  route: RouteProp<RootStackParamList, 'LessonDetail'>;
};

type Phase = 'intro' | 'vocabulary' | 'phrases' | 'grammar' | 'complete';

function speak(text: string) {
  Speech.speak(text, { language: 'fr-FR', rate: 0.8, pitch: 1.0 });
}

/* ── Vocabulary Flashcard ─────────────────────────────────────────────────── */
function VocabCard({ item, onNext, isLast }: { item: VocabItem; onNext: () => void; isLast: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFlipped(false);
    Animated.timing(flipAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start();
  }, [item.word]);

  const handleFlip = () => {
    if (flipped) return;
    Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true, bounciness: 4 }).start();
    setFlipped(true);
  };

  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  return (
    <View style={vc.wrapper}>
      <TouchableOpacity style={vc.card} onPress={handleFlip} activeOpacity={0.9}>
        {/* Front */}
        <Animated.View style={[vc.face, vc.front, { opacity: frontOpacity }]}>
          <Text style={vc.word}>{item.word}</Text>
          <Text style={vc.hint}>Tap to reveal</Text>
        </Animated.View>
        {/* Back */}
        <Animated.View style={[vc.face, vc.back, { opacity: backOpacity }]}>
          <Text style={vc.translation}>{item.translation}</Text>
          {item.pronunciation && (
            <Text style={vc.pronunciation}>/{item.pronunciation}/</Text>
          )}
          <TouchableOpacity
            style={vc.listenBtn}
            onPress={() => speak(item.word)}
            activeOpacity={0.8}
          >
            <Text style={vc.listenText}>🔊 Listen</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {flipped && (
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 24 }]}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>{isLast ? 'Continue' : 'Next Word'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const vc = StyleSheet.create({
  wrapper: { alignItems: 'center', flex: 1 },
  card: {
    width: '100%', height: 200, borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  face: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 24 },
  front: { backgroundColor: '#fff', borderRadius: 24 },
  back: { backgroundColor: '#1d4ed8', borderRadius: 24 },
  word: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 8 },
  hint: { fontSize: 13, color: '#9ca3af' },
  translation: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6, textAlign: 'center' },
  pronunciation: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', marginBottom: 16 },
  listenBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  listenText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

/* ── Phrase Card ──────────────────────────────────────────────────────────── */
function PhraseCard({ item, onNext, isLast }: { item: Phrase; onNext: () => void; isLast: boolean }) {
  return (
    <View style={pc.wrapper}>
      <View style={pc.card}>
        <Text style={pc.french}>{item.french}</Text>
        <Text style={pc.english}>{item.english}</Text>
        {item.usage && <Text style={pc.usage}>{item.usage}</Text>}
        <TouchableOpacity style={pc.listenBtn} onPress={() => speak(item.french)} activeOpacity={0.8}>
          <Text style={pc.listenText}>🔊 Listen</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 24 }]}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>{isLast ? 'Continue' : 'Next Phrase'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const pc = StyleSheet.create({
  wrapper: { alignItems: 'center', flex: 1 },
  card: {
    width: '100%', borderRadius: 24, padding: 28, alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  french: { fontSize: 26, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 10 },
  english: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 8 },
  usage: { fontSize: 13, color: '#1d4ed8', fontStyle: 'italic', textAlign: 'center', marginBottom: 16 },
  listenBtn: {
    backgroundColor: '#eff6ff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8,
  },
  listenText: { color: '#1d4ed8', fontWeight: '700', fontSize: 14 },
});

/* ── Main Screen ──────────────────────────────────────────────────────────── */
export function LessonDetailScreen({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    lessonsApi.get(lessonId)
      .then(setLesson)
      .catch(() => Alert.alert('Error', 'Could not load lesson.'))
      .finally(() => setLoading(false));
    return () => { Speech.stop(); };
  }, [lessonId]);

  /* Build ordered phase list based on content */
  const phases = useCallback((): Phase[] => {
    if (!lesson) return ['intro', 'complete'];
    const list: Phase[] = ['intro'];
    if ((lesson.content.vocabulary ?? []).length > 0) list.push('vocabulary');
    if ((lesson.content.phrases ?? []).length > 0) list.push('phrases');
    if (lesson.content.grammar_notes) list.push('grammar');
    list.push('complete');
    return list;
  }, [lesson]);

  const phaseList = phases();
  const phaseIdx = phaseList.indexOf(phase);
  const progress = phaseList.length > 1 ? phaseIdx / (phaseList.length - 1) : 0;

  const advance = () => {
    const next = phaseList[phaseIdx + 1];
    if (next) {
      setPhase(next);
      setVocabIndex(0);
      setPhraseIndex(0);
    }
  };

  const handleComplete = useCallback(async () => {
    if (!lesson || completing) return;
    setCompleting(true);
    try {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      await lessonsApi.markComplete(lesson.id, 100, elapsed);
      await userApi.recordActivity('lesson');
      setLesson((prev) => prev ? { ...prev, is_completed: true } : prev);
    } catch { /* best-effort */ } finally {
      setCompleting(false);
      setPhase('complete');
    }
  }, [lesson, completing]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Lesson not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const vocab   = lesson.content.vocabulary ?? [];
  const phrases = lesson.content.phrases ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with progress bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => phase === 'intro' ? navigation.goBack() : setPhase(phaseList[phaseIdx - 1])}
        >
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>

        <View style={styles.xpPill}>
          <Text style={styles.xpText}>⚡ {lesson.xp_reward}</Text>
        </View>
      </View>

      {/* Phase tab strip (non-intro/complete) */}
      {phase !== 'intro' && phase !== 'complete' && (
        <View style={styles.tabStrip}>
          {phaseList.filter((p) => p !== 'intro' && p !== 'complete').map((p, i) => (
            <View
              key={p}
              style={[
                styles.tab,
                p === phase && styles.tabActive,
                i < phaseList.filter((x) => x !== 'intro' && x !== 'complete').indexOf(phase) && styles.tabDone,
              ]}
            >
              <Text style={[
                styles.tabText,
                p === phase && styles.tabTextActive,
              ]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <View style={styles.introSection}>
            <View style={styles.introIcon}>
              <Text style={styles.introEmoji}>{lesson.thumbnail_emoji}</Text>
            </View>

            <View style={styles.introMeta}>
              <View style={styles.introBadgeRow}>
                <View style={styles.diffBadge}>
                  <Text style={styles.diffBadgeText}>{lesson.difficulty}</Text>
                </View>
                <Text style={styles.introCategory}>{lesson.category.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.introTitle}>{lesson.title}</Text>
              {!!lesson.subtitle && (
                <Text style={styles.introSubtitle}>{lesson.subtitle}</Text>
              )}
            </View>

            {/* What you'll learn */}
            <View style={styles.learnCard}>
              <Text style={styles.learnLabel}>IN THIS LESSON</Text>
              {vocab.length > 0 && (
                <View style={styles.learnRow}>
                  <View style={[styles.learnIcon, { backgroundColor: '#eff6ff' }]}>
                    <Text>📚</Text>
                  </View>
                  <Text style={styles.learnText}>{vocab.length} vocabulary words</Text>
                </View>
              )}
              {phrases.length > 0 && (
                <View style={styles.learnRow}>
                  <View style={[styles.learnIcon, { backgroundColor: '#f5f3ff' }]}>
                    <Text>💬</Text>
                  </View>
                  <Text style={styles.learnText}>{phrases.length} key phrases</Text>
                </View>
              )}
              {!!lesson.content.grammar_notes && (
                <View style={styles.learnRow}>
                  <View style={[styles.learnIcon, { backgroundColor: '#fefce8' }]}>
                    <Text>✏️</Text>
                  </View>
                  <Text style={styles.learnText}>Grammar notes</Text>
                </View>
              )}
            </View>

            <View style={styles.introStats}>
              <Text style={styles.introStat}>{lesson.duration_minutes} min</Text>
              <Text style={styles.introDot}>·</Text>
              <Text style={[styles.introStat, { color: '#f59e0b', fontWeight: '700' }]}>
                ⚡ {lesson.xp_reward} XP
              </Text>
              {lesson.is_completed && (
                <>
                  <Text style={styles.introDot}>·</Text>
                  <Text style={[styles.introStat, { color: '#10b981', fontWeight: '700' }]}>
                    ✓ Completed
                  </Text>
                </>
              )}
            </View>

            <View style={styles.introBtns}>
              <TouchableOpacity style={styles.primaryBtn} onPress={advance} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>
                  {lesson.is_completed ? 'Review Lesson' : 'Start Lesson'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('VoiceChat', { lessonId: lesson.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>🎙 Practice</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── VOCABULARY ── */}
        {phase === 'vocabulary' && vocab.length > 0 && (
          <View style={styles.phaseSection}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseTitle}>Vocabulary</Text>
              <Text style={styles.phaseCount}>{vocabIndex + 1} of {vocab.length}</Text>
            </View>
            <View style={styles.dotRow}>
              {vocab.map((_, i) => (
                <View key={i} style={[styles.dot, i <= vocabIndex && styles.dotActive]} />
              ))}
            </View>
            <VocabCard
              item={vocab[vocabIndex]}
              isLast={vocabIndex + 1 >= vocab.length}
              onNext={() => {
                if (vocabIndex + 1 < vocab.length) setVocabIndex(vocabIndex + 1);
                else advance();
              }}
            />
          </View>
        )}

        {/* ── PHRASES ── */}
        {phase === 'phrases' && phrases.length > 0 && (
          <View style={styles.phaseSection}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseTitle}>Key Phrases</Text>
              <Text style={styles.phaseCount}>{phraseIndex + 1} of {phrases.length}</Text>
            </View>
            <View style={styles.dotRow}>
              {phrases.map((_, i) => (
                <View key={i} style={[styles.dot, i <= phraseIndex && styles.dotActive]} />
              ))}
            </View>
            <PhraseCard
              item={phrases[phraseIndex]}
              isLast={phraseIndex + 1 >= phrases.length}
              onNext={() => {
                if (phraseIndex + 1 < phrases.length) setPhraseIndex(phraseIndex + 1);
                else advance();
              }}
            />
          </View>
        )}

        {/* ── GRAMMAR ── */}
        {phase === 'grammar' && (
          <View style={styles.phaseSection}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseTitle}>Grammar Notes</Text>
            </View>
            <View style={styles.grammarCard}>
              <Text style={styles.grammarTitle}>📖 Key Concepts</Text>
              <Text style={styles.grammarText}>{lesson.content.grammar_notes}</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={advance} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── COMPLETE ── */}
        {phase === 'complete' && (
          <View style={styles.completeSection}>
            <Text style={styles.trophyEmoji}>🏆</Text>
            <Text style={styles.completeTitle}>Lesson Complete!</Text>
            <Text style={styles.completeSub}>You've finished {lesson.title}</Text>

            <View style={styles.xpAward}>
              <Text style={styles.xpAwardText}>⚡ +{lesson.xp_reward} XP</Text>
            </View>

            {!lesson.is_completed && (
              <TouchableOpacity
                style={[styles.primaryBtn, { width: '100%' }]}
                onPress={handleComplete}
                disabled={completing}
                activeOpacity={0.85}
              >
                {completing
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>Claim Reward</Text>
                }
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.secondaryBtn, { width: '100%' }]}
              onPress={() => navigation.navigate('VoiceChat', { lessonId: lesson.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>🎙 Practice Speaking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLessonsBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLessonsText}>← Back to Lessons</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#6b7280' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  headerBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f9fafb', borderRadius: 10,
  },
  headerBtnText: { fontSize: 20, color: '#374151' },
  progressTrack: {
    flex: 1, height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden',
  },
  progressFill: { height: 10, backgroundColor: '#1d4ed8', borderRadius: 5 },
  xpPill: {
    backgroundColor: '#fef9c3', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  xpText: { fontSize: 13, fontWeight: '800', color: '#92400e' },

  // Tab strip
  tabStrip: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    paddingHorizontal: 16,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1d4ed8' },
  tabDone: { borderBottomColor: '#10b981' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  tabTextActive: { color: '#1d4ed8' },

  content: { flexGrow: 1, padding: 20, paddingBottom: 40 },

  // Intro
  introSection: { alignItems: 'center', gap: 20 },
  introIcon: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
    borderWidth: 1, borderColor: '#e0e7ff',
  },
  introEmoji: { fontSize: 44 },
  introMeta: { alignItems: 'center', gap: 6 },
  introBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  diffBadgeText: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  introCategory: { fontSize: 13, color: '#9ca3af', textTransform: 'capitalize' },
  introTitle: { fontSize: 24, fontWeight: '900', color: '#111827', textAlign: 'center' },
  introSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },

  learnCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  learnLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, marginBottom: 12 },
  learnRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  learnIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  learnText: { fontSize: 14, color: '#374151' },

  introStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  introStat: { fontSize: 14, color: '#6b7280' },
  introDot: { fontSize: 14, color: '#d1d5db' },

  introBtns: { width: '100%', gap: 10 },

  // Phase
  phaseSection: { flex: 1, gap: 16 },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phaseTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  phaseCount: { fontSize: 13, color: '#9ca3af' },
  dotRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb' },
  dotActive: { backgroundColor: '#1d4ed8' },

  // Grammar
  grammarCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    marginBottom: 8,
  },
  grammarTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  grammarText: { fontSize: 14, color: '#374151', lineHeight: 22 },

  // Complete
  completeSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 20 },
  trophyEmoji: { fontSize: 72, marginBottom: 4 },
  completeTitle: { fontSize: 28, fontWeight: '900', color: '#111827' },
  completeSub: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  xpAward: {
    backgroundColor: '#fef9c3', borderWidth: 1, borderColor: '#fde68a',
    borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 8,
  },
  xpAwardText: { fontSize: 22, fontWeight: '900', color: '#92400e' },
  backToLessonsBtn: { marginTop: 4 },
  backToLessonsText: { fontSize: 14, color: '#6b7280', fontWeight: '600' },

  // Shared buttons
  primaryBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  secondaryBtnText: { color: '#374151', fontWeight: '600', fontSize: 15 },
});
