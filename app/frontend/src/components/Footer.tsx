import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-500/15">
              <Zap className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            </div>
            <span className="text-sm font-extrabold text-text-primary">Standor</span>
          </Link>
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} Standor — The Standard for Technical Interviews
          </p>
          <div className="flex gap-4 text-xs text-text-tertiary">
            <Link href="/privacy" className="transition-colors hover:text-text-secondary">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-text-secondary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
