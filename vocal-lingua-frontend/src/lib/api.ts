/**
 * Gabsther — API Client
 * ─────────────────────────
 * All fetch calls go through these helpers.
 * JWT token is read from localStorage and sent as Bearer header.
 * Token refresh is handled automatically on 401.
 */

import type {
  AuthResponse,
  AuthTokens,
  User,
  UserProfile,
  Language,
  LessonSummary,
  LessonDetail,
  LessonProgress,
  ProgressStats,
  StreakSummary,
  HeatmapData,
  ChatResponse,
  VoiceSession,
  PaginatedResponse,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─────────────────────────────────────────────────────────────────────────────
// Token helpers (localStorage)
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'vl_access';
const REFRESH_KEY = 'vl_refresh';

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set: (tokens: AuthTokens) => {
    localStorage.setItem(TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      tokenStorage.clear();
      return null;
    }
    const data: { access: string } = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access);
    return data.access;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = tokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  let response = await fetch(url, { ...fetchOptions, headers });

  // Attempt token refresh on 401
  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...fetchOptions, headers });
      } else {
        // Redirect to login if refresh failed
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      // Queue the request until token is refreshed
      const newToken = await new Promise<string>((resolve) =>
        subscribeTokenRefresh(resolve)
      );
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...fetchOptions, headers });
    }
  }

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      errorData = await response.json();
    } catch {
      // ignore parse errors
    }
    const message =
      (errorData.detail as string) ||
      Object.values(errorData).flat().join(', ') ||
      `API error ${response.status}`;
    throw new Error(message);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) =>
    apiFetch<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  logout: (refresh: string) =>
    apiFetch('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

  refreshToken: (refresh: string) =>
    apiFetch<{ access: string }>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
      skipAuth: true,
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// User API
// ─────────────────────────────────────────────────────────────────────────────

export const userApi = {
  me: () => apiFetch<User>('/users/me/'),

  updateMe: (data: Partial<User>) =>
    apiFetch<User>('/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiFetch<UserProfile>('/users/profile/'),

  updateProfile: (data: Partial<UserProfile>) =>
    apiFetch<UserProfile>('/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  completeOnboarding: (data: {
    language_id?: number;
    level?: string;
    interests?: string[];
  }) =>
    apiFetch<UserProfile>('/users/onboarding/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStreak: () => apiFetch<StreakSummary>('/users/streak/'),

  recordActivity: (activity_type = 'lesson') =>
    apiFetch('/users/streak/', {
      method: 'POST',
      body: JSON.stringify({ activity_type }),
    }),

  getHeatmap: (months = 12) =>
    apiFetch<HeatmapData>(`/users/heatmap/?months=${months}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Lessons API
// ─────────────────────────────────────────────────────────────────────────────

export interface LessonFilters {
  language?: string;
  category?: string;
  difficulty?: string;
  is_free?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const lessonsApi = {
  listLanguages: () => apiFetch<Language[]>('/lessons/languages/'),

  list: (filters: LessonFilters = {}) =>
    apiFetch<PaginatedResponse<LessonSummary>>(
      `/lessons/${buildQueryString(filters as Record<string, string | number | boolean | undefined>)}`
    ),

  get: (id: number) => apiFetch<LessonDetail>(`/lessons/${id}/`),

  markComplete: (id: number, score: number, time_spent_seconds: number) =>
    apiFetch<LessonProgress>(`/lessons/${id}/complete/`, {
      method: 'POST',
      body: JSON.stringify({ score, time_spent_seconds }),
    }),

  getProgress: () => apiFetch<LessonProgress[]>('/lessons/progress/'),

  getStats: (language?: string) =>
    apiFetch<ProgressStats>(
      `/lessons/stats/${language ? `?language=${language}` : ''}`
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Voice API
// ─────────────────────────────────────────────────────────────────────────────

export const voiceApi = {
  chat: (data: {
    message: string;
    language_code?: string;
    scenario?: string;
    history?: Array<{ role: string; content: string }>;
    lesson_id?: number;
  }) =>
    apiFetch<ChatResponse>('/voice/chat/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  saveSession: (data: Partial<VoiceSession>) =>
    apiFetch<VoiceSession>('/voice/sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSessions: () => apiFetch<VoiceSession[]>('/voice/sessions/'),
};
