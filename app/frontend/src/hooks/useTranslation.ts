/**
 * useTranslation — minimal i18n hook for Standor.
 *
 * Locale is stored in localStorage (ns_locale) and on <html lang>.
 * Currently ships with 'en' only; add new locale files under src/i18n/
 * and register them in the LOCALES map below.
 *
 * Usage:
 *   const { t, locale, setLocale } = useTranslation();
 *   <p>{t('common.learnMore')}</p>
 */

import { useState, useCallback } from 'react';
import en, { TranslationKey } from '../i18n/en';

export type SupportedLocale = 'en';

const LOCALES: Record<SupportedLocale, typeof en> = { en };

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
};

export const SUPPORTED_LOCALES = Object.keys(LOCALE_LABELS) as SupportedLocale[];

const STORAGE_KEY = 'ns_locale';

function readLocale(): SupportedLocale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (stored && LOCALES[stored]) return stored;
  } catch { /* ignore */ }
  return 'en';
}

function applyLocale(locale: SupportedLocale) {
  try { document.documentElement.lang = locale; } catch { /* ignore */ }
  try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* ignore */ }
}

// Initialize on module load
applyLocale(readLocale());

export function useTranslation() {
  const [locale, setLocaleState] = useState<SupportedLocale>(readLocale);

  const setLocale = useCallback((next: SupportedLocale) => {
    applyLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback((key: TranslationKey, fallback?: string): string => {
    const dict = LOCALES[locale] ?? LOCALES.en;
    return (dict as Record<string, string>)[key] ?? fallback ?? key;
  }, [locale]);

  return { t, locale, setLocale, localeLabel: LOCALE_LABELS[locale], supportedLocales: SUPPORTED_LOCALES, localeLabels: LOCALE_LABELS };
}
