import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authApi } from '../utils/api';
import PasswordStrength from '../components/PasswordStrength';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4" data-testid="reset-password-invalid">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Invalid Reset Link</h1>
          <p className="text-sm text-neutral-500 mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-neutral-200 transition-colors">Request New Link</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4" data-testid="reset-password-success">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={24} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Password reset</h1>
          <p className="text-sm text-neutral-500 mb-8">Your password has been updated successfully.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-neutral-200 transition-colors" data-testid="reset-password-login-btn">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4" data-testid="reset-password-page">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">NS</span>
          </div>
          <span className="font-semibold text-white text-lg">Standor</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
          <h1 className="text-2xl font-bold text-white mb-1" data-testid="reset-password-heading">Set new password</h1>
          <p className="text-sm text-neutral-500 mb-6">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors pr-10"
                  placeholder="Min. 8 characters"
                  data-testid="reset-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="reset-password-submit-btn"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
