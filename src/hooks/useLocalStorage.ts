// ============================================================
// DevTrack — Generic useLocalStorage Hook (SSR-safe)
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`[DevTrack] Error reading "${key}" from localStorage:`, error);
    }
    setIsLoaded(true);
  }, [key]);

  // Save to localStorage whenever value changes (after initial load)
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.error(`[DevTrack] Error writing "${key}" to localStorage:`, error);
        }
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue, isLoaded];
}
