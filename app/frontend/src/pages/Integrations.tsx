import { useState } from 'react';
import { ArrowRight, Webhook, MessageSquare, Cloud, Activity, ChevronRight, Box, Zap, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../utils/api';

const INTEGRATIONS = [
  {
    category: 'SIEM & Log Management',
    icon: Activity,
    items: [
      { name: 'Splunk Security', desc: 'Forward forensic snapshots and anomaly alerts to Splunk HEC with zero-latency streaming.', status: 'Available' },
      { name: 'Elastic Stack', desc: 'Native ECS-compliant metadata streaming for unified observability and long-term archival.', status: 'Available' },
      { name: 'Microsoft Sentinel', desc: 'Microsoft Sentinel Logic Apps connector for automated triage and incident escalation.', status: 'Available' },
      { name: 'CrowdStrike', desc: 'Sync packet traces with CrowdStrike Falcon Insight sessions for host-network correlation.', status: 'Coming Soon' },
    ],
  },
  {
    category: 'Cloud & Infrastructure',
    icon: Cloud,
    items: [
      { name: 'AWS S3 Ingest', desc: 'Auto-scan S3 buckets for new PCAPs and trigger distributed forensic workers.', status: 'Available' },
      { name: 'Zeek / Bro', desc: 'Import Zeek log metadata to correlate with raw packet streams for deep protocol analysis.', status: 'Available' },
      { name: 'GCS Archival', desc: 'Cold storage integration for massive forensic evidence sets with immutable buckets.', status: 'Available' },
      { name: 'Docker Compose', desc: 'One-click local deployment for sandboxed internal analysis and developer testing.', status: 'Available' },
    ],
  },
  {
    category: 'Alerting & Collaboration',
    icon: MessageSquare,
    items: [
      { name: 'Slack Connect', desc: 'Real-time session updates and mentions in your security channels for rapid response.', status: 'Available' },
      { name: 'PagerDuty', desc: 'High-severity forensic triggers for your on-call responders with automated escalations.', status: 'Available' },
      { name: 'Jira Software', desc: 'Automatically create forensic evidence tickets with snapshots and direct links.', status: 'Available' },
      { name: 'Discord', desc: 'Community-driven alert channels for open-source forensics teams and researchers.', status: 'Available' },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function Integrations() {
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', integration: '', useCase: '' });

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.integration) return;
    setSubmitting(true);
    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        message: `Integration Request: ${form.integration}\n\nUse case: ${form.useCase}`,
        plan: 'integration-request',
      });
      setSubmitted(true);
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-48 px-6 bg-ns-bg-900">
      <div className="ns-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ns-accent/10 border border-ns-accent/20 text-[10px] font-bold text-ns-accent uppercase tracking-[0.2em] mb-10">
            Security Ecosystem
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10 italic">
            Engineered for <br />
            <span className="text-ns-grey-600 not-italic">total connectivity.</span>
          </h1>
          <p className="text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Standor connects seamlessly with the tools your security team already uses. No silos. No friction. Pure industrial-grade interoperability.
          </p>
        </motion.div>

        {/* Integration Sections */}
        <div className="space-y-48 mb-48">
          {INTEGRATIONS.map((group, gi) => (
            <motion.div 
              key={gi} 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="relative"
            >
              <div className="flex items-center gap-4 mb-16 border-b border-white/[0.05] pb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-ns-accent shadow-2xl">
                  <group.icon size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{group.category}</h2>
                  <p className="text-[10px] font-bold text-ns-grey-500 uppercase tracking-widest mt-1">Direct Sink Endpoints Available</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {group.items.map((item, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    className="ns-glass rounded-[2.5rem] border border-white/[0.04] p-10 hover:border-white/10 hover:bg-white/[0.02] transition-all group flex flex-col justify-between items-start gap-10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-[0.03] transition-opacity">
                      <group.icon size={160} />
                    </div>
                    <div className="w-full relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{item.name}</h3>
                        <span className={`text-[9px] font-bold px-3 py-1 rounded-full border tracking-widest ${item.status === 'Available'
                            ? 'bg-ns-accent/5 border-ns-accent/20 text-ns-accent'
                            : 'bg-ns-grey-800 border-white/5 text-ns-grey-600'
                          }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-base text-ns-grey-500 leading-relaxed group-hover:text-ns-grey-300 transition-colors max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 group-hover:text-ns-accent transition-all">
                      Configure Link
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Developer CTA */}
        <div className="grid lg:grid-cols-2 gap-8 mb-48">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="ns-glass-dark rounded-[3.5rem] border border-white/[0.05] p-16 flex flex-col justify-between items-start gap-16 group hover:border-ns-accent/20 transition-all duration-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-ns-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-8 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white group-hover:text-ns-accent group-hover:bg-ns-accent/10 transition-all">
                <Webhook size={40} />
              </div>
              <h3 className="text-4xl font-bold text-white tracking-tighter">Programmatic <br />Forensics</h3>
              <p className="text-lg text-ns-grey-500 max-w-sm leading-relaxed">Leverage our high-performance REST API and the PySculpt SDK to build custom automated hunting playbooks.</p>
            </div>
            <button className="px-10 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-ns-grey-100 transition-all shadow-2xl relative z-10 active:scale-95">
              Initialize API Key
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="ns-glass-dark rounded-[3.5rem] border border-white/[0.05] p-16 flex flex-col justify-between items-start gap-16 group hover:border-ns-teal/20 transition-all duration-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-ns-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-8 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white group-hover:text-ns-teal group-hover:bg-ns-teal/10 transition-all">
                <Box size={40} />
              </div>
              <h3 className="text-4xl font-bold text-white tracking-tighter">Community <br />Modules</h3>
              <p className="text-lg text-ns-grey-500 max-w-sm leading-relaxed">Contribute to our growing library of open-source protocol parsers and forensic detection widgets on GitHub.</p>
            </div>
            <button className="px-10 py-4 border border-white/10 text-white rounded-full font-bold text-sm hover:bg-white/5 transition-all relative z-10 active:scale-95">
              Explore Our Repos
            </button>
          </motion.div>
        </div>

        {/* Integration Request */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/[0.02] rounded-[3rem] border border-white/5 p-16 sm:p-20 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                <CheckCircle2 size={48} className="text-ns-success mb-6" />
                <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">Request received</h4>
                <p className="text-ns-grey-500 max-w-sm leading-relaxed">
                  We'll review your integration request and get back to you within 48 hours.
                </p>
              </motion.div>
            ) : !formOpen ? (
              <motion.div key="cta" className="text-center">
                <div className="w-16 h-16 rounded-full bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center mx-auto mb-10">
                  <Zap size={24} className="text-ns-accent" />
                </div>
                <h4 className="text-3xl font-bold text-white mb-6 tracking-tight italic">Missing a critical sink?</h4>
                <p className="text-lg text-ns-grey-500 max-w-xl mx-auto mb-12 leading-relaxed">
                  We're constantly expanding our integration library based on direct SOC engineer feedback. Request a custom connector today.
                </p>
                <button
                  onClick={() => setFormOpen(true)}
                  className="group px-12 py-5 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 hover:border-white/20 transition-all text-[11px] uppercase tracking-[0.3em] flex items-center gap-2 mx-auto"
                >
                  Request Custom Integration
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="text-2xl font-bold text-white tracking-tight">Request an integration</h4>
                    <p className="text-sm text-ns-grey-600 mt-1">Tell us what you need — we'll prioritise based on demand.</p>
                  </div>
                  <button
                    onClick={() => setFormOpen(false)}
                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-ns-grey-500 hover:text-white hover:border-white/20 transition-all"
                    aria-label="Close form"
                  >
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleRequest} className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-2">Your name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-ns-grey-700 focus:border-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-2">Work email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@company.com"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-ns-grey-700 focus:border-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-2">Integration / tool *</label>
                    <input
                      type="text"
                      required
                      value={form.integration}
                      onChange={e => setForm(f => ({ ...f, integration: e.target.value }))}
                      placeholder="e.g. Datadog, QRadar, Sumo Logic"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-ns-grey-700 focus:border-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-2">Use case</label>
                    <input
                      type="text"
                      value={form.useCase}
                      onChange={e => setForm(f => ({ ...f, useCase: e.target.value }))}
                      placeholder="Forward anomaly alerts, export evidence…"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-ns-grey-700 focus:border-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-10 py-3.5 bg-white text-black rounded-full font-bold text-sm hover:bg-ns-grey-100 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? 'Sending…' : 'Submit Request'}
                      {!submitting && <ArrowRight size={16} />}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
