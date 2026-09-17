// ============================================================
// DevTrack — useSettings Hook
// ============================================================

'use client';

import { AppSettings, DEFAULT_SETTINGS } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useSettings() {
  const [settings, setSettings, isLoaded] = useLocalStorage<AppSettings>(
    'devtrack_settings',
    DEFAULT_SETTINGS
  );

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return {
    settings,
    isLoaded,
    setSettings,
    updateSettings,
  };
}
