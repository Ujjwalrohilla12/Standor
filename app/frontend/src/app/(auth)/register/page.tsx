'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const PERKS = [
  'Unlimited interview sessions',
  'AI code analysis on every session',
  'WebRTC video — no plugins needed',
  'Code execution in 20+ languages',
  '100% free, no credit card',
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, googleAuth } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-bg-surface p-12 lg:flex border-r border-border">
        <Link href="/" className="flex items-center gap-2.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
            <Zap className="h-4 w-4 text-teal-400" aria-hidden="true" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-text-primary">Standor</span>
        </Link>
        <div>
          <h2 className="mb-8 text-2xl font-bold text-text-primary">Everything you need, free.</h2>
          <ul className="space-y-4">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-text-secondary">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" aria-hidden="true" />
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-text-tertiary">© {new Date().getFullYear()} Standor</p>
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
            <h1 className="text-2xl font-extrabold text-text-primary">Create your account</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Already have one?{' '}
              <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mb-6">
            <GoogleLogin
              onSuccess={(cred) => {
                if (cred.credential) {
                  googleAuth(cred.credential)
                    .then(() => router.push('/dashboard'))
                    .catch((e: unknown) => toast.error(e instanceof Error ? e.message : 'Google sign-up failed'));
                }
              }}
              onError={() => toast.error('Google sign-up failed')}
              theme="filled_black"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-base px-3 text-text-tertiary">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name',  label: 'Full name', type: 'text',  Icon: User, placeholder: 'Jane Smith',       autoComplete: 'name' },
              { id: 'email', label: 'Email',     type: 'email', Icon: Mail, placeholder: 'you@company.com', autoComplete: 'email' },
            ].map(({ id, label, type, Icon, placeholder, autoComplete }) => (
              <div key={id}>
                <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-secondary">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                  <input
                    id={id}
                    type={type}
                    autoComplete={autoComplete}
                    required
                    value={form[id as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                    className="input pl-9"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pl-9 pr-10"
                  placeholder="Min 8 characters"
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Creating account" /> : 'Create account'}
            </button>

            <p className="text-center text-xs text-text-tertiary">
              By registering you agree to our{' '}
              <Link href="/terms" className="underline hover:text-text-secondary">Terms</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-text-secondary">Privacy Policy</Link>.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
