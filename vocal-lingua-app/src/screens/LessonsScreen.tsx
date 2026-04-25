import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TabScreenNavProp } from '@/navigation';
import { lessonsApi } from '@/api';
import type { LessonSummary, LessonCategory } from '@/types';

type Props = { navigation: TabScreenNavProp<'Lessons'> };

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  greetings:  { label: 'Greetings',   emoji: '👋', color: '#fff', bg: '#3b82f6' },
  food_drink: { label: 'Food & Drink', emoji: '🍽️', color: '#fff', bg: '#f97316' },
  travel:     { label: 'Travel',       emoji: '✈️', color: '#fff', bg: '#0ea5e9' },
  grammar:    { label: 'Grammar',      emoji: '✏️', color: '#fff', bg: '#8b5cf6' },
  roleplay:   { label: 'Role-play',    emoji: '🎭', color: '#fff', bg: '#ec4899' },
  culture:    { label: 'Culture',      emoji: '🗼', color: '#fff', bg: '#14b8a6' },
  business:   { label: 'Business',     emoji: '💼', color: '#fff', bg: '#6366f1' },
  numbers:    { label: 'Numbers',      emoji: '🔢', color: '#fff', bg: '#f59e0b' },
  family:     { label: 'Family',       emoji: '👨‍👩‍👧', color: '#fff', bg: '#10b981' },
  shopping:   { label: 'Shopping',     emoji: '🛍️', color: '#fff', bg: '#ef4444' },
  health:     { label: 'Health',       emoji: '🏥', color: '#fff', bg: '#06b6d4' },
  nature:     { label: 'Nature',       emoji: '🌿', color: '#fff', bg: '#22c55e' },
};

const DIFF_BG: Record<string, string> = {
  A1: '#dcfce7', A2: '#d1fae5', B1: '#fef9c3', B2: '#fef3c7', C1: '#fee2e2', C2: '#fce7f3',
};
const DIFF_TEXT: Record<string, string> = {
  A1: '#166534', A2: '#065f46', B1: '#854d0e', B2: '#92400e', C1: '#991b1b', C2: '#9d174d',
};

type LessonStatus = 'done' | 'current' | 'locked';

interface GroupedCategory {
  cat: string;
  lessons: LessonSummary[];
}

function LessonPathNode({
  lesson,
  status,
  onPress,
}: {
  lesson: LessonSummary;
  status: LessonStatus;
  onPress: () => void;
}) {
  const nodeColor = status === 'done' ? '#10b981' : status === 'current' ? '#1d4ed8' : '#e5e7eb';
  const borderColor = status === 'done' ? '#10b981' : status === 'current' ? '#1d4ed8' : '#d1d5db';

  return (
    <View style={styles.nodeRow}>
      {/* Left: dot + connector */}
      <View style={styles.nodeLeft}>
        <View style={[styles.nodeDot, { backgroundColor: nodeColor, borderColor }]}>
          {status === 'done' && <Text style={styles.nodeDotText}>✓</Text>}
          {status === 'current' && <Text style={styles.nodeDotText}>{lesson.order}</Text>}
          {status === 'locked' && <Text style={[styles.nodeDotText, { color: '#9ca3af' }]}>🔒</Text>}
        </View>
        <View style={styles.nodeConnector} />
      </View>

      {/* Right: card */}
      <TouchableOpacity
        style={[
          styles.nodeCard,
          status === 'done' && styles.nodeCardDone,
          status === 'current' && styles.nodeCardCurrent,
          status === 'locked' && styles.nodeCardLocked,
        ]}
        onPress={onPress}
        disabled={status === 'locked'}
        activeOpacity={0.75}
      >
        {status === 'current' && <View style={styles.nodeCardAccent} />}
        {status === 'done' && <View style={[styles.nodeCardAccent, { backgroundColor: '#10b981' }]} />}

        <View style={styles.nodeCardBody}>
          <View style={styles.nodeCardTop}>
            <View style={styles.nodeCardTitleRow}>
              <Text style={styles.nodeEmoji}>{lesson.thumbnail_emoji}</Text>
              <View style={styles.nodeCardText}>
                <Text style={[styles.nodeTitle, status === 'locked' && styles.nodeTitleLocked]} numberOfLines={1}>
                  {lesson.title}
                </Text>
                {!!lesson.subtitle && (
                  <Text style={styles.nodeSubtitle} numberOfLines={1}>{lesson.subtitle}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.nodeTags}>
            <View style={[styles.diffBadge, { backgroundColor: DIFF_BG[lesson.difficulty] ?? '#f3f4f6' }]}>
              <Text style={[styles.diffText, { color: DIFF_TEXT[lesson.difficulty] ?? '#374151' }]}>
                {lesson.difficulty}
              </Text>
            </View>
            <Text style={styles.nodeMeta}>{lesson.duration_minutes}m</Text>
            <Text style={styles.nodeXP}>{lesson.xp_reward} XP</Text>
          </View>

          {status !== 'locked' && (
            <View style={styles.nodeActions}>
              <View style={[
                styles.nodeActionBtn,
                status === 'current' ? styles.nodeActionPrimary : styles.nodeActionSecondary,
              ]}>
                <Text style={[
                  styles.nodeActionText,
                  status === 'current' ? styles.nodeActionTextPrimary : styles.nodeActionTextSecondary,
                ]}>
                  {status === 'done' ? 'Review' : 'Start Lesson'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function LessonsScreen({ navigation }: Props) {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (p = 1) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await lessonsApi.list(p);
      setLessons((prev) => p === 1 ? data.results : [...prev, ...data.results]);
      setHasMore(!!data.next);
      setPage(p);
    } catch { /* ignore */ } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(1); }, []);

  // Filter + sort
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const filtered = search.trim()
    ? sorted.filter((l) =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.category.toLowerCase().includes(search.toLowerCase())
      )
    : sorted;

  // Build status map
  const statusMap = new Map<number, LessonStatus>();
  let foundCurrent = false;
  for (const l of sorted) {
    if (l.is_completed) {
      statusMap.set(l.id, 'done');
    } else if (!foundCurrent) {
      statusMap.set(l.id, 'current');
      foundCurrent = true;
    } else {
      statusMap.set(l.id, 'locked');
    }
  }

  // Group by category (preserving order)
  const grouped: GroupedCategory[] = [];
  const seenCats = new Set<string>();
  for (const l of filtered) {
    if (!seenCats.has(l.category)) {
      seenCats.add(l.category);
      grouped.push({ cat: l.category, lessons: [] });
    }
    grouped[grouped.length - 1].lessons.push(l);
  }

  const completedCount = sorted.filter((l) => l.is_completed).length;
  const total = sorted.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Lessons</Text>
        <Text style={styles.headingSub}>{completedCount} of {total} completed</Text>
      </View>

      {/* Progress bar */}
      {total > 0 && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search lessons…"
          placeholderTextColor="#9ca3af"
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1d4ed8" size="large" />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No lessons found</Text>
          <Text style={styles.emptySub}>Try adjusting your search</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.cat}
          contentContainerStyle={styles.list}
          onEndReached={() => { if (hasMore && !loadingMore) load(page + 1); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#1d4ed8" style={{ marginVertical: 16 }} /> : null}
          renderItem={({ item: group }) => {
            const meta = CATEGORY_META[group.cat] ?? { label: group.cat, emoji: '📚', color: '#fff', bg: '#6b7280' };
            const catCompleted = group.lessons.filter((l) => l.is_completed).length;
            return (
              <View style={styles.categorySection}>
                {/* Unit header */}
                <View style={styles.unitHeader}>
                  <View style={[styles.unitIconBox, { backgroundColor: meta.bg }]}>
                    <Text style={styles.unitEmoji}>{meta.emoji}</Text>
                  </View>
                  <View style={styles.unitText}>
                    <Text style={styles.unitLabel}>UNIT</Text>
                    <Text style={styles.unitName}>{meta.label}</Text>
                  </View>
                  <View style={styles.unitSpacer} />
                  <Text style={styles.unitCount}>{catCompleted}/{group.lessons.length}</Text>
                </View>

                {/* Lesson path nodes */}
                {group.lessons.map((lesson) => (
                  <LessonPathNode
                    key={lesson.id}
                    lesson={lesson}
                    status={statusMap.get(lesson.id) ?? 'locked'}
                    onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
                  />
                ))}

                {/* Terminal dot */}
                <View style={styles.terminalRow}>
                  <View style={styles.terminalDot} />
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  heading: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headingSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  progressTrack: { height: 3, backgroundColor: '#f3f4f6' },
  progressFill: { height: 3, backgroundColor: '#1d4ed8' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginVertical: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 16, paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 14, marginRight: 6, color: '#9ca3af' },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: '#111827' },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 13, color: '#9ca3af' },

  list: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 4 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 14, color: '#9ca3af', marginTop: 4 },

  // Category section
  categorySection: { marginBottom: 24 },
  unitHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  unitIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unitEmoji: { fontSize: 16 },
  unitText: {},
  unitLabel: { fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8 },
  unitName: { fontSize: 13, fontWeight: '700', color: '#374151' },
  unitSpacer: { flex: 1, height: 1, backgroundColor: '#f3f4f6' },
  unitCount: { fontSize: 11, color: '#9ca3af' },

  // Path nodes
  nodeRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12, marginBottom: 0 },
  nodeLeft: { width: 36, alignItems: 'center', flexShrink: 0 },
  nodeDot: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeDotText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  nodeConnector: { width: 2, flex: 1, backgroundColor: '#f3f4f6', marginTop: 2 },

  nodeCard: {
    flex: 1, marginBottom: 10, borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6', ...CARD_SHADOW,
  },
  nodeCardDone: { borderColor: '#bbf7d0' },
  nodeCardCurrent: { borderColor: '#bfdbfe', shadowColor: '#1d4ed8', shadowOpacity: 0.1 },
  nodeCardLocked: { opacity: 0.55 },
  nodeCardAccent: { height: 3, backgroundColor: '#1d4ed8' },

  nodeCardBody: { padding: 12 },
  nodeCardTop: { marginBottom: 8 },
  nodeCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nodeEmoji: { fontSize: 22 },
  nodeCardText: { flex: 1 },
  nodeTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  nodeTitleLocked: { color: '#9ca3af' },
  nodeSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 1 },

  nodeTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  diffText: { fontSize: 11, fontWeight: '700' },
  nodeMeta: { fontSize: 11, color: '#9ca3af' },
  nodeXP: { fontSize: 11, fontWeight: '600', color: '#f59e0b' },

  nodeActions: { marginTop: 10 },
  nodeActionBtn: {
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center',
  },
  nodeActionPrimary: { backgroundColor: '#1d4ed8' },
  nodeActionSecondary: { backgroundColor: '#f3f4f6' },
  nodeActionText: { fontSize: 13, fontWeight: '700' },
  nodeActionTextPrimary: { color: '#fff' },
  nodeActionTextSecondary: { color: '#374151' },

  terminalRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 17 },
  terminalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb' },
});
