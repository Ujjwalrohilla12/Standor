import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Server, Cloud, Lock, Database, Eye, Trash2,
  HardDrive, Globe, CheckCircle2, ArrowRight, FileText,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 90, damping: 18 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Section wrapper ──────────────────────────────── */
function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      className="ns-glass rounded-[2rem] border border-white/[0.05] p-8 sm:p-10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center">
          <Icon size={16} className="text-ns-accent" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-ns-grey-400 leading-relaxed">
      <CheckCircle2 size={14} className="text-ns-success shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

/* ── Deployment comparison table ────────────────── */
const COMPARISON = [
  { topic: 'PCAP storage location', cloud: 'Encrypted at rest on Standor-managed S3 (AES-256)', onprem: 'Your own storage — Standor never receives raw packets' },
  { topic: 'Payload indexing', cloud: 'Off by default; opt-in full-payload mode in Settings', onprem: 'Fully controlled by your team policies' },
  { topic: 'Metadata (IPs, ports, protocols)', cloud: 'Stored in MongoDB; encrypted at rest; isolated per tenant', onprem: 'Stored in your MongoDB instance' },
  { topic: 'Retention period', cloud: 'Configurable per org (1–365 days or indefinite)', onprem: 'Configured by your team in docker-compose / helm values' },
  { topic: 'Data residency', cloud: 'US-East by default; EU region available on request', onprem: 'Any region you deploy to' },
  { topic: 'Access by Standor staff', cloud: 'Zero access to raw PCAPs; aggregated metrics only via consent', onprem: 'None — no telemetry unless you configure it' },
  { topic: 'Audit trail', cloud: 'Immutable audit log stored in separate collection', onprem: 'Immutable audit log in your database' },
  { topic: 'TLS in transit', cloud: 'TLS 1.3 enforced for all API and WebSocket traffic', onprem: 'Configurable; TLS recommended for production' },
];

/* ── Retention policy cards ─────────────────────── */
const RETENTION_TIERS = [
  {
    label: 'Default',
    value: '90 days',
    desc: 'Sessions and packet metadata purged automatically after 90 days. Annotations retained for 30 additional days.',
  },
  {
    label: 'Custom (Cloud)',
    value: '1–365 days',
    desc: 'Set per-org retention in Settings → Organisation → Data Retention. Requires Owner or Admin role.',
  },
  {
    label: 'On-Prem',
    value: 'Your policy',
    desc: 'Configure RETENTION_DAYS in your .env or helm values. Set to 0 to disable automatic purge.',
  },
  {
    label: 'Indefinite',
    value: 'Never purge',
    desc: 'Available for compliance-critical workloads. Contact us to discuss storage implications.',
  },
];

export default function PrivacyData() {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 px-6 bg-ns-bg-900">
      <div className="ns-container max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ns-accent/10 border border-ns-accent/20 text-[10px] font-bold text-ns-accent uppercase tracking-[0.2em] mb-8">
            Privacy & Data Handling
          </div>
          <h1 className="text-[clamp(2rem,6vw,4rem)] font-bold text-white leading-tight tracking-tighter mb-6">
            How Standor handles<br />
            <span className="text-ns-grey-600">your packet data.</span>
          </h1>
          <p className="text-xl text-ns-grey-400 leading-relaxed max-w-2xl">
            PCAPs contain some of your most sensitive network evidence. This page gives you a precise,
            non-marketing explanation of where your data lives, who can access it, and how long it's kept.
          </p>
        </motion.div>

        {/* Sections */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Cloud vs On-Prem */}
          <Section title="Cloud vs. On-Prem deployment" icon={Cloud}>
            <p className="text-sm text-ns-grey-500 mb-6 leading-relaxed">
              Standor is available as a hosted cloud service and as a self-hosted deployment (Docker Compose / Kubernetes).
              The table below describes where data lives in each mode.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest py-3 pr-6 w-1/4">Topic</th>
                    <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest py-3 pr-6 w-[37.5%]">
                      <Cloud size={10} className="inline mr-1.5 text-ns-accent" />Cloud (hosted)
                    </th>
                    <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest py-3 w-[37.5%]">
                      <Server size={10} className="inline mr-1.5 text-ns-teal" />On-Prem / Self-hosted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 pr-6 text-ns-grey-400 font-medium align-top">{row.topic}</td>
                      <td className="py-3.5 pr-6 text-ns-grey-500 leading-relaxed align-top">{row.cloud}</td>
                      <td className="py-3.5 text-ns-grey-500 leading-relaxed align-top">{row.onprem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Payload storage opt-in */}
          <Section title="Full payload storage (opt-in)" icon={HardDrive}>
            <p className="text-sm text-ns-grey-500 mb-5 leading-relaxed">
              By default, Standor stores only packet <strong className="text-ns-grey-300">metadata</strong> — timestamps,
              IP addresses, ports, TCP flags, protocols, and entropy scores. Raw payload bytes are <em>not</em> persisted.
            </p>
            <ul className="space-y-3 mb-6">
              <Bullet>Metadata indexing: always on, minimal storage footprint.</Bullet>
              <Bullet>Full payload storage: disabled by default. Enable per-account in <strong className="text-white">Settings → Data Governance</strong>.</Bullet>
              <Bullet>When enabled, payloads are stored encrypted (AES-256) and are only accessible to members of the owning org.</Bullet>
              <Bullet>On-prem deployments: controlled by the <code className="text-ns-accent bg-white/[0.04] px-1 rounded">STORE_FULL_PAYLOAD</code> env var.</Bullet>
            </ul>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-4 text-xs text-ns-grey-500 leading-relaxed">
              <strong className="text-ns-grey-300">Why off by default?</strong>{' '}
              Many compliance frameworks (HIPAA, PCI-DSS, GDPR) restrict storage of full packet payloads, which may contain
              credentials, PII, or proprietary data. Opt-in gives your security team explicit control.
            </div>
          </Section>

          {/* Retention */}
          <Section title="Data retention policies" icon={Trash2}>
            <p className="text-sm text-ns-grey-500 mb-6 leading-relaxed">
              Session metadata and packet records are automatically purged after the configured retention window.
              Audit logs are retained separately per compliance requirements.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {RETENTION_TIERS.map((tier, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest">{tier.label}</span>
                    <span className="text-sm font-bold text-white font-mono">{tier.value}</span>
                  </div>
                  <p className="text-xs text-ns-grey-600 leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-3">
              <Bullet>Retention is enforced server-side regardless of UI access.</Bullet>
              <Bullet>Changing retention applies to future sessions; existing sessions respect the policy at time of creation.</Bullet>
              <Bullet>Audit logs are immutable and kept for a minimum of 1 year (cloud), or as configured (on-prem).</Bullet>
            </ul>
          </Section>

          {/* Access controls */}
          <Section title="Who can access your data" icon={Eye}>
            <ul className="space-y-3">
              <Bullet>Only authenticated members of your organisation can view sessions and packets.</Bullet>
              <Bullet>RBAC enforces owner / admin / member roles — members cannot export or delete sessions without elevated role.</Bullet>
              <Bullet>All data access is logged in the immutable audit trail (Settings → Audit Log).</Bullet>
              <Bullet>Standor staff have <strong className="text-white">zero access</strong> to raw PCAP content or decrypted payloads on the cloud deployment.</Bullet>
              <Bullet>Support access to your account (e.g. for billing enquiries) requires your explicit written consent and is logged.</Bullet>
            </ul>
          </Section>

          {/* Encryption */}
          <Section title="Encryption & transport security" icon={Lock}>
            <ul className="space-y-3">
              <Bullet>All data in transit protected by TLS 1.3; TLS 1.0 / 1.1 are disabled.</Bullet>
              <Bullet>Data at rest encrypted with AES-256; keys managed via AWS KMS (cloud) or your own KMS (on-prem).</Bullet>
              <Bullet>PCAP files are parsed in an isolated sandbox — the raw file is deleted after parsing unless full-payload storage is enabled.</Bullet>
              <Bullet>JWT signing keys rotated quarterly; signing algorithm: HS256 (HS512 available on request for enterprise).</Bullet>
              <Bullet>Passwords hashed with Argon2id (memory: 64 MB, iterations: 3) — never stored in recoverable form.</Bullet>
            </ul>
          </Section>

          {/* GDPR */}
          <Section title="GDPR & privacy rights" icon={Globe}>
            <p className="text-sm text-ns-grey-500 mb-5 leading-relaxed">
              Standor is GDPR-ready for customers operating in the EU/EEA. The following rights are supported:
            </p>
            <ul className="space-y-3 mb-6">
              <Bullet><strong className="text-white">Right to access:</strong> Export all personal data and session metadata via Settings → Export Data (machine-readable JSON).</Bullet>
              <Bullet><strong className="text-white">Right to erasure:</strong> Delete your account and all associated data from Settings → Delete Account (irreversible, 30-day grace period).</Bullet>
              <Bullet><strong className="text-white">Right to portability:</strong> Session snapshots export as signed JSON/ZIP archives.</Bullet>
              <Bullet><strong className="text-white">Consent records:</strong> Newsletter and analytics consent stored with timestamps and auditable.</Bullet>
              <Bullet><strong className="text-white">Data Processing Agreement (DPA):</strong> Available on request for enterprise customers processing third-party PII.</Bullet>
            </ul>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/privacy')}
                className="flex items-center gap-1.5 text-xs font-bold text-ns-grey-400 hover:text-white transition-colors"
              >
                <FileText size={13} />
                Privacy Policy
              </button>
              <button
                onClick={() => navigate('/terms')}
                className="flex items-center gap-1.5 text-xs font-bold text-ns-grey-400 hover:text-white transition-colors"
              >
                <FileText size={13} />
                Terms of Service
              </button>
              <button
                onClick={() => navigate('/legal')}
                className="flex items-center gap-1.5 text-xs font-bold text-ns-grey-400 hover:text-white transition-colors"
              >
                <FileText size={13} />
                DPA & Cookie Policy
              </button>
            </div>
          </Section>

          {/* On-prem data isolation */}
          <Section title="On-prem data isolation" icon={Server}>
            <p className="text-sm text-ns-grey-500 mb-5 leading-relaxed">
              Self-hosted deployments give you complete data sovereignty. Standor's on-prem build is a standard
              Docker Compose / Helm stack — no callbacks to Standor infrastructure are made unless you configure them.
            </p>
            <ul className="space-y-3 mb-6">
              <Bullet>All processing happens inside your network perimeter.</Bullet>
              <Bullet>MongoDB runs in your own cluster; no external connections required.</Bullet>
              <Bullet>SMTP, SIEM, and webhook integrations point to your own endpoints.</Bullet>
              <Bullet>Telemetry (Prometheus, OpenTelemetry) sent only to your configured collectors.</Bullet>
              <Bullet>License validation is offline — no SaaS dependency for core functionality.</Bullet>
            </ul>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/docs')}
                className="group flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider hover:text-ns-accent transition-colors"
              >
                Self-hosted setup guide
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="group flex items-center gap-2 text-xs font-bold text-ns-grey-500 uppercase tracking-wider hover:text-white transition-colors"
              >
                Talk to security team
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Section>

          {/* Database */}
          <Section title="Data storage architecture" icon={Database}>
            <ul className="space-y-3 mb-5">
              <Bullet>Sessions and packet metadata: MongoDB (separate collection per type, org-scoped queries).</Bullet>
              <Bullet>Payloads (opt-in): stored as encrypted binary blobs, referenced by packet ID.</Bullet>
              <Bullet>Annotations and audit logs: append-only collections; no UPDATE operations on committed records.</Bullet>
              <Bullet>Refresh tokens and API keys: stored as Argon2id hashes — originals never persisted.</Bullet>
              <Bullet>Full-text search: compound text index on protocol, src, dst, flags with weighted scoring.</Bullet>
              <Bullet>Backups: daily snapshots with 30-day point-in-time recovery (cloud); documented procedure for on-prem.</Bullet>
            </ul>
            <p className="text-xs text-ns-grey-700">
              Architecture diagrams and detailed data flow documentation available on the{' '}
              <button onClick={() => navigate('/architecture')} className="text-ns-grey-500 hover:text-white underline underline-offset-2 transition-colors">Architecture page</button>.
            </p>
          </Section>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="text-lg font-bold text-white mb-1">Questions about data handling?</p>
            <p className="text-sm text-ns-grey-500">Our security team responds within 24 hours.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => navigate('/contact')}
              className="px-7 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-ns-grey-100 transition-all"
            >
              Contact Security Team
            </button>
            <button
              onClick={() => navigate('/security')}
              className="px-7 py-3 border border-white/10 text-white rounded-full font-bold text-sm hover:bg-white/5 transition-all"
            >
              Security Overview
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
