import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  RefreshControl, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { userApi, lessonsApi } from '@/api';
import type { StreakSummary, LessonSummary } from '@/types';
import { LEVEL_LABELS } from '@/types';

const BADGES = [
  { emoji: '🎯', label: 'First Lesson',  stat: 'lessons', threshold: 1 },
  { emoji: '🔥', label: '7-Day Streak',  stat: 'streak',  threshold: 7 },
  { emoji: '📚', label: '10 Lessons',    stat: 'lessons', threshold: 10 },
  { emoji: '⚡', label: '500 XP',        stat: 'xp',      threshold: 500 },
  { emoji: '🏆', label: '30-Day Streak', stat: 'streak',  threshold: 30 },
  { emoji: '🌟', label: '1000 XP',       stat: 'xp',      threshold: 1000 },
];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  greetings:  { label: 'Greetings',   color: '#3b82f6' },
  food_drink: { label: 'Food & Drink', color: '#f97316' },
  travel:     { label: 'Travel',       color: '#0ea5e9' },
  grammar:    { label: 'Grammar',      color: '#8b5cf6' },
  roleplay:   { label: 'Role-play',    color: '#ec4899' },
  culture:    { label: 'Culture',      color: '#14b8a6' },
  business:   { label: 'Business',     color: '#6366f1' },
};

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

export function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast]  = useState('');
  const [saving, setSaving] = useState(false);

  // Daily goal state
  const [goalMinutes, setGoalMinutes] = useState(10);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        userApi.getStreak(),
        lessonsApi.list(1),
      ]);
      setStreak(s);
      setLessons(l.results);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), refreshUser()]);
    setRefreshing(false);
  };

  const startEdit = () => {
    setEditFirst(user?.first_name ?? '');
    setEditLast(user?.last_name ?? '');
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await userApi.updateMe({
        first_name: editFirst.trim(),
        last_name: editLast.trim(),
      });
      await refreshUser();
      setEditing(false);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const profile = user?.profile;
  const displayName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username || 'Learner';
  const level       = profile?.level ?? 'A1';
  const totalXP     = profile?.total_xp ?? 0;
  const lessonsCompleted = profile?.lessons_completed ?? 0;
  const currentStreak    = streak?.current_streak ?? 0;
  const longestStreak    = streak?.longest_streak ?? 0;

  const earnedBadges = BADGES.filter((b) => {
    if (b.stat === 'lessons') return lessonsCompleted >= b.threshold;
    if (b.stat === 'streak')  return longestStreak >= b.threshold;
    if (b.stat === 'xp')      return totalXP >= b.threshold;
    return false;
  });

  // Category progress
  const catStats: Record<string, { total: number; done: number }> = {};
  for (const l of lessons) {
    if (!catStats[l.category]) catStats[l.category] = { total: 0, done: 0 };
    catStats[l.category].total++;
    if (l.is_completed) catStats[l.category].done++;
  }

  // Activity last 7 days
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const dayIdx = d.getDay();
    return { key, label: DAY_LABELS[dayIdx], active: streak?.activity_dates?.includes(key) ?? false };
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1d4ed8" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ── */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(displayName)}</Text>
            </View>

            {/* Info / Edit form */}
            {editing ? (
              <View style={styles.editForm}>
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.editInput}
                    value={editFirst}
                    onChangeText={setEditFirst}
                    placeholder="First name"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={editLast}
                    onChangeText={setEditLast}
                    placeholder="Last name"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.editBtns}>
                  <TouchableOpacity style={styles.editSaveBtn} onPress={saveProfile} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.editSaveTxt}>Save</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editCancelBtn} onPress={cancelEdit}>
                    <Text style={styles.editCancelTxt}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.userInfo}>
                <Text style={styles.displayName}>{displayName}</Text>
                <Text style={styles.emailText}>{user?.email ?? ''}</Text>
                <View style={styles.levelRow}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>{level}</Text>
                  </View>
                  <Text style={styles.levelLabel}>{LEVEL_LABELS[level]}</Text>
                </View>
              </View>
            )}

            {!editing && (
              <TouchableOpacity onPress={startEdit} style={styles.editIconBtn} activeOpacity={0.7}>
                <Text style={styles.editIconText}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsDivider} />
          <View style={styles.statsRow}>
            {[
              { label: 'Lessons', value: lessonsCompleted },
              { label: 'Total XP', value: totalXP.toLocaleString() },
              { label: 'Best Streak', value: `${longestStreak}d` },
            ].map((s) => (
              <View key={s.label} style={styles.statCell}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Streak ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Streak</Text>
          <View style={styles.streakMain}>
            <View style={styles.streakBlock}>
              <Text style={styles.streakBigNum}>{currentStreak}</Text>
              <Text style={styles.streakSub}>current</Text>
            </View>
            <View style={styles.streakVDivider} />
            <View style={styles.streakBlock}>
              <Text style={styles.streakBigNum}>{longestStreak}</Text>
              <Text style={styles.streakSub}>best</Text>
            </View>
          </View>

          <Text style={styles.activityLabel}>Last 7 days</Text>
          <View style={styles.activityRow}>
            {last7.map((d) => (
              <View key={d.key} style={styles.activityDay}>
                <View style={[styles.activityDot, d.active && styles.activityDotOn]} />
                <Text style={[styles.activityDayLabel, d.active && styles.activityDayLabelOn]}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── XP Progress ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ XP Progress</Text>
          <View style={styles.xpRow}>
            <Text style={styles.xpBig}>{totalXP.toLocaleString()}</Text>
            <Text style={styles.xpUnit}>total XP</Text>
          </View>
          <View style={styles.xpLevelRow}>
            <Text style={styles.xpMeta}>Level {level}</Text>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.min((totalXP % 500) / 500 * 100, 100)}%` as any }]} />
            </View>
            <Text style={styles.xpMeta}>+{500 - (totalXP % 500)} XP</Text>
          </View>
        </View>

        {/* ── Category Progress ── */}
        {Object.keys(catStats).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Progress by Category</Text>
            {Object.entries(catStats).map(([cat, { total, done }]) => {
              const meta = CATEGORY_META[cat] ?? { label: cat, color: '#6b7280' };
              const pct = total > 0 ? done / total : 0;
              return (
                <View key={cat} style={styles.catRow}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>{meta.label}</Text>
                    <Text style={styles.catCount}>{done}/{total}</Text>
                  </View>
                  <View style={styles.catTrack}>
                    <View style={[styles.catFill, { width: `${pct * 100}%` as any, backgroundColor: meta.color }]} />
                  </View>
                </View>
              );
            })}
            <View style={styles.catSummaryRow}>
              <View style={styles.catSummaryCell}>
                <Text style={styles.catSummaryValue}>{lessons.length}</Text>
                <Text style={styles.catSummaryLabel}>Total</Text>
              </View>
              <View style={styles.catSummaryCell}>
                <Text style={styles.catSummaryValue}>{lessonsCompleted}</Text>
                <Text style={styles.catSummaryLabel}>Done</Text>
              </View>
              <View style={styles.catSummaryCell}>
                <Text style={styles.catSummaryValue}>
                  {lessons.length > 0 ? Math.round(lessonsCompleted / lessons.length * 100) : 0}%
                </Text>
                <Text style={styles.catSummaryLabel}>Completion</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Daily Goal ── */}
        <View style={styles.card}>
          <View style={styles.goalHeader}>
            <Text style={styles.cardTitle}>🎯 Daily Goal</Text>
            <TouchableOpacity onPress={() => setShowGoalPicker(!showGoalPicker)} activeOpacity={0.7}>
              <Text style={styles.goalEditLink}>{showGoalPicker ? 'Done' : 'Change'}</Text>
            </TouchableOpacity>
          </View>

          {showGoalPicker ? (
            <View style={styles.goalPicker}>
              {GOAL_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.goalOption, goalMinutes === m && styles.goalOptionActive]}
                  onPress={() => setGoalMinutes(m)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.goalOptionText, goalMinutes === m && styles.goalOptionTextActive]}>
                    {m} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.goalDisplay}>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: '40%' }]} />
              </View>
              <Text style={styles.goalValue}>{goalMinutes} min/day</Text>
            </View>
          )}
        </View>

        {/* ── Badges ── */}
        <View style={styles.card}>
          <View style={styles.badgeHeader}>
            <Text style={styles.cardTitle}>🏅 Badges</Text>
            <Text style={styles.badgeCount}>{earnedBadges.length}/{BADGES.length} earned</Text>
          </View>
          <View style={styles.badgeGrid}>
            {BADGES.map((b) => {
              const earned = earnedBadges.some((e) => e.label === b.label);
              return (
                <View key={b.label} style={[styles.badgeItem, earned && styles.badgeItemEarned]}>
                  <Text style={[styles.badgeEmoji, !earned && styles.badgeEmojiDimmed]}>{b.emoji}</Text>
                  <Text style={[styles.badgeLabel, earned && styles.badgeLabelEarned]}>{b.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Account info ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          {[
            { key: 'Name',  value: displayName },
            { key: 'Email', value: user?.email ?? '' },
            { key: 'Level', value: `${level} — ${LEVEL_LABELS[level]}` },
          ].map((row, i, arr) => (
            <View key={row.key}>
              <View style={styles.accountRow}>
                <Text style={styles.accountKey}>{row.key}</Text>
                <Text style={styles.accountVal} numberOfLines={1}>{row.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.accountDivider} />}
            </View>
          ))}
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Gabsther v1.0.0</Text>
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

  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  heading: { fontSize: 22, fontWeight: '800', color: '#111827' },

  scroll: { padding: 16, paddingBottom: 32, gap: 12 },

  // Profile card
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#f3f4f6', ...CARD_SHADOW,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#1d4ed8',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 22 },

  userInfo: { flex: 1 },
  displayName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  emailText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  levelBadge: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  levelBadgeText: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  levelLabel: { fontSize: 12, color: '#6b7280' },

  editIconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  editIconText: { fontSize: 18 },

  editForm: { flex: 1, gap: 8 },
  editRow: { flexDirection: 'row', gap: 8 },
  editInput: {
    flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#111827',
  },
  editBtns: { flexDirection: 'row', gap: 8 },
  editSaveBtn: {
    flex: 1, backgroundColor: '#1d4ed8', borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
  },
  editSaveTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  editCancelBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center',
  },
  editCancelTxt: { color: '#6b7280', fontWeight: '600', fontSize: 14 },

  statsDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 },
  statsRow: { flexDirection: 'row' },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  // Streak
  streakMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  streakBlock: { flex: 1, alignItems: 'center' },
  streakBigNum: { fontSize: 36, fontWeight: '900', color: '#111827' },
  streakSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  streakVDivider: { width: 1, height: 50, backgroundColor: '#f3f4f6' },
  activityLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', marginBottom: 10, letterSpacing: 0.5 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  activityDay: { alignItems: 'center', gap: 4 },
  activityDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#f3f4f6' },
  activityDotOn: { backgroundColor: '#1d4ed8' },
  activityDayLabel: { fontSize: 10, color: '#9ca3af' },
  activityDayLabelOn: { color: '#1d4ed8', fontWeight: '700' },

  // XP
  xpRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 },
  xpBig: { fontSize: 32, fontWeight: '900', color: '#111827' },
  xpUnit: { fontSize: 14, color: '#6b7280' },
  xpLevelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpMeta: { fontSize: 12, color: '#6b7280', flexShrink: 0 },
  xpTrack: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: 8, backgroundColor: '#1d4ed8', borderRadius: 4 },

  // Category progress
  catRow: { marginBottom: 12 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  catCount: { fontSize: 12, color: '#9ca3af' },
  catTrack: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  catFill: { height: 6, borderRadius: 3 },
  catSummaryRow: {
    flexDirection: 'row', marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
  catSummaryCell: { flex: 1, alignItems: 'center' },
  catSummaryValue: { fontSize: 18, fontWeight: '900', color: '#111827' },
  catSummaryLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  // Daily goal
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  goalEditLink: { fontSize: 13, fontWeight: '700', color: '#1d4ed8' },
  goalPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  goalOptionActive: { backgroundColor: '#1d4ed8' },
  goalOptionText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  goalOptionTextActive: { color: '#fff' },
  goalDisplay: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalTrack: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  goalFill: { height: 8, backgroundColor: '#1d4ed8', borderRadius: 4 },
  goalValue: { fontSize: 13, color: '#6b7280', fontWeight: '600', flexShrink: 0 },

  // Badges
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  badgeCount: { fontSize: 12, color: '#9ca3af' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: {
    width: '30%', alignItems: 'center', padding: 12, borderRadius: 14,
    borderWidth: 2, borderColor: '#f3f4f6', backgroundColor: '#f9fafb',
  },
  badgeItemEarned: { borderColor: '#fde68a', backgroundColor: '#fefce8' },
  badgeEmoji: { fontSize: 24, marginBottom: 4 },
  badgeEmojiDimmed: { opacity: 0.25 },
  badgeLabel: { fontSize: 10, fontWeight: '600', color: '#9ca3af', textAlign: 'center', lineHeight: 13 },
  badgeLabelEarned: { color: '#92400e' },

  // Account
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  accountDivider: { height: 1, backgroundColor: '#f9fafb' },
  accountKey: { fontSize: 14, color: '#6b7280' },
  accountVal: { fontSize: 14, fontWeight: '600', color: '#111827', maxWidth: '58%', textAlign: 'right' },

  signOutBtn: {
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fecaca', ...CARD_SHADOW,
  },
  signOutText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, color: '#d1d5db', marginTop: 4 },
});
