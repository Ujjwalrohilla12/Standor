import { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

const CONSENT_KEY = 'ns_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none" data-testid="cookie-consent-banner">
      <div className="max-w-lg mx-auto md:mx-0 md:ml-4 pointer-events-auto">
        <div className="rounded-xl border border-white/[0.08] bg-[#141414]/95 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-neutral-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-neutral-300 mb-3">
                We use essential cookies for authentication and session management. No tracking cookies are used.{' '}
                <a href="/privacy" className="text-white hover:underline">Privacy Policy</a>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={accept}
                  className="px-4 py-1.5 bg-white text-black rounded-md text-xs font-semibold hover:bg-neutral-200 transition-colors"
                  data-testid="cookie-accept-btn"
                >
                  Accept
                </button>
                <button
                  onClick={decline}
                  className="px-4 py-1.5 border border-white/[0.1] text-neutral-400 rounded-md text-xs hover:text-white hover:border-white/[0.2] transition-colors"
                  data-testid="cookie-decline-btn"
                >
                  Decline
                </button>
              </div>
            </div>
            <button onClick={decline} className="text-neutral-600 hover:text-neutral-400 transition-colors" data-testid="cookie-close-btn">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
