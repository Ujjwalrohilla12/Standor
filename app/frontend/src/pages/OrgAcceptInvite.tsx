import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Receives the invite link from email (/org/accept-invite?status=...&org=...)
 * after the backend has already processed the token and redirected here.
 * Also handles the case where the backend redirects here before processing
 * (token + email params present) by forwarding to the backend.
 */
export default function OrgAcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const forwarded = useRef(false);

  const status = searchParams.get('status');
  const orgName = searchParams.get('org');
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const API = import.meta.env.VITE_BACKEND_URL as string;

  // If this is a raw invite link (token + email present, no status), forward to backend
  useEffect(() => {
    if (forwarded.current) return;
    if (token && email && !status) {
      forwarded.current = true;
      const params = new URLSearchParams({ token, email });
      window.location.href = `${API}/api/orgs/accept-invite?${params.toString()}`;
    }
  }, [token, email, status, API]);

  if (token && email && !status) {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex flex-col items-center justify-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center mb-2">
          <span className="text-black font-bold text-xs">NS</span>
        </div>
        <Loader2 size={20} className="animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-500">Accepting invitation…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-ns-success/10 border border-ns-success/30 flex items-center justify-center mb-2">
          <CheckCircle2 size={28} className="text-ns-success" />
        </div>
        <h1 className="text-2xl font-bold text-white">You're in!</h1>
        <p className="text-neutral-400 max-w-sm">
          You've joined <strong className="text-white">{orgName ?? 'the organisation'}</strong> on Standor.
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="mt-4 px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex flex-col items-center justify-center gap-4 text-center px-6">
        <CheckCircle2 size={28} className="text-neutral-400" />
        <h1 className="text-xl font-bold text-white">Already a member</h1>
        <p className="text-neutral-500 text-sm">You're already in this organisation.</p>
        <button onClick={() => navigate('/settings')} className="mt-2 text-sm text-white hover:underline">
          Go to Settings
        </button>
      </div>
    );
  }

  // expired or invalid
  return (
    <div className="min-h-screen bg-ns-bg-900 flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-ns-danger/10 border border-ns-danger/30 flex items-center justify-center mb-2">
        <AlertTriangle size={28} className="text-ns-danger" />
      </div>
      <h1 className="text-2xl font-bold text-white">
        {status === 'expired' ? 'Invitation expired' : 'Invalid invitation'}
      </h1>
      <p className="text-neutral-400 max-w-sm text-sm">
        {status === 'expired'
          ? 'This invite link has expired. Ask your team admin to send a new invitation.'
          : 'This invite link is invalid or has already been used.'}
      </p>
      <button onClick={() => navigate('/')} className="mt-2 text-sm text-white hover:underline">
        Back to home
      </button>
    </div>
  );
}
