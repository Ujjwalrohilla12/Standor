import { ArrowRight, Key, Gauge, Zap, Upload, BarChart2, Bell, Users, Shield, ExternalLink } from 'lucide-react';

const ENDPOINTS = [
  { method: 'POST', path: '/api/auth/register', desc: 'Create a developer account' },
  { method: 'POST', path: '/api/auth/login', desc: 'Authenticate a user and return access token' },
  { method: 'POST', path: '/api/interviews', desc: 'Create a new coding interview session' },
  { method: 'GET', path: '/api/interviews', desc: 'List all interviews for the authenticated user' },
  { method: 'GET', path: '/api/interviews/:id', desc: 'Retrieve interview session metadata' },
  { method: 'POST', path: '/api/code/execute', desc: 'Execute candidate code inside sandbox runtime' },
  { method: 'POST', path: '/api/code/analyze', desc: 'Run AI code evaluation and complexity analysis' },
  { method: 'POST', path: '/api/webhooks', desc: 'Register webhook events for interview lifecycle' },
];

export default function ApiSdks() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        {/* Header */}
        <div className="max-w-4xl mb-32">
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            Built for <br />
            <span className="text-ns-grey-600">engineering teams.</span>
          </h1>
          <p className="text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Integrate Standor directly into your hiring workflow, engineering platform, or internal tooling using a developer-first REST API.
          </p>
        </div>

        {/* Capability Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {[
            { icon: Key, title: 'Secure Authentication', desc: 'JWT-based authentication with refresh tokens, Google OAuth login, and API keys for automated interview workflows.' },
            { icon: Gauge, title: 'Real-time Infrastructure', desc: 'Standor synchronizes collaborative editors, code execution events, and interview state across participants with millisecond latency.' },
            { icon: Bell, title: 'Event Webhooks', desc: 'Receive webhook events for interview creation, candidate code execution, AI evaluation results, and completed interview sessions.' },
          ].map((card, i) => (
            <div key={i} className="ns-glass-dark rounded-[2rem] border border-white/[0.05] p-8 hover:border-white/10 transition-all">
              <card.icon size={20} className="text-ns-accent mb-6" />
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-ns-grey-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Endpoint Showcase */}
        <div className="mb-32">
          <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">REST API Endpoints</h2>
          <p className="text-ns-grey-500 mb-8 max-w-2xl">
            The full OpenAPI 3.0 spec is available at{' '}
            <span className="font-mono text-ns-accent text-sm">/api/docs.json</span> and rendered as
            interactive Swagger UI at{' '}
            <span className="font-mono text-ns-accent text-sm">/api/docs</span>.
          </p>
          <div className="ns-glass rounded-[2rem] border border-white/[0.04] overflow-hidden">
            {ENDPOINTS.map((ep, i) => (
              <div key={i} className="group flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all border-b border-white/[0.04] last:border-none">
                <div className="flex items-center gap-6">
                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${ep.method === 'GET' ? 'bg-ns-success/5 border-ns-success/20 text-ns-success' : 'bg-ns-accent/5 border-ns-accent/20 text-ns-accent'}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-white tracking-tight">{ep.path}</code>
                </div>
                <span className="text-xs text-ns-grey-600 group-hover:text-ns-grey-400 transition-colors hidden md:block">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="mb-32">
          <h2 className="text-2xl font-bold text-white mb-12 tracking-tight">Platform Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Upload,
                title: 'Cloud PCAP Ingestion',
                desc: 'Upload PCAP and PCAPNG files directly from your browser — up to 100 MB. No local tools, no command line. Parsing, entropy scoring, anomaly detection, and deep packet inspection all run server-side and complete in seconds.',
              },
              {
                icon: BarChart2,
                title: 'Deep Packet Inspection',
                desc: 'Every uploaded capture is automatically classified by application — HTTPS, DNS, YouTube, Discord, GitHub, Zoom, and 30+ more categories. Detected domains, flow counts, and application breakdowns are immediately available in the session view.',
              },
              {
                icon: Zap,
                title: 'Policy Rules Engine',
                desc: 'Define custom alert conditions — for example, trigger a webhook when a session contains high-entropy traffic on non-standard ports. Rules are evaluated on every upload and fire the alert.triggered webhook event when matched.',
              },
              {
                icon: Users,
                title: 'Collaborative Sessions',
                desc: 'Multiple analysts can work in the same session simultaneously. Live cursors, real-time annotation sync via Yjs CRDTs and Socket.io, and threaded comments keep everyone in sync without conflicts.',
              },
              {
                icon: Shield,
                title: 'Enterprise Authentication',
                desc: 'SAML 2.0 SSO for centralised identity management, WebAuthn passkeys for passwordless login, TOTP MFA with backup codes, and Magic Link for frictionless access — all configurable per organisation.',
              },
              {
                icon: Key,
                title: 'Audit & Governance',
                desc: 'Every user action is recorded in an immutable audit log. Data retention policies, payload storage opt-in, and full GDPR-compliant data export and deletion are available in account settings.',
              },
            ].map((item, i) => (
              <div key={i} className="ns-glass rounded-[2rem] border border-white/[0.04] p-8 hover:border-white/10 transition-all group">
                <item.icon size={20} className="text-ns-accent mb-5" />
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-ns-grey-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication guide */}
        <div className="ns-glass rounded-[2rem] border border-white/[0.04] p-10 mb-32">
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">API Authentication</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Access Tokens</h3>
              <p className="text-sm text-ns-grey-500 leading-relaxed mb-4">
                Sign in via the web UI or the <span className="font-mono text-ns-accent">POST /api/auth/login</span> endpoint to receive a short-lived access token (15 minutes). Pass it as a Bearer token in the <span className="font-mono text-ns-accent">Authorization</span> header of every API request. A rotating refresh token is automatically stored in an httpOnly cookie.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-3">API Keys</h3>
              <p className="text-sm text-ns-grey-500 leading-relaxed mb-4">
                For automated or server-to-server access, generate an API key in Settings → API Keys. Keys do not expire but can be revoked at any time. Pass the key as a Bearer token — it works identically to a session access token.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <a href="/docs#apikeys" className="flex items-center gap-2 text-sm font-bold text-ns-accent hover:opacity-80 transition-opacity">
              Read the full authentication guide <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* GitHub Section */}
        <div className="relative ns-glass-dark rounded-[3.5rem] border border-white/[0.05] p-16 flex flex-col md:flex-row items-center justify-between gap-12 group overflow-hidden">
          <div className="absolute inset-0 bg-ns-accent/5 blur-[120px] -z-10 group-hover:bg-ns-accent/10 transition-colors" />
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tighter">Open Source</h3>
            <p className="text-ns-grey-400">Standor is open source. Explore the codebase, report issues, request features, or contribute improvements on GitHub.</p>
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/standor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all text-xs uppercase tracking-widest shadow-2xl"
            >
              <ExternalLink size={16} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
