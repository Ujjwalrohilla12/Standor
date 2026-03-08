import { ShieldCheck, ArrowRight, Zap, Target, Lock, Cpu, Database, Globe, Key, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '../utils/api'; // using the existing api.ts since it matches the Standor MERN setup

export default function Enterprise() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.company || !form.message) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/enterprise/contact", {
        ...form,
        plan: "enterprise"
      });

      setSubmitted(true);

      toast.success(
        "Enterprise inquiry received. Our team will respond within one business day."
      );
    } catch (err) {
      toast.error("Submission failed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HERO */}

        <div className="max-w-4xl mb-32">
          <span className="text-[11px] font-mono uppercase tracking-[0.35em] text-neutral-400">
            Standor Enterprise
          </span>

          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-bold text-white leading-[0.9] mt-6 mb-8">
            Packet forensics
            <br />
            <span className="text-neutral-500">
              at global scale
            </span>
          </h1>

          <p className="text-lg text-neutral-400 leading-relaxed max-w-2xl">
            Deploy Standor across distributed infrastructure and analyze
            terabytes of packet data in seconds. Built for security teams,
            incident response, and digital forensics.
          </p>
        </div>


        {/* ENTERPRISE FEATURES */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-48">

          {[
            {
              icon: ShieldCheck,
              title: "Compliance Ready",
              desc: "Designed for SOC2, GDPR, and regulated environments with immutable audit trails."
            },
            {
              icon: Lock,
              title: "Zero Trust Access",
              desc: "Integrates with SAML / OIDC identity providers with granular RBAC controls."
            },
            {
              icon: Cpu,
              title: "Distributed Processing",
              desc: "Horizontally scalable DPI nodes capable of processing multi-TB traffic workloads."
            },
            {
              icon: Database,
              title: "Hybrid Storage",
              desc: "Keep PCAP data inside your infrastructure — Standor never stores raw traffic."
            },
            {
              icon: Globe,
              title: "Global Mesh",
              desc: "Unify packet analysis across regions into a single searchable investigation layer."
            },
            {
              icon: Key,
              title: "Customer-Managed Keys",
              desc: "All forensic snapshots encrypted using your own KMS or Vault managed keys."
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-neutral-900 border border-white/5 rounded-3xl p-8 hover:border-white/20 transition"
            >
              <div className="mb-6 text-white/80">
                <item.icon size={26} />
              </div>

              <h3 className="text-lg font-semibold text-white mb-3">
                {item.title}
              </h3>

              <p className="text-sm text-neutral-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}

        </div>


        {/* ENGINE SECTION */}

        <div className="grid lg:grid-cols-2 gap-20 items-center mb-48">

          <div>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Industrial-grade packet engine
            </h2>

            <p className="text-neutral-400 mb-10 leading-relaxed">
              Standor’s DPI engine is optimized for massive network captures.
              Built with low-level systems programming and parallel parsing
              architecture.
            </p>

            <div className="space-y-8">

              <div className="flex gap-5">
                <Zap className="text-white/80" />
                <div>
                  <p className="text-white font-semibold">
                    Parallel PCAP slicing
                  </p>
                  <p className="text-neutral-500 text-sm">
                    Massive captures split into micro-segments for instant preview.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <Target className="text-white/80" />
                <div>
                  <p className="text-white font-semibold">
                    Heuristic detection engine
                  </p>
                  <p className="text-neutral-500 text-sm">
                    Custom protocol detection via plugin architecture.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <ShieldCheck size={120} className="text-white/80" />
          </div>

        </div>


        {/* ENTERPRISE CONTACT FORM */}

        <div className="grid lg:grid-cols-2 gap-16 mb-48">

          <div>

            <h2 className="text-4xl font-bold text-white mb-6">
              Contact the Standor team
            </h2>

            <p className="text-neutral-400 mb-8 leading-relaxed">
              Request enterprise deployment, custom support agreements,
              or private infrastructure installation.
            </p>

            <ul className="space-y-3 text-sm text-neutral-400">
              <li>• Air-gapped deployments</li>
              <li>• SSO integration</li>
              <li>• Compliance & retention policies</li>
              <li>• Dedicated security support</li>
              <li>• Procurement & SLA contracts</li>
            </ul>

          </div>


          {/* FORM */}

          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">

            {submitted ? (

              <div className="text-center py-12 space-y-4">
                <CheckCircle2 size={36} className="mx-auto text-green-400" />
                <p className="text-white font-semibold">
                  Inquiry received
                </p>
                <p className="text-neutral-500 text-sm">
                  Our team will contact you shortly.
                </p>
              </div>

            ) : (

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                />

                <input
                  placeholder="Company"
                  value={form.company}
                  onChange={e =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                />

                <input
                  placeholder="Work email"
                  type="email"
                  value={form.email}
                  onChange={e =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                />

                <textarea
                  rows={4}
                  placeholder="Message"
                  value={form.message}
                  onChange={e =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                />

                <button
                  disabled={submitting}
                  className="w-full bg-white text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}

                  {submitting ? "Sending..." : "Send inquiry"}
                </button>

              </form>

            )}

          </div>

        </div>


        {/* COMMUNITY CTA */}

        <div className="text-center border border-white/10 rounded-3xl p-16">

          <h2 className="text-4xl font-bold text-white mb-6">
            Secure infrastructure with Standor
          </h2>

          <p className="text-neutral-400 max-w-2xl mx-auto mb-10">
            Standor remains community-driven and open-source at its core.
            Advanced forensic tools accessible to every security engineer.
          </p>

          <div className="flex justify-center gap-6">

            <button
              onClick={() => navigate("/register")}
              className="bg-white text-black px-8 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate("/docs")}
              className="border border-white/20 text-white px-8 py-3 rounded-full"
            >
              Documentation
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
