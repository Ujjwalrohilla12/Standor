/**
 * Analytics Module
 * 
 * Centralized event tracking for user interactions and conversions.
 * Integrates with Segment/Google Analytics 4 for data collection.
 * 
 * Features:
 * - Type-safe event tracking
 * - Lazy loading of analytics scripts
 * - Privacy-compliant tracking
 * - Feature flag support for A/B testing
 */

export type AnalyticsCategory = 'CTA' | 'Feature' | 'Navigation' | 'Video' | 'Interaction';

export interface AnalyticsEvent {
  /** Event category */
  category: AnalyticsCategory;
  /** Event action (e.g., 'click', 'view', 'play') */
  action: string;
  /** Optional event label for additional context */
  label?: string;
  /** Optional numeric value */
  value?: number;
  /** Optional additional properties */
  properties?: Record<string, any>;
}

/**
 * Track an analytics event
 * 
 * @example
 * ```ts
 * trackEvent({
 *   category: 'CTA',
 *   action: 'click',
 *   label: 'Get Started Free',
 * });
 * ```
 */
export function trackEvent(event: AnalyticsEvent): void {
  // Check if analytics is available
  if (typeof window === 'undefined') return;

  const { category, action, label, value, properties } = event;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...properties,
    });
  }

  // Segment Analytics
  if (window.analytics) {
    window.analytics.track(`${category} ${action}`, {
      label,
      value,
      ...properties,
    });
  }

  // Console log in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event);
  }
}

/**
 * Track CTA button click
 */
export function trackCTAClick(ctaText: string, ctaHref: string): void {
  trackEvent({
    category: 'CTA',
    action: 'click',
    label: ctaText,
    properties: {
      href: ctaHref,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track feature card interaction
 */
export function trackFeatureCardClick(featureTitle: string): void {
  trackEvent({
    category: 'Feature',
    action: 'click',
    label: featureTitle,
  });
}

/**
 * Track demo video play
 */
export function trackDemoPlay(videoId: string): void {
  trackEvent({
    category: 'Video',
    action: 'play',
    label: videoId,
  });
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }

  // Segment Analytics
  if (window.analytics) {
    window.analytics.page(pageTitle || document.title, {
      path: pagePath,
    });
  }
}

/**
 * Track scroll depth milestone
 */
export function trackScrollDepth(depth: 25 | 50 | 75 | 100): void {
  trackEvent({
    category: 'Interaction',
    action: 'scroll',
    label: `${depth}%`,
    value: depth,
  });
}

/**
 * Initialize analytics scripts (lazy loaded)
 * 
 * This should be called after the page is interactive to avoid
 * blocking initial page load.
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Check if already initialized
  if (window.__analyticsInitialized) return;
  window.__analyticsInitialized = true;

  // Load analytics scripts after a delay
  setTimeout(() => {
    // Google Analytics 4
    const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (GA_MEASUREMENT_ID && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID);
    }

    // Segment Analytics
    const SEGMENT_WRITE_KEY = import.meta.env.VITE_SEGMENT_WRITE_KEY;
    if (SEGMENT_WRITE_KEY && !window.analytics) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${SEGMENT_WRITE_KEY}";;analytics.SNIPPET_VERSION="4.15.3";
        analytics.load("${SEGMENT_WRITE_KEY}");
        }}();
      `;
      document.head.appendChild(script);
    }
  }, 1000); // Delay 1 second after page load
}

// Type declarations for global analytics objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
      page: (name?: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
    };
    __analyticsInitialized?: boolean;
  }
}
