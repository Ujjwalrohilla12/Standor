/**
 * useAccessibility — manages site-wide accessibility preferences.
 * Preferences are persisted in localStorage and applied as data attributes
 * on <html> so that global CSS can respond to them.
 *
 * Data attributes applied to <html>:
 *   data-reduced-motion="true"   → disables animations site-wide
 *   data-high-contrast="true"    → increases contrast
 *   data-font-size="sm|md|lg"    → adjusts base font-size via CSS var
 */

import { useState, useEffect, useCallback } from 'react';

export type FontSize = 'sm' | 'md' | 'lg';

const STORAGE_KEYS = {
  reducedMotion: 'ns_a11y_reduced_motion',
  highContrast: 'ns_a11y_high_contrast',
  fontSize: 'ns_a11y_font_size',
} as const;

function applyToDOM(reducedMotion: boolean, highContrast: boolean, fontSize: FontSize) {
  const html = document.documentElement;
  html.setAttribute('data-reduced-motion', String(reducedMotion));
  html.setAttribute('data-high-contrast', String(highContrast));
  html.setAttribute('data-font-size', fontSize);
}

function readFromStorage(): { reducedMotion: boolean; highContrast: boolean; fontSize: FontSize } {
  const systemPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    reducedMotion: localStorage.getItem(STORAGE_KEYS.reducedMotion) === 'true' || systemPrefersReduced,
    highContrast: localStorage.getItem(STORAGE_KEYS.highContrast) === 'true',
    fontSize: (localStorage.getItem(STORAGE_KEYS.fontSize) as FontSize) || 'md',
  };
}

/** Call once at app root to initialize accessibility from stored prefs. */
export function initAccessibility() {
  const prefs = readFromStorage();
  applyToDOM(prefs.reducedMotion, prefs.highContrast, prefs.fontSize);
}

export function useAccessibility() {
  const [reducedMotion, setReducedMotion] = useState(() => readFromStorage().reducedMotion);
  const [highContrast, setHighContrast] = useState(() => readFromStorage().highContrast);
  const [fontSize, setFontSize] = useState<FontSize>(() => readFromStorage().fontSize);

  const toggleReducedMotion = useCallback((value?: boolean) => {
    setReducedMotion(prev => {
      const next = value !== undefined ? value : !prev;
      localStorage.setItem(STORAGE_KEYS.reducedMotion, String(next));
      document.documentElement.setAttribute('data-reduced-motion', String(next));
      return next;
    });
  }, []);

  const toggleHighContrast = useCallback((value?: boolean) => {
    setHighContrast(prev => {
      const next = value !== undefined ? value : !prev;
      localStorage.setItem(STORAGE_KEYS.highContrast, String(next));
      document.documentElement.setAttribute('data-high-contrast', String(next));
      return next;
    });
  }, []);

  const changeFontSize = useCallback((size: FontSize) => {
    setFontSize(size);
    localStorage.setItem(STORAGE_KEYS.fontSize, size);
    document.documentElement.setAttribute('data-font-size', size);
  }, []);

  // Sync with OS-level prefers-reduced-motion if user hasn't overridden
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEYS.reducedMotion) === null) {
        toggleReducedMotion(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [toggleReducedMotion]);

  return { reducedMotion, highContrast, fontSize, toggleReducedMotion, toggleHighContrast, changeFontSize };
}
