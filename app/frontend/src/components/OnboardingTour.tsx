/**
 * OnboardingTour — a lightweight step-by-step welcome overlay shown once
 * to new users. State is persisted in localStorage (ns_onboarding_done).
 */

import { useState, useEffect } from 'react';
import { Upload, Package, Settings, X, ArrowRight, ChevronLeft } from 'lucide-react';

const STORAGE_KEY = 'ns_onboarding_done';

const STEPS = [
  {
    icon: Package,
    title: 'Welcome to Standor',
    body: 'This is your dashboard — the central hub for all your network capture sessions. Every PCAP or PCAPNG file you upload appears here.',
    tip: 'Your sessions are private and only visible to you and your team.',
  },
  {
    icon: Upload,
    title: 'Upload your first capture',
    body: 'Click "Upload PCAP" to drag-and-drop or browse for a .pcap or .pcapng file. Standor parses it and reconstructs every packet\'s OSI layers automatically.',
    tip: 'Files up to 50 MB are supported. Large captures are processed server-side.',
  },
  {
    icon: Package,
    title: 'Explore sessions in 3D',
    body: 'Open any session to enter the 3D OSI Slicer — an interactive spatial view of all packets, colour-coded by protocol and flagged by entropy score.',
    tip: 'Hold right-click and drag to orbit. Scroll to zoom. Click a node for full packet details.',
  },
  {
    icon: Settings,
    title: 'Collaborate & configure',
    body: 'Invite team members via Settings → Organisation. Set up webhooks and custom policy rules to get alerts when suspicious packets are detected.',
    tip: 'Policy rules can fire webhooks in real time as captures are uploaded.',
  },
] as const;

interface Props {
  /** Called when the user dismisses or finishes the tour. */
  onDone?: () => void;
}

export function shouldShowOnboarding(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function OnboardingTour({ onDone }: Props) {
  const [step, setStep] = useState(0);
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

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
    >
      <div className="relative w-full max-w-md bg-ns-bg-800 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.06]">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Skip button */}
          <button
            onClick={finish}
            className="absolute top-4 right-4 p-1.5 text-ns-grey-600 hover:text-white transition-colors"
            aria-label="Skip tour"
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
            <Icon size={20} className="text-white" />
          </div>

          {/* Step counter */}
          <p className="text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-3 font-mono">
            Step {step + 1} of {STEPS.length}
          </p>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-3 tracking-tight">{current.title}</h2>

          {/* Body */}
          <p className="text-sm text-ns-grey-400 leading-relaxed mb-4">{current.body}</p>

          {/* Tip */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-8">
            <span className="text-[10px] font-bold text-ns-grey-600 uppercase tracking-wider mt-0.5 flex-shrink-0">Tip</span>
            <p className="text-xs text-ns-grey-500 leading-relaxed">{current.tip}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-ns-grey-500 hover:text-white disabled:opacity-0 transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-white/20 hover:bg-white/40'}`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={isLast ? finish : () => setStep(s => s + 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-ns-grey-100 transition-colors"
            >
              {isLast ? 'Get started' : 'Next'}
              {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
