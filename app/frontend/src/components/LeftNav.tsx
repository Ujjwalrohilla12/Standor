'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  Video,
  BarChart2,
  BookOpen,
  Settings,
  ChevronRight,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/room/new',   label: 'New Room',    Icon: Plus },
  { href: '/rooms',      label: 'Rooms',       Icon: Video },
  { href: '/analytics',  label: 'Analytics',   Icon: BarChart2 },
  { href: '/problems',   label: 'Problems',    Icon: BookOpen },
] as const;

const BOTTOM_ITEMS = [
  { href: '/settings', label: 'Settings', Icon: Settings },
] as const;

type NavItemProps = {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
  expanded: boolean;
};

function NavItem({ href, label, Icon, active, expanded }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={expanded ? undefined : label}
      className={`group relative flex h-10 items-center rounded-lg transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500 ${
        expanded ? 'gap-3 px-3' : 'justify-center px-0'
      } ${
        active
          ? 'bg-teal-500/10 text-teal-400'
          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-teal-400" />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap text-sm font-medium"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function LeftNav() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: expanded ? 280 : 72 }}
      transition={{ duration: 0.2, ease: [0.2, 0.9, 0.2, 1] }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-bg-surface"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={`flex h-[var(--topbar-h)] shrink-0 items-center border-b border-border ${expanded ? 'px-4' : 'justify-center'}`}>
        <Link
          href="/dashboard"
          aria-label="Standor home"
          className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 rounded"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/15">
            <Zap className="h-4 w-4 text-teal-400" aria-hidden="true" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="text-[15px] font-extrabold tracking-tight text-text-primary"
              >
                Standor
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))}
            expanded={expanded}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 border-t border-border p-2">
        {BOTTOM_ITEMS.map(({ href, label, Icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname === href}
            expanded={expanded}
          />
        ))}

        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className={`flex h-10 items-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500 ${
            expanded ? 'gap-3 px-3' : 'justify-center px-0'
          }`}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.9, 0.2, 1] }}
          >
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </motion.span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="text-sm"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
