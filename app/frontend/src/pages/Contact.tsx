import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Send, Mail, MessageSquare, CheckCircle2, Users } from 'lucide-react';
import api from '../utils/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', role: '', message: '', plan: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  // Honeypot field — bots fill this, humans never see it (visually hidden via CSS)
  const [honeypot, setHoneypot] = useState('');

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Silently succeed if honeypot is filled (bot)
    if (honeypot) { setSent(true); return; }
    if (!form.name || !form.email || !form.message) return toast.error('Please fill in required fields');
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success('Message sent successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-xl ns-glass p-16 rounded-[3rem] border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-ns-success/5 blur-[80px] -z-10" />
          <div className="w-20 h-20 rounded-full bg-ns-success/10 border border-ns-success/20 flex items-center justify-center mx-auto mb-10 animate-bounce">
            <CheckCircle2 size={32} className="text-ns-success" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tighter text-glow">Message received.</h1>
          <p className="text-xl text-ns-grey-400 mb-12 font-medium">Thanks for reaching out to the Standor team. We'll respond as soon as possible.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all shadow-2xl"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
          {/* Info Side */}
          <div>
            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
              Contact the <br className="hidden sm:block" />
              <span className="text-ns-grey-600">Standor Team.</span>
            </h1>
            <p className="text-2xl text-ns-grey-400 mb-16 font-medium leading-relaxed max-w-md">
              Questions about the platform, feature requests, enterprise integrations, or developer collaboration? We'd love to hear from you.
            </p>

            <div className="space-y-10">
              {[
                { icon: Mail, title: 'Platform Support', desc: 'support@standor.dev', sub: 'Bug reports, account issues, and platform assistance' },
                { icon: Users, title: 'Partnerships & Collaboration', desc: 'Engineering Collaboration', sub: 'Interested in contributing, integrating Standor, or collaborating on research?' },
                { icon: MessageSquare, title: 'Response Time', desc: 'Typically under 24 hours', sub: 'Monday – Friday, global engineering support' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/[0.05] transition-all">
                    <item.icon size={24} className="text-white group-hover:text-ns-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-[0.2em] mb-1">{item.title}</p>
                    <p className="text-xl font-bold text-white mb-1">{item.desc}</p>
                    <p className="text-sm text-ns-grey-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="relative">
            <div className="absolute inset-0 bg-ns-accent/5 blur-[120px] -z-10" />
            <form onSubmit={handleSubmit} className="ns-glass-dark rounded-[2rem] sm:rounded-[3rem] border border-white/[0.08] p-6 sm:p-12 space-y-6 sm:space-y-8 shadow-2xl">
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest ml-1">Your Name</label>
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Jane Doe" className="w-full px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-ns-accent outline-none transition-all placeholder:text-ns-grey-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="jane@example.com" className="w-full px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-ns-accent outline-none transition-all placeholder:text-ns-grey-800" />
                </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest ml-1">Organization (optional)</label>
                  <input type="text" value={form.company} onChange={e => update('company', e.target.value)} placeholder="Your org or university" className="w-full px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-ns-accent outline-none transition-all placeholder:text-ns-grey-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest ml-1">Reason for Contact</label>
                  <select value={form.plan} onChange={e => update('plan', e.target.value)} className="w-full px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-ns-accent outline-none transition-all appearance-none cursor-pointer">
                    <option value="" className="bg-ns-bg-900">Select...</option>
                    <option value="bug" className="bg-ns-bg-900">Bug / Issue</option>
                    <option value="feature" className="bg-ns-bg-900">Feature Request</option>
                    <option value="collaboration" className="bg-ns-bg-900">Collaboration</option>
                    <option value="feedback" className="bg-ns-bg-900">General Feedback</option>
                    <option value="security" className="bg-ns-bg-900">Security Report</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest ml-1">Message</label>
                <textarea value={form.message} onChange={e => update('message', e.target.value)} rows={5} placeholder="Tell us how we can help — support request, enterprise inquiry, or collaboration idea." className="w-full px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-ns-accent outline-none transition-all placeholder:text-ns-grey-800 resize-none" />
              </div>

              {/* Honeypot: visually hidden, filled only by bots */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                <label htmlFor="ns_website">Leave this field empty</label>
                <input
                  id="ns_website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-5 bg-white text-black rounded-xl sm:rounded-full font-bold hover:bg-ns-grey-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} />}
                Send Message
              </button>

              <p className="text-[10px] text-ns-grey-700 text-center font-medium">
                By submitting, you agree to our{' '}<a href="/privacy" className="text-ns-grey-500 hover:text-white underline underline-offset-4">Privacy Policy</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
