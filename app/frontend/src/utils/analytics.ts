/**
 * analytics.ts — Privacy-aware, consent-gated analytics for Standor.
 *
 * Events are only dispatched when the user has explicitly accepted cookies
 * (ns_cookie_consent === 'accepted' in localStorage). All calls before
 * consent is granted are silently ignored — no data leaves the browser.
 *
 * Currently ships with a lightweight custom implementation that sends
 * events to the backend analytics endpoint (/api/analytics/event).
 * Swap the `_dispatch` function to integrate any third-party provider
 * (Plausible, PostHog, GA4, etc.) behind the same consent gate.
 *
 * Usage:
 *   import { trackEvent, trackPageview } from '../utils/analytics';
 *   trackPageview('/dashboard');
 *   trackEvent('upload_completed', { fileSize: 1024 });
 */

const CONSENT_KEY = 'ns_cookie_consent';

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

/** Internal dispatcher — replace body to integrate a real analytics provider. */
function _dispatch(eventName: string, props: Record<string, unknown>) {
  const API = (import.meta.env.VITE_BACKEND_URL as string) || '';
  // Fire-and-forget; never throws to avoid breaking the app
  fetch(`${API}/api/analytics/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ts: new Date().toISOString(),
      ...props,
    }),
    keepalive: true,
  }).catch(() => { /* ignore */ });
}

/**
 * Track a custom named event.
 * @param eventName  Short identifier e.g. 'upload_started', 'mfa_enabled'
 * @param props      Additional metadata (must be JSON-serializable, no PII)
 */
export function trackEvent(eventName: string, props: Record<string, unknown> = {}) {
  if (!hasConsent()) return;
  _dispatch(eventName, props);
}

/**
 * Track a page view. Call on route changes.
 */
export function trackPageview(path: string) {
  if (!hasConsent()) return;
  _dispatch('pageview', { path });
}

/**
 * Subscribe to consent changes so analytics can start firing
 * immediately after the user accepts (no page reload needed).
 *
 * Call once at app root:
 *   onConsentChanged(() => trackPageview(window.location.pathname));
 */
export function onConsentChanged(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY && e.newValue === 'accepted') callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
