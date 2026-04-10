'use client';

import { useState, useEffect, useCallback } from 'react';
import { userApi } from '@/lib/api';
import type { StreakSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useStreak() {
  const { isAuthenticated } = useAuth();
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStreak = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await userApi.getStreak();
      setStreak(data);
    } catch (err) {
      console.warn('Failed to load streak:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const recordActivity = useCallback(
    async (type = 'lesson') => {
      if (!isAuthenticated) return;
      try {
        await userApi.recordActivity(type);
        await fetchStreak();
      } catch (err) {
        console.warn('Failed to record streak activity:', err);
      }
    },
    [isAuthenticated, fetchStreak]
  );

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, isLoading, fetchStreak, recordActivity };
}
