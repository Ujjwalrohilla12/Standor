import { Shield, Lock, Eye, Database, Globe, ArrowRight } from 'lucide-react';

export default function Privacy() {
  const sections = [
    { id: 'data-collection', title: '1. Forensic Data Collection' },
    { id: 'encryption', title: '2. Encryption & Sovereignty' },
    { id: 'retention', title: '3. Data Retention Policies' },
    { id: 'third-party', title: '4. Third-Party Processing' },
    { id: 'rights', title: '5. Your Forensic Rights' },
  ];

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        <div className="grid lg:grid-cols-[250px_1fr] gap-16">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block sticky top-32 h-fit">
            <h5 className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest mb-8">On this page</h5>
            <ul className="space-y-4">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-sm text-ns-grey-500 hover:text-white transition-colors">{s.title}</a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <article className="max-w-3xl">
            <div className="mb-20">
              <h1 className="text-5xl font-bold text-white mb-6 tracking-tighter text-glow">Privacy & Data Sovereignty</h1>
              <p className="text-xl text-ns-grey-400 leading-relaxed font-medium">
                Last Updated: February 26, 2026. <br />
                Standor is designed for security professionals who handle sensitive network data. Our privacy model is built on the principle of zero trust.
              </p>
            </div>

            <div className="space-y-24">
              <section id="data-collection">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[0].title}</h2>
                <div className="prose prose-invert max-w-none text-ns-grey-500 space-y-6">
                  <p>
                    When you upload a PCAP or PCAP-NG file to Standor, we process the packet data to extract metadata (5-tuple, protocol flags, entropy scores). This data is stored in our secure, encrypted environment for the duration of your session.
                  </p>
                  <ul className="space-y-3 list-disc pl-5">
                    <li>We do not "phone home" with your packet data.</li>
                    <li>We do not use your forensic data for model training or advertising.</li>
                    <li>Session metadata is accessible only to users you explicitly invite to your workspace.</li>
                  </ul>
                </div>
              </section>

              <section id="encryption">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[1].title}</h2>
                <div className="ns-glass-dark rounded-3xl border border-white/5 p-10 mb-8 flex items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center text-ns-accent shrink-0">
                    <Lock size={24} />
                  </div>
                  <p className="text-sm text-ns-grey-400 leading-relaxed font-medium">
                    All forensic data at rest is encrypted via AES-256-GCM. In transit, we enforce TLS 1.3 with HSTS and perfect forward secrecy.
                  </p>
                </div>
                <p className="text-ns-grey-500 leading-relaxed">
                  For organizations with higher sovereignty requirements, Standor offers "Studio" and "Sovereign" tiers which support Bring Your Own Key (BYOK) and full VPC isolation.
                </p>
              </section>

              <section id="retention">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[2].title}</h2>
                <p className="text-ns-grey-500 leading-relaxed mb-6">
                  By default, session data is retained until deleted by a workspace administrator. You can configure automated retention policies (e.g., 30, 90, 365 days) to comply with your organization's legal requirements.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs font-mono text-ns-grey-600 uppercase tracking-widest mb-2">PCAP Retention</p>
                    <p className="text-white font-bold">User Defined</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs font-mono text-ns-grey-600 uppercase tracking-widest mb-2">Audit Log Retention</p>
                    <p className="text-white font-bold">7 Years (Default)</p>
                  </div>
                </div>
              </section>

              <section id="third-party">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[3].title}</h2>
                <p className="text-ns-grey-500 leading-relaxed">
                  We use a minimal set of subprocessors to provide our service (e.g., AWS for infrastructure, MongoDB for state). We maintain DPA (Data Processing Agreements) with all vendors to ensure they meet our rigorous security standards.
                </p>
              </section>

              <section id="rights">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[4].title}</h2>
                <p className="text-ns-grey-500 leading-relaxed">
                  Regardless of your location, we provide GDPR-level data rights to all users globally. You have the right to access, export, and permanently delete your forensic data and user profile at any time.
                </p>
              </section>
            </div>

            {/* Support CTA */}
            <div className="mt-32 pt-16 border-t border-white/[0.05] text-center md:text-left">
              <h4 className="text-white font-bold mb-4">Questions about our security model?</h4>
              <button className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest group">
                Download Security Whitepaper
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
