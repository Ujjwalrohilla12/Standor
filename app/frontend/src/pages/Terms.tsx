import { ShieldCheck, Scale, FileText, Gavel, ArrowRight } from 'lucide-react';

export default function Terms() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'license', title: '2. Interview Platform License' },
    { id: 'conduct', title: '3. Acceptable Use Policy' },
    { id: 'liability', title: '4. Limitation of Liability' },
    { id: 'termination', title: '5. Termination of Service' },
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-[#050505] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[250px_1fr] gap-16">
          {/* Sidebar */}
          <aside className="hidden lg:block sticky top-32 h-fit">
            <h5 className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest mb-8">Navigation</h5>
            <ul className="space-y-4">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-sm text-neutral-500 hover:text-white transition-colors">{s.title}</a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <article className="max-w-3xl">
            <div className="mb-20">
              <h1 className="text-5xl font-bold text-white mb-6 tracking-tighter">Terms of Service</h1>
              <p className="text-xl text-neutral-400 leading-relaxed font-medium">
                Effective Date: March 8, 2026. <br />
                By accessing or using the Standor real-time interview platform, you agree to comply with and be bound by these Terms of Service.
              </p>
            </div>

            <div className="space-y-24">
              <section id="acceptance">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[0].title}</h2>
                <p className="text-neutral-500 leading-relaxed mb-6">
                  Standor ("the Service") is provided by Standor Inc. These Terms govern your access to and use of our collaborative coding, AI evaluation, and reporting services. If you are using the Service on behalf of an enterprise or hiring entity, you represent that you have the authority to bind that organization to these terms.
                </p>
              </section>

              <section id="license">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[1].title}</h2>
                <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-10 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Scale size={20} className="text-white" />
                    <h4 className="text-white font-bold">Grant of License</h4>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Subject to these terms, we grant you a limited, non-exclusive, non-transferable license to use Standor to conduct technical interviews, assess candidates, and review code execution timelines for internal hiring or educational purposes.
                  </p>
                </div>
              </section>

              <section id="conduct">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[2].title}</h2>
                <div className="prose prose-invert max-w-none text-neutral-500 space-y-6">
                  <p>You agree NOT to use the Service to:</p>
                  <ul className="space-y-3 list-disc pl-5">
                    <li>Execute malicious code or attempt to circumvent our containerized sandboxing logic.</li>
                    <li>Perform denial-of-service attacks or attempt to overwhelm the code execution limits.</li>
                    <li>Utilize the platform to mine cryptocurrency, host command-and-control instances, or execute automated botnets.</li>
                    <li>Share candidate personal information publicly without express legal consent.</li>
                  </ul>
                </div>
              </section>

              <section id="liability">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[3].title}</h2>
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 italic text-neutral-500 text-sm leading-relaxed">
                  "The Service is provided 'AS IS' and 'AS AVAILABLE'. Standor Inc. shall not be liable for any data loss, hiring decisions, or consequence resulting from the use of our code evaluation and AI scoring engines."
                </div>
              </section>

              <section id="termination">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{sections[4].title}</h2>
                <p className="text-neutral-500 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate our Acceptable Use Policy or engage in fraudulent activity in execution environments. Upon termination, your right to access the Service will cease immediately, and all stored interview sessions will be queued for permanent deletion.
                </p>
              </section>
            </div>

            <div className="mt-48 p-12 rounded-[3rem] bg-[#0A0A0A] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Need a custom contract?</h3>
                <p className="text-sm text-white">Available for Enterprise customers.</p>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest py-4 px-8 rounded-full bg-white text-black hover:bg-neutral-200 transition-all">
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
