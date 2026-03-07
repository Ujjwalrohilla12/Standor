'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/rooms':     'Rooms',
  '/analytics': 'Analytics',
  '/problems':  'Problems',
  '/settings':  'Settings',
};

type LiveStatus = 'live' | 'paused' | 'idle';

interface TopBarProps {
  /** Override the auto-detected page title */
  title?: string;
  /** Show a live/paused pill (for room pages) */
  liveStatus?: LiveStatus;
}

const STATUS_LABELS: Record<LiveStatus, string> = {
  live:   'Live',
  paused: 'Paused',
  idle:   'Idle',
};

const STATUS_CLASSES: Record<LiveStatus, string> = {
  live:   'bg-status-success/10 text-status-success',
  paused: 'bg-amber-500/10 text-amber-400',
  idle:   'bg-bg-subtle text-text-tertiary',
};

export function TopBar({ title, liveStatus }: TopBarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Build breadcrumb segments from the current path
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = BREADCRUMBS[href] ?? seg.replace(/-/g, ' ');
    return { href, label };
  });

  const pageTitle = title ?? (crumbs.at(-1)?.label ?? 'Standor');

  return (
    <header
      className="fixed inset-x-0 top-0 z-20 flex h-[var(--topbar-h)] items-center border-b border-border bg-bg-surface/90 backdrop-blur-md"
      style={{ left: 'var(--nav-w-collapsed)' }}
    >
      <div className="flex flex-1 items-center gap-2 px-4">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />}
              {i < crumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="capitalize text-text-secondary transition-colors hover:text-text-primary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="capitalize font-semibold text-text-primary">{pageTitle}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Live status pill */}
        {liveStatus && (
          <span
            className={`ml-2 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[liveStatus]}`}
            aria-live="polite"
            aria-label={`Session status: ${STATUS_LABELS[liveStatus]}`}
          >
            {liveStatus === 'live' && (
              <span className="live-dot" aria-hidden="true" />
            )}
            {STATUS_LABELS[liveStatus]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 px-4">
        {/* Search */}
        <button
          aria-label="Search"
          className="btn-ghost p-2 text-text-tertiary hover:text-text-secondary"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* User avatar + logout */}
        {user && (
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/15 text-xs font-bold text-teal-400"
              aria-label={`Signed in as ${user.name}`}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              className="btn-ghost p-2 text-text-tertiary hover:text-text-secondary"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
