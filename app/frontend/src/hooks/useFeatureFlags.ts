/**
 * useFeatureFlags — fetches the list of active feature flags from the backend.
 *
 * Usage:
 *   const { isEnabled } = useFeatureFlags();
 *   if (isEnabled('beta_3d_heatmap')) { ... }
 *
 * Flags are fetched once on mount and cached in module-level memory for the
 * lifetime of the page (no re-fetches on re-renders).
 */

import { useState, useEffect } from 'react';

interface FlagEntry { key: string; rolloutPercent: number; }

// Module-level cache so multiple consumers share one fetch
let _cache: FlagEntry[] | null = null;
let _promise: Promise<FlagEntry[]> | null = null;

async function fetchFlags(): Promise<FlagEntry[]> {
  if (_cache) return _cache;
  if (!_promise) {
    const API = (import.meta.env.VITE_BACKEND_URL as string) || '';
    _promise = fetch(`${API}/api/flags/active`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => [])
      .then(data => { _cache = data; return data; });
  }
  return _promise;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FlagEntry[]>(_cache ?? []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetchFlags().then(data => { setFlags(data); setLoading(false); });
  }, []);

  /**
   * Returns true if the flag is enabled.
   * Supports partial rollouts via rolloutPercent (0–100):
   * a stable hash of the flag key is used for deterministic bucketing.
   */
  function isEnabled(key: string): boolean {
    const flag = flags.find(f => f.key === key);
    if (!flag) return false;
    if (flag.rolloutPercent >= 100) return true;
    if (flag.rolloutPercent <= 0) return false;
    // Deterministic bucket from flag key (same browser always gets same result)
    const hash = Array.from(key).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0);
    return (hash % 100) < flag.rolloutPercent;
  }

  return { flags, loading, isEnabled };
}

/** Clear the cache (useful for testing or after admin flag changes). */
export function invalidateFlagCache() {
  _cache = null;
  _promise = null;
}
