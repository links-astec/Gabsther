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
  total_xp: number;
  lessons_completed: number;
  current_streak?: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface StreakSummary {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  activity_dates: string[];
}

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

export interface LessonContent {
  vocabulary: VocabItem[];
  phrases: Phrase[];
  grammar_notes?: string;
  speaking_prompts?: string[];
}

export type LessonCategory =
  | 'greetings' | 'food_drink' | 'travel' | 'grammar' | 'roleplay'
  | 'culture' | 'business' | 'numbers' | 'family' | 'shopping' | 'health' | 'nature';

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
  is_completed: boolean;
  language_name: string;
  language_flag: string;
}

export interface LessonDetail extends LessonSummary {
  content: LessonContent;
  scenario_prompt: string;
}

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
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
