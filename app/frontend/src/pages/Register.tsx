import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { authApi } from '../utils/api';
import PasswordStrength from '../components/PasswordStrength';

export default function Register() {
  const navigate = useNavigate();
  const { setAuthLoading } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resending, setResending] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    if (password.length < 12) return toast.error('Password must be at least 12 characters');
    if (!agreedToPolicy) return toast.error('You must agree to the Privacy Policy and Terms of Service');
    setLoading(true);
    setAuthLoading(true);
    try {
      await authApi.register({ email, password, name });
      setRegistered(true);
      toast.success('Account created! Please verify your email.');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast.error(msg);
      setAuthLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success('Verification email resent');
    } catch (err) {
      toast.error('Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center text-ns-accent">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
            <p className="text-neutral-500 text-sm leading-relaxed mb-10">
              We've sent a verification link to <span className="text-white font-medium">{email}</span>. Please click the link to activate your account.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 border border-white/[0.08] text-white rounded-xl text-sm font-medium hover:bg-white/[0.04] transition-colors disabled:opacity-50"
              >
                {resending ? 'Sending...' : "Didn't receive? Resend link"}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4" data-testid="register-page">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">NS</span>
          </div>
          <span className="font-semibold text-white text-lg">Standor</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
          <h1 className="text-2xl font-bold text-white mb-1" data-testid="register-heading">Create account</h1>
          <p className="text-sm text-neutral-500 mb-6">Start analyzing network traffic for free.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                placeholder="Your name"
                data-testid="register-name-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                placeholder="you@company.com"
                data-testid="register-email-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors pr-10"
                  placeholder="Min. 12 characters"
                  data-testid="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                  data-testid="register-toggle-password"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-600 mt-1.5">Must be at least 12 characters</p>
              <PasswordStrength password={password} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={e => setAgreedToPolicy(e.target.checked)}
                  className="sr-only"
                  data-testid="register-privacy-checkbox"
                />
                <div className={`w-4 h-4 rounded border transition-colors ${agreedToPolicy ? 'bg-white border-white' : 'border-white/[0.2] bg-white/[0.04] group-hover:border-white/[0.4]'}`}>
                  {agreedToPolicy && (
                    <svg className="w-4 h-4 text-black" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-neutral-500 leading-relaxed">
                I agree to the{' '}
                <Link to="/privacy" className="text-neutral-300 hover:text-white underline underline-offset-2">Privacy Policy</Link>
                {' '}and{' '}
                <Link to="/terms" className="text-neutral-300 hover:text-white underline underline-offset-2">Terms of Service</Link>.
                {' '}I consent to my data being processed as described therein.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="register-submit-btn"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="bg-ns-bg-900 px-3 text-xs text-neutral-600">or</span></div>
          </div>

          <a
            href={authApi.googleUrl()}
            className="w-full py-2.5 border border-white/[0.1] rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:border-white/[0.2] transition-colors flex items-center justify-center gap-2.5"
            data-testid="register-google-btn"
          >
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.97 23.97 0 000 24c0 3.77.9 7.35 2.56 10.53l7.97-5.94z" /><path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.87-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.14 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.94C6.51 42.62 14.62 48 24 48z" /></svg>
            Continue with Google
          </a>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline font-medium" data-testid="register-login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
