// ─────────────────────────────────────────────────────────────────────────────
// Gabsther — Shared TypeScript Types
// These mirror the Django API response shapes.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

// ─── User & Profile ───────────────────────────────────────────────────────────

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const LEVEL_LABELS: Record<Level, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

export interface UserProfile {
  id: number;
  level: Level;
  interests: string[];
  total_xp: number;
  lessons_completed: number;
  total_speaking_minutes: number;
  avatar_url: string;
  bio: string;
  daily_goal_minutes: number;
  current_language: number | null;
  current_language_code: string | null;
  current_language_name: string | null;
  current_language_flag: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string | null;
  profile: UserProfile;
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export interface StreakSummary {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  activity_dates: string[];
}

export interface StreakRecord {
  id: number;
  date: string;
  current_streak: number;
  longest_streak: number;
  activity_type: string;
}

export interface HeatmapData {
  start_date: string;
  end_date: string;
  data: Array<{
    date: string;
    current_streak: number;
    activity_type: string;
  }>;
}

// ─── Language ─────────────────────────────────────────────────────────────────

export interface Language {
  id: number;
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  tts_locale: string;
  is_active: boolean;
  order: number;
  lesson_count: number;
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export type LessonCategory =
  | 'greetings'
  | 'food_drink'
  | 'travel'
  | 'grammar'
  | 'roleplay'
  | 'culture'
  | 'business'
  | 'numbers'
  | 'family'
  | 'shopping'
  | 'health'
  | 'nature';

export const CATEGORY_LABELS: Record<LessonCategory, string> = {
  greetings: 'Greetings',
  food_drink: 'Food & Drink',
  travel: 'Travel',
  grammar: 'Grammar',
  roleplay: 'Role-play',
  culture: 'Culture',
  business: 'Business',
  numbers: 'Numbers',
  family: 'Family',
  shopping: 'Shopping',
  health: 'Health',
  nature: 'Nature',
};

export interface VocabItem {
  word: string;
  translation: string;
  pronunciation?: string;
  example?: string;
}

export interface Phrase {
  french: string;
  english: string;
  usage?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface LessonContent {
  vocabulary: VocabItem[];
  phrases: Phrase[];
  grammar_notes?: string;
  speaking_prompts?: string[];
  quiz?: QuizQuestion[];
}

export interface LessonSummary {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  category: LessonCategory;
  difficulty: Level;
  duration_minutes: number;
  xp_reward: number;
  thumbnail_emoji: string;
  order: number;
  is_free: boolean;
  is_published: boolean;
  language_name: string;
  language_flag: string;
  language_code: string;
  is_completed: boolean;
  user_score: number | null;
}

export interface LessonDetail extends LessonSummary {
  content: LessonContent;
  audio_script: string;
  scenario_prompt: string;
  language: Language;
  user_progress: LessonProgress | null;
  created_at: string;
  updated_at: string;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface LessonProgress {
  id: number;
  lesson: number;
  lesson_title: string;
  lesson_emoji: string;
  completed: boolean;
  score: number;
  attempts: number;
  time_spent_seconds: number;
  xp_earned: number;
  first_attempted_at: string;
  completed_at: string | null;
  last_practiced_at: string;
}

export interface ProgressStats {
  total_lessons: number;
  completed_lessons: number;
  completion_rate: number;
  total_xp: number;
  average_score: number;
  by_category: Record<string, { label: string; total: number; completed: number }>;
  by_difficulty: Record<string, { label: string; total: number; completed: number }>;
}

// ─── Voice / Chat ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface ChatResponse {
  reply: string;
  corrections: Correction[];
  _mock?: boolean;
}

export interface VoiceSession {
  id: number;
  lesson: number | null;
  lesson_title: string | null;
  language: number | null;
  language_code: string | null;
  transcript: ChatMessage[];
  summary: string;
  corrections: Correction[];
  pronunciation_score: number | null;
  fluency_score: number | null;
  messages_sent: number;
  scenario: string;
  duration_seconds: number;
  created_at: string;
}

// ─── API Pagination ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}
