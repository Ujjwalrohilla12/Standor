import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, KeyRound, Mail } from 'lucide-react';
import useStore from '../store/useStore';
import { authApi, webauthnApi } from '../utils/api';
import { startAuthentication } from '@simplewebauthn/browser';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, setAuthLoading } = useStore();

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'oauth_failed') toast.error('Google sign-in failed. Please try again.');
  }, [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email) return toast.error('Enter your email address first');
    setMagicLinkLoading(true);
    try {
      await authApi.requestMagicLink(email);
      setMagicLinkSent(true);
      toast.success('Login link sent — check your inbox');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send login link');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    try {
      const opts = await webauthnApi.getAuthOptions(email || undefined);
      const response = await startAuthentication({ optionsJSON: opts });
      const res = await webauthnApi.verifyAuth(response, opts._challengeKey);
      localStorage.setItem('standor_token', res.token);
      setAuth(res.user, res.token);
      toast.success('Signed in with passkey');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Passkey authentication failed');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    setAuthLoading(true);
    try {
      const res = await authApi.login({ email, password });

      if (res.mfaRequired) {
        setMfaRequired(true);
        setMfaToken(res.mfaToken!);
        toast.info('Verification required');
        return;
      }

      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      toast.error(msg);
      setAuthLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode) return toast.error('Please enter verification code');
    setLoading(true);
    try {
      const res = await authApi.mfaVerify({ mfaToken, code: mfaCode });
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4" data-testid="login-page">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">NS</span>
          </div>
          <span className="font-semibold text-white text-lg">Standor</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
          <h1 className="text-2xl font-bold text-white mb-1" data-testid="login-heading">
            {mfaRequired ? 'Verify identity' : 'Sign in'}
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            {mfaRequired ? 'Enter the code from your authenticator app.' : 'Welcome back. Enter your credentials.'}
          </p>

          {!mfaRequired ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                  placeholder="you@company.com"
                  data-testid="login-email-input"
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
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                    data-testid="login-toggle-password"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="login-submit-btn"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-neutral-500 hover:text-white transition-colors" data-testid="login-forgot-link">Forgot password?</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">MFA Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl tracking-[0.5em] text-white focus:outline-none focus:border-white/[0.2] transition-colors"
                  placeholder="000000"
                  autoFocus
                  data-testid="login-mfa-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-ns-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="login-mfa-submit-btn"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Verify & Sign In
              </button>

              <button
                type="button"
                onClick={() => setMfaRequired(false)}
                className="w-full text-xs text-neutral-500 hover:text-white transition-colors text-center"
              >
                Back to credentials
              </button>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="bg-ns-bg-900 px-3 text-xs text-neutral-600">or</span></div>
          </div>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={magicLinkLoading || magicLinkSent}
            className="w-full py-2.5 border border-white/[0.1] rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:border-white/[0.2] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {magicLinkLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {magicLinkSent ? 'Link sent — check your inbox' : 'Sign in with Email Link'}
          </button>

          <button
            type="button"
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading}
            className="w-full py-2.5 border border-white/[0.1] rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:border-white/[0.2] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
            data-testid="login-passkey-btn"
          >
            {passkeyLoading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Sign in with Passkey
          </button>

          <a
            href={authApi.googleUrl()}
            className="w-full py-2.5 border border-white/[0.1] rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:border-white/[0.2] transition-colors flex items-center justify-center gap-2.5"
            data-testid="login-google-btn"
          >
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.97 23.97 0 000 24c0 3.77.9 7.35 2.56 10.53l7.97-5.94z" /><path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.87-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.14 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.94C6.51 42.62 14.62 48 24 48z" /></svg>
            Continue with Google
          </a>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:underline font-medium" data-testid="login-register-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
