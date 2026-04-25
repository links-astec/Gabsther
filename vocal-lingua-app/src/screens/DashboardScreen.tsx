import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TabScreenNavProp } from '@/navigation';
import { useAuth } from '@/context/AuthContext';
import { userApi, lessonsApi } from '@/api';
import type { StreakSummary, LessonSummary } from '@/types';

type Props = { navigation: TabScreenNavProp<'Dashboard'> };

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [recentLessons, setRecentLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [streakData, lessonsData] = await Promise.all([
        userApi.getStreak(),
        lessonsApi.list(1),
      ]);
      setStreak(streakData);
      setRecentLessons(lessonsData.results.slice(0, 4));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const profile = user?.profile;
  const firstName = user?.first_name || user?.username || 'Learner';
  const currentStreak = streak?.current_streak ?? 0;
  const totalXP = profile?.total_xp ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const completedCount = recentLessons.filter((l) => l.is_completed).length;
  const goalMinutes = 10;
  const goalProgress = Math.min((completedCount * 5 / goalMinutes) * 100, 100);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Gabsther</Text>
          <Text style={styles.topBarSub}>French · {profile?.level ?? 'A1'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatarBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarBtnText}>
            {(user?.first_name?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1d4ed8" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>{greeting}, {firstName}!</Text>
          <Text style={styles.greetingSub}>
            {currentStreak > 0
              ? `You're on a ${currentStreak}-day streak — don't break it!`
              : 'Complete a lesson to start your streak'}
          </Text>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroDeco1} />
          <View style={styles.heroDeco2} />

          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroXPLabel}>⚡ TOTAL XP</Text>
              <Text style={styles.heroXP}>{totalXP.toLocaleString()}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{profile?.level ?? 'A1'}</Text>
                </View>
                <Text style={styles.heroLessonsLabel}>{profile?.lessons_completed ?? 0} lessons done</Text>
              </View>
            </View>

            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNum}>{currentStreak}</Text>
              <Text style={styles.streakDayLabel}>day streak</Text>
            </View>
          </View>

          {/* Daily goal bar */}
          <View style={styles.goalSection}>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>🎯 Daily goal</Text>
              <Text style={styles.goalValue}>{Math.min(completedCount * 5, goalMinutes)}/{goalMinutes} min</Text>
            </View>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${goalProgress}%` as any }]} />
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.speakCard}
            onPress={() => navigation.navigate('Speak')}
            activeOpacity={0.85}
          >
            <View style={styles.speakDeco} />
            <Text style={styles.actionIcon}>🎙</Text>
            <Text style={styles.speakTitle}>Start Speaking</Text>
            <Text style={styles.speakSub}>Talk with Sophie AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lessonsCard}
            onPress={() => navigation.navigate('Lessons')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.lessonsTitle}>Browse Lessons</Text>
            <Text style={styles.lessonsSub}>21 French lessons</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { emoji: '📖', label: 'Completed', value: profile?.lessons_completed ?? 0 },
            { emoji: '🔥', label: 'Streak', value: currentStreak },
            { emoji: '🏆', label: 'Best streak', value: streak?.longest_streak ?? 0 },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Continue learning */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Lessons')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading
          ? <ActivityIndicator style={{ marginTop: 8 }} color="#1d4ed8" />
          : recentLessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
              activeOpacity={0.75}
            >
              <Text style={styles.lessonEmoji}>{lesson.thumbnail_emoji}</Text>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonMeta}>
                  {lesson.difficulty} · {lesson.duration_minutes} min · {lesson.xp_reward} XP
                </Text>
              </View>
              {lesson.is_completed && (
                <View style={styles.doneCheck}>
                  <Text style={styles.doneCheckText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  topBarTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  topBarSub: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1d4ed8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  scroll: { padding: 20, paddingBottom: 24 },

  greeting: { marginBottom: 16 },
  greetingTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  greetingSub: { fontSize: 13, color: '#6b7280', marginTop: 3 },

  heroCard: {
    backgroundColor: '#1d4ed8', borderRadius: 24, padding: 20, marginBottom: 16,
    overflow: 'hidden',
  },
  heroDeco1: {
    position: 'absolute', top: -32, right: -32,
    width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroDeco2: {
    position: 'absolute', bottom: -20, right: -10,
    width: 75, height: 75, borderRadius: 37.5, backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLeft: { flex: 1 },
  heroXPLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, marginBottom: 2 },
  heroXP: { fontSize: 46, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  levelBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  levelText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  heroLessonsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  streakBadge: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, minWidth: 74,
  },
  streakFire: { fontSize: 22 },
  streakNum: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 34 },
  streakDayLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  goalSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  goalValue: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  goalTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },

  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  speakCard: {
    flex: 1, backgroundColor: '#ef4444', borderRadius: 20, padding: 16, overflow: 'hidden',
    shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  speakDeco: {
    position: 'absolute', top: -18, right: -18,
    width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionIcon: { fontSize: 26, marginBottom: 8 },
  speakTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  speakSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  lessonsCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#f3f4f6', ...CARD_SHADOW,
  },
  lessonsTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  lessonsSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', ...CARD_SHADOW,
  },
  statEmoji: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2, textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 14, color: '#1d4ed8', fontWeight: '600' },

  lessonCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: '#f3f4f6', ...CARD_SHADOW,
  },
  lessonEmoji: { fontSize: 28, marginRight: 14 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  lessonMeta: { fontSize: 12, color: '#6b7280', marginTop: 3 },
  doneCheck: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#dcfce7',
    alignItems: 'center', justifyContent: 'center',
  },
  doneCheckText: { fontSize: 12, color: '#16a34a', fontWeight: '700' },
});
