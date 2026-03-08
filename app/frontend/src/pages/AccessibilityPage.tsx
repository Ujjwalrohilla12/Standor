import { Eye, Volume2, MousePointer2, Keyboard, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 ${
        enabled ? 'bg-white' : 'bg-white/10 border border-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200 ${
          enabled ? 'translate-x-[22px] bg-black' : 'translate-x-0.5 bg-white/40'
        }`}
      />
    </button>
  );
}

export default function AccessibilityPage() {
  const { reducedMotion, highContrast, fontSize, toggleReducedMotion, toggleHighContrast, changeFontSize } = useAccessibility();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        {/* Header */}
        <div className="max-w-4xl mb-32">
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            Coding interviews for <br />
            <span className="text-ns-grey-600">everyone.</span>
          </h1>
          <p className="text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Standor is designed to make technical interviews accessible to every developer. From keyboard-first navigation to screen-reader compatible coding environments, we ensure our platform follows modern accessibility standards.
          </p>
        </div>

        {/* ── Display Preferences ── */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white tracking-tighter mb-2">Display Preferences</h2>
          <p className="text-sm text-ns-grey-500 mb-8">Changes are saved automatically and apply immediately across the site.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Reduced motion */}
            <div className="ns-glass-dark rounded-2xl border border-white/[0.06] p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Reduce Motion</p>
                <p className="text-xs text-ns-grey-500 leading-relaxed">Disables interface animations across the Standor platform including dashboard transitions and interview room visualizations.</p>
              </div>
              <Toggle enabled={reducedMotion} onToggle={() => toggleReducedMotion()} label="Toggle reduced motion" />
            </div>

            {/* High contrast */}
            <div className="ns-glass-dark rounded-2xl border border-white/[0.06] p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white mb-1">High Contrast</p>
                <p className="text-xs text-ns-grey-500 leading-relaxed">Improves visibility across the coding editor, interview dashboard, and analytics panels for enhanced readability.</p>
              </div>
              <Toggle enabled={highContrast} onToggle={() => toggleHighContrast()} label="Toggle high contrast" />
            </div>

            {/* Font size */}
            <div className="ns-glass-dark rounded-2xl border border-white/[0.06] p-6">
              <p className="text-sm font-semibold text-white mb-1">Font Size</p>
              <p className="text-xs text-ns-grey-500 mb-4 leading-relaxed">Adjusts text size across the Standor interface including the code editor, interview panels, and dashboards.</p>
              <div className="flex gap-2">
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => changeFontSize(size)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      fontSize === size
                        ? 'bg-white text-black'
                        : 'border border-white/10 text-ns-grey-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {size === 'sm' ? 'Small' : size === 'md' ? 'Default' : 'Large'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Core Principles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-48">
          {[
            { icon: Eye, title: 'Readable Code Interfaces', desc: 'High contrast themes and scalable typography ensure code remains readable during long technical interview sessions.' },
            { icon: Keyboard, title: 'Keyboard-First Navigation', desc: 'Developers can navigate interview rooms, dashboards, and code editors entirely through keyboard shortcuts.' },
            { icon: Zap, title: 'Motion Accessibility', desc: 'Standor respects system level motion preferences, reducing animations for users who prefer minimal visual movement.' },
            { icon: Volume2, title: 'Screen Reader Support', desc: 'Semantic HTML structure and ARIA roles enable screen readers to interpret interview workflows and coding interfaces.' },
            { icon: MousePointer2, title: 'Precise Interaction Targets', desc: 'Buttons, controls, and code editor interactions are designed with accessible hit areas and predictable focus states.' },
            { icon: ShieldCheck, title: 'Accessible Engineering', desc: 'Accessibility reviews are integrated into our engineering process to ensure the platform remains usable for all developers.' }
          ].map((v, i) => (
            <div key={i} className="group ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-10 hover:border-white/12 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all mb-8">
                <v.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{v.title}</h3>
              <p className="text-sm text-ns-grey-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Commitment */}
        <div className="grid lg:grid-cols-2 gap-16 mb-48 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tighter mb-8 text-glow">Our Commitment</h2>
            <p className="text-xl text-ns-grey-400 leading-relaxed mb-10">
              Standor believes that every developer should be able to participate in technical interviews without barriers. Accessibility is integrated into our design system, engineering standards, and product roadmap.
            </p>
            <div className="space-y-4">
              {[
                'Accessible coding editor and interview interface',
                'Keyboard shortcuts across the entire platform',
                'Automated accessibility testing in CI pipelines',
                'Continuous usability testing with diverse developer groups'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-ns-accent shadow-[0_0_10px_#F6FF33]" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ns-glass rounded-[3rem] border border-white/[0.08] p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-ns-accent/5 blur-[80px] -z-10 group-hover:bg-ns-accent/10 transition-colors" />
            <h3 className="text-2xl font-bold text-white mb-6">Found a barrier?</h3>
            <p className="text-ns-grey-500 mb-10 leading-relaxed">
              If you encounter accessibility barriers while using Standor, please let us know. Your feedback helps us improve the platform and ensure technical interviews remain accessible to everyone.
            </p>
            <button className="px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center justify-center gap-2">
              Submit Accessibility Feedback
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Guidelines Link */}
        <div className="text-center py-24 border-t border-white/[0.05]">
          <h4 className="text-ns-grey-600 mb-6 uppercase tracking-[0.3em] text-[10px] font-mono">Accessibility Standards</h4>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50">
            <span className="text-white font-black text-2xl tracking-tighter">WCAG 2.1</span>
            <span className="text-white font-black text-2xl tracking-tighter">Section 508</span>
            <span className="text-white font-black text-2xl tracking-tighter">EN 301 549</span>
          </div>
        </div>
      </div>
    </div>
  );
}
