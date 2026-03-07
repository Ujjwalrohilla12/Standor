'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* Left brand panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-bg-surface p-12 lg:flex border-r border-border">
        <Link href="/" className="flex items-center gap-2.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
            <Zap className="h-4 w-4 text-teal-400" aria-hidden="true" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-text-primary">Standor</span>
        </Link>
        <div>
          <blockquote className="text-xl font-medium leading-relaxed text-text-secondary">
            &ldquo;The cleanest interview platform we&rsquo;ve used. AI feedback saves us 2 hours
            per hire.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-text-tertiary">— Engineering Manager at a Series B startup</p>
        </div>
        <div className="flex gap-4 text-xs text-text-tertiary">
          <span>20+ languages</span>
          <span>·</span>
          <span>AI-powered</span>
          <span>·</span>
          <span>WebRTC video</span>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-text-primary">Welcome back</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Don&rsquo;t have an account?{' '}
              <Link href="/register" className="font-medium text-teal-400 hover:text-teal-300 hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Google OAuth */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={(cred) => {
                if (cred.credential) {
                  googleAuth(cred.credential)
                    .then(() => router.push('/dashboard'))
                    .catch((e: unknown) => toast.error(e instanceof Error ? e.message : 'Google sign-in failed'));
                }
              }}
              onError={() => toast.error('Google sign-in failed')}
              theme="filled_black"
              size="large"
              width="100%"
              text="signin_with"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-base px-3 text-text-tertiary">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input pl-9"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Signing in" /> : 'Sign in'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
