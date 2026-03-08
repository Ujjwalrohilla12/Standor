import { Shield, Lock, Eye, Server, FileCheck, Key, AlertTriangle, Users, CheckCircle2, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CONTROLS = [
  {
    icon: Lock,
    title: 'Encryption in Transit',
    desc: 'All API and WebSocket traffic is encrypted via TLS 1.2+. HSTS enforced. No unencrypted channels.',
  },
  {
    icon: Database,
    title: 'Encryption at Rest',
    desc: 'PCAP data, annotations, and session metadata are encrypted at rest using AES-256. Bring Your Own Key (BYOK) available for enterprise deployments.',
  },
  {
    icon: Server,
    title: 'Sandboxed Parsing',
    desc: 'PCAP parsing runs in isolated worker processes with strict memory and CPU limits. A malformed file cannot affect other sessions or users.',
  },
  {
    icon: Users,
    title: 'Role-Based Access Control',
    desc: 'Granular RBAC with user, org-admin, and platform-admin roles. Every API endpoint enforces permission checks independently.',
  },
  {
    icon: ShieldCheck,
    title: 'SSO & MFA',
    desc: 'OIDC/SAML SSO for enterprise identity providers. TOTP and hardware key (WebAuthn/FIDO2) MFA available for all accounts.',
  },
  {
    icon: FileCheck,
    title: 'Immutable Audit Logs',
    desc: 'Every authentication event, permission change, export, and policy modification is logged to an append-only audit trail with timestamp and IP.',
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    desc: 'Payload storage is opt-in. Raw packet payloads are never stored unless explicitly enabled per-session. Obfuscation and retention controls are first-class features.',
  },
  {
    icon: Key,
    title: 'API Key Security',
    desc: 'API keys are shown only once at creation time. Keys are stored as SHA-256 hashes. Scoped, revocable, and audited.',
  },
  {
    icon: AlertTriangle,
    title: 'Anomaly & Entropy Detection',
    desc: 'Server-side Shannon entropy scoring flags high-entropy payloads automatically. Policy rules can trigger webhook alerts for suspicious traffic patterns.',
  },
];

const COMPLIANCE = [
  { label: 'TLS 1.2+', detail: 'All endpoints enforce minimum TLS 1.2 with strong cipher suites' },
  { label: 'GDPR', detail: 'Data export and deletion endpoints available; consent records stored' },
  { label: 'Argon2id', detail: 'Passwords hashed with Argon2id, 64 MB memory cost, time cost 3' },
  { label: 'HIBP Check', detail: 'New passwords checked against Have I Been Pwned k-anonymity API' },
  { label: 'CSRF Protection', detail: 'SameSite cookies and CSRF tokens on all state-mutating endpoints' },
  { label: 'Rate Limiting', detail: '300 requests / 15 min per IP; auth endpoints have stricter limits' },
  { label: 'Input Validation', detail: 'All user input sanitized and validated server-side before processing' },
  { label: 'Secret Management', detail: 'Secrets via environment variables; never committed to source control' },
];

export default function Security() {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">

        {/* Hero */}
        <div className="max-w-4xl mb-32">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] font-mono text-ns-accent uppercase tracking-[0.4em] px-4 py-1.5 rounded-full bg-ns-accent/10 border border-ns-accent/20">
              Security
            </span>
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            Security is not<br />
            <span className="text-ns-grey-600">a feature. It's a foundation.</span>
          </h1>
          <p className="text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Standor is built for security teams by security engineers. Every layer of the stack is designed with defence-in-depth, least privilege, and zero-trust principles.
          </p>
        </div>

        {/* Security Controls Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-48">
          {CONTROLS.map((c) => (
            <div key={c.title} className="group ns-glass-dark rounded-3xl border border-white/[0.05] p-8 hover:border-white/[0.12] transition-all duration-500">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-ns-accent mb-6 group-hover:scale-110 transition-transform">
                <c.icon size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-3 tracking-tight">{c.title}</h3>
              <p className="text-sm text-ns-grey-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Compliance Checklist */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-48">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tighter mb-6 leading-[0.95]">
              Compliance &<br />hardening checklist
            </h2>
            <p className="text-lg text-ns-grey-400 leading-relaxed mb-8">
              Standor implements security hardening at every layer. Below is a summary of implemented controls as of the current release.
            </p>
            <button
              onClick={() => navigate('/docs')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.1] text-white rounded-full text-sm font-medium hover:border-white/[0.25] transition-colors group"
            >
              Technical documentation <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-3">
            {COMPLIANCE.map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                <CheckCircle2 size={16} className="text-ns-success mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-white">{item.label}</span>
                  <span className="text-ns-grey-500 text-xs mx-2">—</span>
                  <span className="text-xs text-ns-grey-500">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Handling Summary */}
        <div className="ns-glass rounded-[3rem] border border-white/[0.08] p-12 md:p-20 mb-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-ns-accent/3 blur-[120px] -z-10" />
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 tracking-tight leading-tight">How your PCAP data is handled</h2>
              <div className="space-y-5 text-sm text-ns-grey-400 leading-relaxed">
                <p>
                  <strong className="text-white">Cloud deployment:</strong> PCAP files are uploaded over TLS, parsed server-side in an isolated worker, and immediately discarded. Only extracted metadata (packet headers, protocol fields, entropy scores) is persisted. Raw payloads are never stored by default.
                </p>
                <p>
                  <strong className="text-white">On-premises:</strong> The entire platform can be deployed in your own infrastructure. Your raw captures never leave your network. This is the recommended deployment for sensitive forensic investigations.
                </p>
                <p>
                  <strong className="text-white">Payload storage:</strong> Full payload storage is opt-in and disabled by default. When enabled, payloads are encrypted at rest and subject to configurable retention policies.
                </p>
                <p>
                  <strong className="text-white">Retention:</strong> Sessions and packets can be automatically purged after a configurable number of days. Org admins control retention periods via the settings panel.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 tracking-tight leading-tight">Access and identity</h2>
              <div className="space-y-5 text-sm text-ns-grey-400 leading-relaxed">
                <p>
                  <strong className="text-white">Authentication:</strong> Email + password (Argon2id), Google OIDC, magic link, and hardware passkeys (WebAuthn). MFA is strongly encouraged and enforced per-org by admins.
                </p>
                <p>
                  <strong className="text-white">Sessions:</strong> Short-lived JWT access tokens (15 min) combined with rotating refresh tokens (7 days). All active sessions are visible and revocable from the account settings panel.
                </p>
                <p>
                  <strong className="text-white">Re-authentication:</strong> Sensitive operations — changing password, deleting your account, creating API keys — require a fresh authentication within 15 minutes.
                </p>
                <p>
                  <strong className="text-white">Enterprise SSO:</strong> OIDC and SAML connectors available for enterprise customers. Domain-locked provisioning and Just-In-Time (JIT) user creation supported.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Questions about security?</h2>
          <p className="text-lg text-ns-grey-400 mb-10 max-w-xl mx-auto">
            We welcome security researchers and enterprise procurement teams to review our documentation and contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/docs')}
              className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-ns-grey-100 transition-all"
            >
              Read technical docs
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white rounded-full font-bold text-sm hover:bg-white/[0.1] transition-all"
            >
              Contact security team
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
