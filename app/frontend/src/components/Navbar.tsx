'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Zap } from 'lucide-react';

/** Public-page top nav (landing, login, register). Dark theme. */
export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
            <Zap className="h-4 w-4 text-teal-400" aria-hidden="true" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-text-primary">Standor</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-text-secondary">Sign in</Link>
              <Link href="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
