/**
 * @standor/ui-kit
 *
 * Design-token helpers and CSS class builders for the Standor dark
 * theme. Exported as plain TypeScript utilities so they can be consumed
 * by both the React frontend and any server-side rendering context.
 */

// ─── Surface classes (L0–L3) ──────────────────────────────────────────────

export const surface = {
    l0: 'bg-[var(--ns-bg-900)]',                       // page canvas
    l1: 'bg-[var(--ns-bg-800)] border border-[var(--ns-border)]',
    l2: 'bg-[var(--ns-bg-700)] border border-[var(--ns-border)]',
    l3: 'bg-[var(--ns-bg-600)] border border-[var(--ns-border-strong)]',
    glass: 'card-glass',                               // modal / overlay
} as const

// ─── Text utilities ───────────────────────────────────────────────────────

export const text = {
    primary: 'text-[var(--ns-text-primary)]',
    secondary: 'text-[var(--ns-text-secondary)]',
    muted: 'text-[var(--ns-text-tertiary)]',
    accent: 'text-[var(--ns-accent)]',
    success: 'text-[var(--ns-success)]',
    warning: 'text-[var(--ns-warning)]',
    danger: 'text-[var(--ns-danger)]',
} as const

// ─── Button variants ──────────────────────────────────────────────────────

export const btn = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    run: 'btn-run',
} as const

// ─── Badge helpers ────────────────────────────────────────────────────────

export const badge = {
    silver: 'badge badge-silver',
    green: 'badge badge-green',
    amber: 'badge badge-amber',
    error: 'badge badge-error',
} as const

// ─── Difficulty badge strings ─────────────────────────────────────────────

export const diffBadge = {
    EASY: 'badge badge-green',
    MEDIUM: 'badge badge-amber',
    HARD: 'badge badge-error',
} as const

// ─── Semantic token CSS variable names ───────────────────────────────────

export const tokens = {
    bg900: 'var(--ns-bg-900)',
    bg800: 'var(--ns-bg-800)',
    bg700: 'var(--ns-bg-700)',
    bg600: 'var(--ns-bg-600)',
    bg500: 'var(--ns-bg-500)',
    accent: 'var(--ns-accent)',
    accentDim: 'var(--ns-accent-dim)',
    success: 'var(--ns-success)',
    warning: 'var(--ns-warning)',
    danger: 'var(--ns-danger)',
    border: 'var(--ns-border)',
    borderStrong: 'var(--ns-border-strong)',
    borderAccent: 'var(--ns-border-accent)',
    textPrimary: 'var(--ns-text-primary)',
    textSecondary: 'var(--ns-text-secondary)',
    textTertiary: 'var(--ns-text-tertiary)',
} as const

// ─── Animation durations ──────────────────────────────────────────────────

export const duration = {
    micro: 'var(--dur-micro)',
    small: 'var(--dur-small)',
    medium: 'var(--dur-medium)',
    large: 'var(--dur-large)',
} as const

export const easing = {
    enter: 'var(--ease-enter)',
    exit: 'var(--ease-exit)',
} as const

// ─── Framer Motion variants ───────────────────────────────────────────────

export const motionVariants = {
    fadeIn: {
        initial: { opacity: 0, y: 6, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 6, scale: 0.97 },
        transition: { duration: 0.18, ease: [0.22, 0.9, 0.3, 1] },
    },
    slideUp: {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 16 },
        transition: { duration: 0.22, ease: [0.22, 0.9, 0.3, 1] },
    },
    slideRight: {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 40 },
        transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
    },
} as const
