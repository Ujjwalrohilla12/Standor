/**
 * OnboardingTour — a lightweight welcome overlay shown once
 * to new users. State is persisted in localStorage (ns_onboarding_done).
 */

import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';

const STORAGE_KEY = 'ns_onboarding_done';

export function shouldShowOnboarding(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

interface Props {
  /** Called when the user dismisses or finishes the tour. */
  onDone?: () => void;
}

export default function OnboardingTour({ onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldShowOnboarding()) setVisible(true);
  }, []);

  function finish() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
    onDone?.();
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
    >
      <div className="relative w-full max-w-md bg-ns-bg-800 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          {/* Close button */}
          <button
            onClick={finish}
            className="absolute top-4 right-4 p-1.5 text-ns-grey-600 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
            <Users size={20} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Welcome to Standor</h2>

          {/* Body */}
          <p className="text-sm text-ns-grey-400 leading-relaxed mb-4">
            Standor is your central hub for managing technical interview sessions.
            Coordinate live coding rounds, track candidate performance, and review session replays all in one place.
          </p>

          {/* Tip */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-8">
            <span className="text-[10px] font-bold text-ns-grey-600 uppercase tracking-wider mt-0.5 flex-shrink-0">Tip</span>
            <p className="text-xs text-ns-grey-500 leading-relaxed">
              Start by creating a new interview session using the "+ New Interview" button.
            </p>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={finish}
              className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-ns-grey-100 transition-colors shadow-lg"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
