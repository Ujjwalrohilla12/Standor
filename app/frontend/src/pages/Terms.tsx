import { ShieldCheck, Scale, FileText, Gavel, ArrowRight } from 'lucide-react';

export default function Terms() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'license', title: '2. Forensic Usage License' },
    { id: 'conduct', title: '3. Acceptable Use Policy' },
    { id: 'liability', title: '4. Limitation of Liability' },
    { id: 'termination', title: '5. Termination of Service' },
  ];

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        <div className="grid lg:grid-cols-[250px_1fr] gap-16">
          {/* Sidebar */}
          <aside className="hidden lg:block sticky top-32 h-fit">
            <h5 className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest mb-8">Navigation</h5>
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
              <h1 className="text-5xl font-bold text-white mb-6 tracking-tighter text-glow">Terms of Service</h1>
              <p className="text-xl text-ns-grey-400 leading-relaxed font-medium">
                Effective Date: February 26, 2026. <br />
                By accessing or using the Standor platform, you agree to comply with and be bound by these Terms of Service.
              </p>
            </div>

            <div className="space-y-24">
              <section id="acceptance">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[0].title}</h2>
                <p className="text-ns-grey-500 leading-relaxed mb-6">
                  Standor ("the Service") is provided by Standor Labs. These Terms govern your access to and use of our website, software, and services. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these terms.
                </p>
              </section>

              <section id="license">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[1].title}</h2>
                <div className="ns-glass-dark rounded-3xl border border-white/5 p-10 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Scale size={20} className="text-ns-accent" />
                    <h4 className="text-white font-bold">Grant of License</h4>
                  </div>
                  <p className="text-sm text-ns-grey-400 leading-relaxed">
                    Subject to these terms, we grant you a limited, non-exclusive, non-transferable license to use Standor for internal business security purposes, academic research, or personal forensic analysis.
                  </p>
                </div>
              </section>

              <section id="conduct">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[2].title}</h2>
                <div className="prose prose-invert max-w-none text-ns-grey-500 space-y-6">
                  <p>You agree NOT to use the Service to:</p>
                  <ul className="space-y-3 list-disc pl-5">
                    <li>Upload packets obtained without legal authorization.</li>
                    <li>Attempt to reverse-engineer or circumvent our containerized sandboxing logic.</li>
                    <li>Perform "denial-of-service" attacks against our PCAP ingestion workers.</li>
                    <li>Utilize the platform for any illegal surveillance or non-consensual interception.</li>
                  </ul>
                </div>
              </section>

              <section id="liability">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[3].title}</h2>
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 italic text-ns-grey-600 text-sm leading-relaxed">
                  "The Service is provided 'AS IS' and 'AS AVAILABLE'. Standor Labs shall not be liable for any data loss, forensic misinterpretation, or consequence resulting from the use of our protocol analysis engines."
                </div>
              </section>

              <section id="termination">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[4].title}</h2>
                <p className="text-ns-grey-500 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate our Acceptable Use Policy or engage in fraudulent activity. Upon termination, your right to access the Service will cease immediately, and all stored forensic sessions will be queued for permanent deletion.
                </p>
              </section>
            </div>

            <div className="mt-48 p-12 rounded-[3rem] bg-ns-accent/5 border border-ns-accent/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Need a custom DPA?</h3>
                <p className="text-sm text-ns-grey-500">Available for Enterprise and Sovereign customers.</p>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest py-4 px-8 rounded-full bg-white text-black hover:bg-ns-grey-100 transition-all">
                Contact Legal
                <ArrowRight size={14} />
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
