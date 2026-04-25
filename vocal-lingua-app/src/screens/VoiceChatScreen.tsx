import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';

type SpeechResultsEvent = { value?: string[] };
type SpeechErrorEvent = { error?: { message?: string } };

// In Expo Go: use the no-op stub (real module requires a dev build).
import Voice from '@/mocks/Voice';
const isExpoGo = Constants.appOwnership === 'expo';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, MainTabParamList } from '@/navigation';
import { VoiceOrb, type OrbState } from '@/components/VoiceOrb';
import { voiceApi, lessonsApi, userApi } from '@/api';
import type { ChatMessage, Correction, LessonDetail } from '@/types';

// Used both as a tab screen (Speak, no params) and stack screen (VoiceChat, with lessonId)
type Props = {
  navigation: any;
  route: RouteProp<RootStackParamList, 'VoiceChat'> | RouteProp<MainTabParamList, 'Speak'>;
};

const SCENARIOS = [
  { emoji: '☕', label: 'At the Café', prompt: 'You are ordering coffee and a croissant at a Parisian café.' },
  { emoji: '🛒', label: 'Grocery Shopping', prompt: 'You are shopping for fruit and vegetables at a French market.' },
  { emoji: '📍', label: 'Asking Directions', prompt: 'You are lost in Paris and asking a local for directions to the Eiffel Tower.' },
  { emoji: '🏨', label: 'Hotel Check-in', prompt: 'You are checking into a Paris hotel and asking about amenities.' },
  { emoji: '👋', label: 'Meeting Someone', prompt: 'You are meeting a French person at a social event and making small talk.' },
  { emoji: '🍽️', label: 'Restaurant', prompt: 'You are dining at a French restaurant and ordering a full meal.' },
  { emoji: '💼', label: 'Job Interview', prompt: 'You are interviewing for a position at a French company.' },
  { emoji: '💬', label: 'Free Chat', prompt: 'Have a free-flowing conversation to practice your French.' },
];

function frenchOnly(text: string) {
  return text.replace(/\s*\([^)]*\)/g, '').trim();
}

export function VoiceChatScreen({ navigation, route }: Props) {
  const { lessonId, scenario: routeScenario } = route.params ?? {};

  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [showCorrections, setShowCorrections] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [, setLesson] = useState<LessonDetail | null>(null);
  const [interimText, setInterimText] = useState('');

  const sessionStart = useRef(Date.now());
  const scrollRef = useRef<ScrollView>(null);
  const scenarioRef = useRef(
    routeScenario ?? { emoji: '💬', label: 'Free Chat', prompt: 'Have a free-flowing conversation to practice your French.' }
  );
  const [scenarioLabel, setScenarioLabel] = useState(scenarioRef.current.label);

  // Load lesson detail when coming from a lesson
  useEffect(() => {
    if (!lessonId) return;
    lessonsApi.get(lessonId).then((l) => {
      setLesson(l);
      if (l.scenario_prompt) {
        scenarioRef.current = { emoji: '📖', label: l.title, prompt: l.scenario_prompt };
        setScenarioLabel(l.title);
      }
    }).catch(() => {});
  }, [lessonId]);

  // Wire up Voice event handlers
  useEffect(() => {
    if (!Voice) return;
    Voice.onSpeechStart = () => setOrbState('listening');
    Voice.onSpeechEnd = () => setInterimText('');
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => setInterimText(e.value?.[0] ?? '');
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0];
      if (text) handleTranscript(text);
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.warn('Voice error:', e.error);
      setOrbState('idle');
      setInterimText('');
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Speech.stop();
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, interimText]);

  const startListening = useCallback(async () => {
    if (isExpoGo) {
      Alert.alert(
        'Expo Go preview',
        'Voice recognition requires a development build. You can see the full UI here, but mic input only works in the real app.',
      );
      return;
    }
    try {
      await Speech.stop();
      setOrbState('listening');
      await Voice.start('fr-FR');
    } catch (err) {
      console.warn('Failed to start listening:', err);
      setOrbState('idle');
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!Voice) return;
    try { await Voice.stop(); } catch { /* ignore */ }
  }, []);

  const speakReply = useCallback((text: string, onDone?: () => void) => {
    setOrbState('speaking');
    Speech.speak(frenchOnly(text), {
      language: 'fr-FR',
      rate: Platform.OS === 'ios' ? 0.5 : 0.9,
      pitch: 1.1,
      onDone: () => { setOrbState('idle'); onDone?.(); },
      onStopped: () => setOrbState('idle'),
      onError: () => setOrbState('idle'),
    });
  }, []);

  const handleTranscript = useCallback(async (text: string) => {
    setInterimText('');
    setOrbState('processing');

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const currentMessages = await new Promise<ChatMessage[]>((resolve) => {
        setMessages((prev) => { resolve(prev); return prev; });
      });
      const history = currentMessages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const response = await voiceApi.chat({
        message: text,
        language_code: 'fr',
        scenario: scenarioRef.current.prompt,
        history,
        lesson_id: lessonId,
      });

      const aiMsg: ChatMessage = { role: 'assistant', content: response.reply, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      if (response.corrections.length > 0) setCorrections((prev) => [...prev, ...response.corrections]);

      speakReply(response.reply, () => startListening());
    } catch (err: unknown) {
      setOrbState('idle');
      const errMsg = err instanceof Error && err.message === 'SESSION_EXPIRED'
        ? 'Your session expired. Please log in again.'
        : "Désolée, une erreur s'est produite. Please try again!";
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg, timestamp: new Date().toISOString() }]);
    }
  }, [lessonId, speakReply, startListening]);

  const handleOrbPress = useCallback(() => {
    if (orbState === 'idle') startListening();
    else if (orbState === 'listening') stopListening();
    else if (orbState === 'speaking') { Speech.stop(); setOrbState('idle'); }
  }, [orbState, startListening, stopListening]);

  const handleReplay = useCallback((content: string) => {
    Speech.stop();
    speakReply(content);
  }, [speakReply]);

  const handleSave = async () => {
    if (!messages.length) return;
    setIsSaving(true);
    try {
      await voiceApi.saveSession({
        lesson: lessonId,
        transcript: messages,
        corrections,
        scenario: scenarioRef.current.label,
        duration_seconds: Math.floor((Date.now() - sessionStart.current) / 1000),
        messages_sent: messages.filter((m) => m.role === 'user').length,
      });
      await userApi.recordActivity('voice');
      Alert.alert('Saved!', 'Your conversation has been saved.');
    } catch {
      Alert.alert('Error', 'Could not save session.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Speech.stop();
    Voice?.destroy();
    setMessages([]);
    setCorrections([]);
    setInterimText('');
    setOrbState('idle');
  };

  const selectScenario = (sc: typeof SCENARIOS[0]) => {
    scenarioRef.current = sc;
    setScenarioLabel(sc.label);
    setShowScenarios(false);
    handleReset();
  };

  const orbLabel = {
    idle: 'Tap to speak',
    listening: 'Listening… tap to stop',
    processing: 'Sophie is thinking…',
    speaking: 'Sophie is speaking…',
  }[orbState];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => { Speech.stop(); Voice?.destroy(); navigation.goBack(); }}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>←</Text>
          </TouchableOpacity>
        )}
        {!navigation.canGoBack() && <View style={styles.headerBtn} />}

        <TouchableOpacity
          style={styles.scenarioPill}
          onPress={() => setShowScenarios(!showScenarios)}
          activeOpacity={0.75}
        >
          <Text style={styles.scenarioPillEmoji}>{scenarioRef.current.emoji}</Text>
          <Text style={styles.scenarioPillLabel} numberOfLines={1}>{scenarioLabel}</Text>
          <Text style={styles.scenarioPillChevron}>{showScenarios ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {messages.length > 0 && (
            <>
              <TouchableOpacity onPress={handleReset} style={styles.headerBtn}>
                <Text style={styles.headerBtnText}>↺</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.headerBtn}>
                {isSaving
                  ? <ActivityIndicator size="small" color="#6b7280" />
                  : <Text style={styles.headerBtnText}>💾</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Scenario picker */}
      {showScenarios && (
        <View style={styles.scenarioPicker}>
          {SCENARIOS.map((sc) => (
            <TouchableOpacity
              key={sc.label}
              style={[
                styles.scenarioItem,
                scenarioRef.current.label === sc.label && styles.scenarioItemActive,
              ]}
              onPress={() => selectScenario(sc)}
              activeOpacity={0.75}
            >
              <Text style={styles.scenarioItemEmoji}>{sc.emoji}</Text>
              <Text style={[
                styles.scenarioItemLabel,
                scenarioRef.current.label === sc.label && styles.scenarioItemLabelActive,
              ]}>
                {sc.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{scenarioRef.current.emoji}</Text>
            <Text style={styles.emptyTitle}>{scenarioRef.current.label}</Text>
            <Text style={styles.emptyDesc}>{scenarioRef.current.prompt}</Text>
            <Text style={styles.emptyHint}>
              {isExpoGo ? 'Voice input works in a dev build. You can preview the UI here.' : 'Tap the orb below and speak French!'}
            </Text>
          </View>
        )}

        {messages.map((msg, i) => (
          <View key={i} style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowAI]}>
            {msg.role === 'assistant' && (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>S</Text>
              </View>
            )}
            <View style={[styles.msgBubbleWrapper, msg.role === 'user' && styles.msgBubbleWrapperUser]}>
              <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                <Text style={[styles.bubbleText, msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI]}>
                  {msg.content}
                </Text>
              </View>
              {msg.role === 'assistant' && (
                <TouchableOpacity onPress={() => handleReplay(msg.content)} style={styles.replayBtn}>
                  <Text style={styles.replayText}>🔊 Replay</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {interimText ? (
          <View style={[styles.msgRow, styles.msgRowUser]}>
            <View style={styles.interimBubble}>
              <Text style={styles.interimText}>{interimText}…</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Corrections panel */}
      {corrections.length > 0 && (
        <View style={styles.corrections}>
          <TouchableOpacity
            onPress={() => setShowCorrections(!showCorrections)}
            style={styles.correctionsHeader}
          >
            <Text style={styles.correctionsTitle}>
              ✨ {corrections.length} correction{corrections.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.correctionsChevron}>{showCorrections ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showCorrections && (
            <ScrollView style={styles.correctionsList} nestedScrollEnabled>
              {corrections.map((c, i) => (
                <View key={i} style={styles.correctionItem}>
                  <Text style={styles.correctionOriginal}>{c.original}</Text>
                  <Text style={styles.correctionArrow}> → </Text>
                  <Text style={styles.correctionFixed}>{c.corrected}</Text>
                  {c.explanation ? <Text style={styles.correctionExplanation}> · {c.explanation}</Text> : null}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Voice controls */}
      <View style={styles.controls}>
        <Text style={styles.orbLabel}>{orbLabel}</Text>
        <VoiceOrb state={orbState} onPress={handleOrbPress} size={76} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f4f6' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    gap: 6,
  },
  headerBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f9fafb', borderRadius: 10,
  },
  headerBtnText: { fontSize: 18, color: '#374151' },
  scenarioPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
  },
  scenarioPillEmoji: { fontSize: 15 },
  scenarioPillLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  scenarioPillChevron: { fontSize: 10, color: '#9ca3af' },
  headerActions: { flexDirection: 'row', gap: 4 },

  // Scenario picker
  scenarioPicker: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  scenarioItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
  },
  scenarioItemActive: { backgroundColor: '#1d4ed8' },
  scenarioItemEmoji: { fontSize: 14 },
  scenarioItemLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  scenarioItemLabelActive: { color: '#fff' },

  // Messages
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8, flexGrow: 1 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  emptyHint: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },

  // Bubbles
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  avatar: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, flexShrink: 0,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  msgBubbleWrapper: { maxWidth: '75%', gap: 4 },
  msgBubbleWrapperUser: { alignItems: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: '#1d4ed8', borderBottomRightRadius: 4 },
  bubbleAI: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAI: { color: '#111827' },
  replayBtn: { paddingHorizontal: 4 },
  replayText: { fontSize: 12, color: '#9ca3af' },
  interimBubble: {
    maxWidth: '75%', backgroundColor: '#dbeafe', borderRadius: 14, borderBottomRightRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  interimText: { fontSize: 14, color: '#1e40af', fontStyle: 'italic' },

  // Corrections
  corrections: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', maxHeight: 160,
  },
  correctionsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  correctionsTitle: { fontSize: 14, fontWeight: '700', color: '#d97706' },
  correctionsChevron: { fontSize: 11, color: '#9ca3af' },
  correctionsList: { paddingHorizontal: 16, paddingBottom: 8 },
  correctionItem: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 },
  correctionOriginal: { fontSize: 13, color: '#ef4444', textDecorationLine: 'line-through' },
  correctionArrow: { fontSize: 13, color: '#9ca3af' },
  correctionFixed: { fontSize: 13, color: '#10b981', fontWeight: '600' },
  correctionExplanation: { fontSize: 12, color: '#9ca3af' },

  // Voice controls
  controls: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6',
    alignItems: 'center', paddingTop: 12, paddingBottom: 24,
    gap: 4,
  },
  orbLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
});
