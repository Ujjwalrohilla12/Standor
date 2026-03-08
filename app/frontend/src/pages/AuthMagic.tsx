import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * AuthMagic
 *
 * Handles Standor magic link authentication.
 * Flow:
 * 1. User clicks magic login link from email
 * 2. Browser lands on /auth/magic?token=...&email=...
 * 3. This page forwards the request to the backend verification endpoint
 * 4. Backend verifies token and redirects to /auth/callback?token=<JWT>
 */

export default function AuthMagic() {
  const [searchParams] = useSearchParams();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    redirected.current = true;

    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const redirect = searchParams.get('redirect');

    const API = import.meta.env.VITE_BACKEND_URL as string;

    if (!token || !email) {
      window.location.href = '/login?error=invalid_magic_link';
      return;
    }

    // Build backend verification URL
    const params = new URLSearchParams({
      token,
      email,
      ...(redirect ? { redirect } : {})
    });

    /**
     * Redirect to backend
     *
     * Backend will:
     * 1. Validate magic token
     * 2. Issue JWT
     * 3. Set refresh cookie
     * 4. Redirect to /auth/callback?token=<access_token>
     */
    window.location.href = `${API}/api/auth/magic-link/verify?${params.toString()}`;
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-ns-bg-900 flex flex-col items-center justify-center gap-5">

      {/* Standor Logo */}
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
        <span className="text-black font-bold text-xs tracking-tight">ST</span>
      </div>

      {/* Loading Spinner */}
      <Loader2 size={22} className="animate-spin text-ns-grey-500" />

      {/* Message */}
      <p className="text-sm text-ns-grey-500">
        Verifying your secure login link…
      </p>

      <p className="text-[10px] font-mono text-ns-grey-600 tracking-wide">
        standor.identity.magic.verify
      </p>
    </div>
  );
}
