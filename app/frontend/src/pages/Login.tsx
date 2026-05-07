import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import useStore from "../store/useStore";
import api, { API_BASE } from "../lib/api";
import StandorLogo from "../components/StandorLogo";
import AnimatedHero from "../components/AnimatedHero";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setAuth } = useStore();
  const redirect = searchParams.get("redirect") || "/dashboard";

  // If user has token from OAuth redirect, capture it
  const urlToken = searchParams.get("token");
  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle OAuth token in URL
  useEffect(() => {
    if (urlToken) {
      api
        .get("/auth/me", { headers: { Authorization: `Bearer ${urlToken}` } })
        .then(({ data }) => {
          setAuth(data.user, urlToken);
          navigate(redirect, { replace: true });
        })
        .catch(() => setError("OAuth login failed. Please try again."));
    }
  }, [urlToken, setAuth, navigate, redirect]);

  useEffect(() => {
    if (oauthError) {
      setError("Google sign-in failed. Please try again.");
    }
  }, [oauthError]);

  // Already authenticated
  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, navigate, redirect]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        deviceId: `web-${navigator.userAgent.slice(0, 40)}`,
      });
      setAuth(data.user, data.accessToken);
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google?flow=login`;
  };

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e5e7eb] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(229,231,235,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.12),transparent_30%),linear-gradient(180deg,#171a1f_0%,#0e1013_100%)] px-6 py-8 lg:px-10 lg:py-10">
        <div className="relative z-10 flex h-full min-h-[28rem] flex-col justify-between gap-6 lg:min-h-auto">
          <div className="max-w-xl">
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <StandorLogo size={34} />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white font-semibold">Standor</p>
                <h2 className="text-lg font-semibold text-[#f5f7fa]">Human-led technical sessions</h2>
              </div>
            </Link>

            <div className="mt-8 space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[#4b4f55]">Sign in securely</p>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-[1.05] max-w-md text-[#f5f7fa]">
                A login experience that feels calm, clear, and alive.
              </h1>
              <p className="text-sm lg:text-base text-[#4b4f55] max-w-lg leading-relaxed">
                A responsive split layout keeps the form focused on the right while the left side carries a soft 3D scene and concise product messaging.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#2f3237]">Private</p>
              <p className="mt-2 text-sm text-[#f5f7fa]">Protected auth flow</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#2f3237]">Fast</p>
              <p className="mt-2 text-sm text-[#f5f7fa]">One-step account access</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#2f3237]">Human</p>
              <p className="mt-2 text-sm text-[#f5f7fa]">Soft 3D motion, not video</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30 backdrop-blur-md">
            <AnimatedHero variant="login" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 lg:px-10 lg:py-12">
        <div className="w-full max-w-[520px] rounded-[2rem] ns-glass p-6 sm:p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <StandorLogo size={32} />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Standor
              </h1>
            </Link>
            <p className="text-[#4b4f55] text-sm mt-2">
              Sign in to your account
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full ns-btn-primary mb-6"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-[#aab0b8] uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                data-testid="error-msg"
                className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#4b4f55] mb-1.5 uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aab0b8]" />
                <input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#17191d] border border-neutral-700 rounded-xl text-[#f5f7fa] text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#4b4f55] mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aab0b8]" />
                <input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-[#17191d] border border-neutral-700 rounded-xl text-[#f5f7fa] text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aab0b8] hover:text-[#f5f7fa] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-[#aab0b8] hover:text-[#f5f7fa] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              data-testid="login-btn"
              disabled={loading}
              className="w-full ns-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#aab0b8] mt-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#f5f7fa] hover:underline font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
