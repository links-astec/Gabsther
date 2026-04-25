import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthResponse, AuthTokens, User, StreakSummary,
  LessonSummary, LessonDetail, ChatResponse,
  PaginatedResponse,
} from '@/types';

// Change to your computer's LAN IP when testing on a physical device.
// Android emulator: use http://10.0.2.2:8000/api
// iOS simulator / physical device on same WiFi: use http://<your-ip>:8000/api
const BASE_URL = 'https://gabsther-tmmi.onrender.com/api';

const TOKEN_KEY = 'vl_access';
const REFRESH_KEY = 'vl_refresh';

export const tokenStorage = {
  getAccess: () => AsyncStorage.getItem(TOKEN_KEY),
  getRefresh: () => AsyncStorage.getItem(REFRESH_KEY),
  set: async (tokens: AuthTokens) => {
    await AsyncStorage.multiSet([[TOKEN_KEY, tokens.access], [REFRESH_KEY, tokens.refresh]]);
  },
  clear: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
  },
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { await tokenStorage.clear(); return null; }
    const data: { access: string } = await res.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.access);
    return data.access;
  } catch {
    await tokenStorage.clear();
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await tokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  let response = await fetch(url, { ...fetchOptions, headers });

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
        throw new Error('SESSION_EXPIRED');
      }
    } else {
      const newToken = await new Promise<string>((resolve) =>
        refreshSubscribers.push(resolve)
      );
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...fetchOptions, headers });
    }
  }

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try { errorData = await response.json(); } catch { /* ignore */ }
    const message =
      (errorData.detail as string) ||
      Object.values(errorData).flat().join(', ') ||
      `API error ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const authApi = {
  register: (data: {
    email: string; password: string; password_confirm: string;
    first_name?: string; last_name?: string;
  }) => apiFetch<AuthResponse>('/auth/register/', {
    method: 'POST', body: JSON.stringify(data), skipAuth: true,
  }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login/', {
      method: 'POST', body: JSON.stringify({ email, password }), skipAuth: true,
    }),

  logout: async () => {
    const refresh = await tokenStorage.getRefresh();
    if (refresh) {
      await apiFetch('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }).catch(() => {});
    }
    await tokenStorage.clear();
  },
};

export const userApi = {
  me: () => apiFetch<User>('/users/me/'),
  updateMe: (data: Partial<{ first_name: string; last_name: string; username: string }>) =>
    apiFetch<User>('/users/me/', { method: 'PATCH', body: JSON.stringify(data) }),
  getStreak: () => apiFetch<StreakSummary>('/users/streak/'),
  recordActivity: (activity_type = 'lesson') =>
    apiFetch('/users/streak/', { method: 'POST', body: JSON.stringify({ activity_type }) }),
};

export const lessonsApi = {
  list: (page = 1) =>
    apiFetch<PaginatedResponse<LessonSummary>>(`/lessons/?page=${page}`),
  get: (id: number) => apiFetch<LessonDetail>(`/lessons/${id}/`),
  markComplete: (id: number, score: number, time_spent_seconds: number) =>
    apiFetch(`/lessons/${id}/complete/`, {
      method: 'POST', body: JSON.stringify({ score, time_spent_seconds }),
    }),
};

export const voiceApi = {
  chat: (data: {
    message: string;
    language_code?: string;
    scenario?: string;
    history?: Array<{ role: string; content: string }>;
    lesson_id?: number;
  }) => apiFetch<ChatResponse>('/voice/chat/', {
    method: 'POST', body: JSON.stringify(data),
  }),

  saveSession: (data: {
    lesson?: number;
    transcript: Array<{ role: string; content: string; timestamp: string }>;
    corrections: unknown[];
    scenario: string;
    duration_seconds: number;
    messages_sent: number;
  }) => apiFetch('/voice/sessions/', { method: 'POST', body: JSON.stringify(data) }),
};
