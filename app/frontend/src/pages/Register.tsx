import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, ArrowRight } from "lucide-react";
import api, { API_BASE } from "../lib/api";
import useStore from "../store/useStore";
import StandorLogo from "../components/StandorLogo";
import AnimatedHero from "../components/AnimatedHero";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setAuth } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const urlToken = searchParams.get("token");
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (urlToken) {
      api
        .get("/auth/me", { headers: { Authorization: `Bearer ${urlToken}` } })
        .then(({ data }) => {
          setAuth(data.user, urlToken);
          navigate("/dashboard", { replace: true });
        })
        .catch(() => setError("OAuth sign-up failed. Please try again."));
    }
  }, [urlToken, setAuth, navigate]);

  useEffect(() => {
    if (oauthError) {
      setError("Google sign-up failed. Please try again.");
    }
  }, [oauthError]);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 12) {
      setError("Password must be at least 12 characters");
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the terms to continue.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE}/api/auth/google?flow=register`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0e1013] grid lg:grid-cols-2 text-[#e5e7eb]">
        <div className="hidden lg:flex items-center justify-center border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(229,231,235,0.14),transparent_34%),linear-gradient(180deg,#171a1f_0%,#0e1013_100%)] px-10 py-12">
          <AnimatedHero variant="register" sceneProps={{ triggerSuccess: success }} />
        </div>
        <div className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="max-w-md text-center rounded-[2rem] ns-glass p-8 shadow-2xl shadow-black/40">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-[#f5f7fa]" />
            </div>
            <h2 className="text-xl font-bold text-[#f5f7fa] mb-3">
              Check your email
            </h2>
            <p className="text-[#4b4f55] text-sm mb-6">
              We've sent a verification link to <strong className="text-[#f5f7fa]">{email}</strong>. Click the link to activate your account.
            </p>
            <Link
              to="/login"
              className="ns-btn-primary inline-flex items-center gap-2"
            >
              Go to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e5e7eb] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(229,231,235,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.12),transparent_30%),linear-gradient(180deg,#171a1f_0%,#0e1013_100%)] px-6 py-8 lg:px-10 lg:py-10">
        <div className="relative z-10 flex h-full min-h-[28rem] flex-col justify-between gap-6 lg:min-h-auto">
          <div className="max-w-xl">
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <StandorLogo size={34} />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white font-semibold">Standor</p>
                <h2 className="text-lg font-semibold text-[#f5f7fa]">Create your workspace</h2>
              </div>
            </Link>

            <div className="mt-8 space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[#4b4f55]">Start free</p>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-[1.05] max-w-md text-[#f5f7fa]">
                A signup flow that feels spacious and human.
              </h1>
              <p className="text-sm lg:text-base text-[#4b4f55] max-w-lg leading-relaxed">
                The form stays on the right while the left side gives the page depth with soft 3D motion and concise product signals.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#2f3237]">Secure</p>
              <p className="mt-2 text-sm text-[#f5f7fa]">Email verification included</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#2f3237]">Responsive</p>
              <p className="mt-2 text-sm text-[#f5f7fa]">Optimized for desktop and mobile</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#2f3237]">Animated</p>
              <p className="mt-2 text-sm text-[#f5f7fa]">Interactive 3D scene on the left</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30 backdrop-blur-md">
            <AnimatedHero variant="register" sceneProps={{ triggerSuccess: success }} />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 lg:px-10 lg:py-12">
        <div className="w-full max-w-[520px] rounded-[2rem] ns-glass p-6 sm:p-8 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <StandorLogo size={32} />
              <span className="text-white font-semibold text-xl tracking-tight">
                Standor
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-[#f5f7fa] mb-2 tracking-tight">
              Create account
            </h1>
            <p className="text-[#4b4f55] text-[15px]">
              Start conducting technical interviews for free.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="name" className="block text-[13px] text-[#4b4f55] mb-2 font-medium">
                Name
              </label>
              <input
                id="name"
                data-testid="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-[#17191d] border border-neutral-700 rounded-xl text-[#f5f7fa] text-[15px] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[13px] text-[#4b4f55] mb-2 font-medium">
                Email
              </label>
              <input
                id="email"
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#17191d] border border-neutral-700 rounded-xl text-[#f5f7fa] text-[15px] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] text-[#4b4f55] mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 12 characters"
                  required
                  autoComplete="new-password"
                  className="w-full pl-4 pr-12 py-3 bg-[#17191d] border border-neutral-700 rounded-xl text-[#f5f7fa] text-[15px] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aab0b8] hover:text-[#f5f7fa] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              <p className="text-[12px] text-[#aab0b8] mt-2">
                Must be at least 12 characters
              </p>
            </div>

            <div className="flex items-start gap-3 mt-2">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 bg-[#111] border-[#333] rounded focus:ring-0 checked:bg-white checked:border-white transition-all cursor-pointer appearance-none relative before:content-[''] before:absolute before:hidden checked:before:block before:w-[4px] before:h-[8px] before:border-r-[2px] before:border-b-[2px] before:border-black before:rotate-45 before:left-[5.5px] before:top-[2.5px]"
                />
              </div>
              <label htmlFor="terms" className="text-[12px] leading-[18px] text-[#4b4f55] cursor-pointer">
                I agree to the{" "}
                <Link to="/privacy" className="text-[#f5f7fa] hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/terms" className="text-[#f5f7fa] hover:underline">
                  Terms of Service
                </Link>
                . I consent to my data being processed as described therein.
              </label>
            </div>

            <button
              type="submit"
              data-testid="register-btn"
              disabled={loading}
              className="w-full ns-btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-[#aab0b8]">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogleRegister}
            className="w-full ns-btn-secondary"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-[18px] h-[18px]"
              aria-hidden="true"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-[13px] text-[#2f3237] mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-[#f5f7fa] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
