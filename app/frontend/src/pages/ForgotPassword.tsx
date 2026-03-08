import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { authApi } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4" data-testid="forgot-password-sent">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
            <Mail size={24} className="text-neutral-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm text-neutral-500 mb-8">If an account exists for <span className="text-neutral-300">{email}</span>, we've sent a password reset link.</p>
          <Link to="/login" className="text-sm text-white hover:underline font-medium">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4" data-testid="forgot-password-page">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">NS</span>
          </div>
          <span className="font-semibold text-white text-lg">Standor</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
          <h1 className="text-2xl font-bold text-white mb-1" data-testid="forgot-password-heading">Reset password</h1>
          <p className="text-sm text-neutral-500 mb-6">Enter your email and we'll send you a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                placeholder="you@company.com"
                data-testid="forgot-password-email-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="forgot-password-submit-btn"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Send Reset Link
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            <Link to="/login" className="text-white hover:underline font-medium flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
