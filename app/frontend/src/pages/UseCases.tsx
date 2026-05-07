import { ArrowRight, Shield, Search, Zap, FileCheck, Bug, Scale, ChevronRight, TrendingDown, Clock, ShieldCheck, TrendingUp, Eye, Users, Lock, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const USE_CASES = [
  {
    icon: Users,
    title: 'Engineering Hiring',
    desc: 'Run structured technical interviews at any scale. Standor gives every candidate the same high-signal environment — collaborative Monaco editor, AI scoring, and session replay.',
    benefits: [
      { text: '65% less interviewer prep time', icon: Clock },
      { text: 'Consistent rubric across candidates', icon: ShieldCheck },
      { text: 'AI-generated scorecard per session', icon: FileCheck }
    ],
    color: '#c4c7ce',
    path: '/how-it-works'
  },
  {
    icon: Search,
    title: 'Talent Screening',
    desc: 'Screen 10x more candidates without burning out your engineers. Async-friendly structured sessions with AI pre-scoring let recruiters triage before engineering reviews.',
    benefits: [
      { text: '80% faster first-round filtering', icon: TrendingDown },
      { text: 'Async review from session replay', icon: Eye },
      { text: 'ATS integration for score push', icon: Zap }
    ],
    color: '#aab0b6',
    path: '/integrations'
  },
  {
    icon: Bug,
    title: 'Internship & Grad Hiring',
    desc: 'Level the playing field. Standor\'s guided problem library and real-time collaboration let early-career candidates demonstrate their thinking process — not just output.',
    benefits: [
      { text: 'EASY + MEDIUM problem library', icon: Bug },
      { text: 'Live hints without giving answers', icon: TrendingUp },
      { text: 'Communication score in AI report', icon: Eye }
    ],
    color: '#9ca0a6',
    path: '/problems'
  },
  {
    icon: Zap,
    title: 'Contractor Vetting',
    desc: 'Quickly validate a contractor\'s skills before onboarding. A 30-minute Standor session produces an objective, reproducible code quality report you can share across your team.',
    benefits: [
      { text: 'Session results in under 30 min', icon: Zap },
      { text: 'Portable PDF report export', icon: Clock },
      { text: 'No account required for candidate', icon: Zap }
    ],
    color: '#bfc5cb',
    path: '/how-it-works'
  },
  {
    icon: FileCheck,
    title: 'Promotion Assessments',
    desc: 'Use Standor internally to run promotion-readiness coding assessments for senior engineers — consistent, objective, and free from manager bias.',
    benefits: [
      { text: 'HARD problems for senior track', icon: Lock },
      { text: 'Blind grading via anonymous rooms', icon: Shield },
      { text: 'Exportable audit trail', icon: FileCheck }
    ],
    color: '#9ca0a6',
    path: '/training'
  },
  {
    icon: Scale,
    title: 'Enterprise Compliance',
    desc: 'For regulated industries that require documentation of every hiring decision. Standor session records and AI analysis provide a structured, defensible evidence trail.',
    benefits: [
      { text: 'Immutable session records', icon: FileCheck },
      { text: 'GDPR-compliant data handling', icon: Scale },
      { text: 'On-premise deployment option', icon: Database }
    ],
    color: '#8f9499',
    path: '/security'
  },
];


export default function UseCases() {
  const navigate = useNavigate();

  return (
    <div className="pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-24 px-4 sm:px-6">
      <div className="ns-container">
        {/* Header */}
        <div className="max-w-4xl mb-12 md:mb-20 lg:mb-24">
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            Engineered for <br />
            <span className="text-ns-grey-600">every scenario.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            From high-stakes incident response to routine compliance audits. Standor provides the visibility your team needs to move faster.
          </p>
        </div>

        {/* Use Case Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-32 lg:mb-48">
          {USE_CASES.map((uc, i) => (
            <div
              key={i}
              className="group relative flex flex-col rounded-3xl md:rounded-[2.5rem] bg-ns-bg-900 border border-white/[0.05] p-6 sm:p-8 md:p-10 hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-500">
                  <uc.icon size={24} className="text-white group-hover:text-ns-accent transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{uc.title}</h3>
                <p className="text-sm text-ns-grey-500 leading-relaxed mb-10 min-h-0 md:min-h-[80px]">{uc.desc}</p>

                <div className="space-y-4 mb-12">
                  <div className="text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-1">Key Benefits</div>
                  {uc.benefits.map((b, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <b.icon size={12} className="text-ns-accent/60 group-hover:text-ns-accent transition-colors" />
                      <span className="text-xs text-ns-grey-400 font-medium">{b.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(uc.path)}
                  className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest group/btn"
                >
                  Explore Solution
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Focus */}
        <div className="ns-glass-dark rounded-3xl md:rounded-[3.5rem] border border-white/[0.05] p-6 sm:p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-ns-accent/5 blur-[120px] -z-10" />
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tighter">Built for every <br />hiring context.</h2>
              <p className="text-lg text-ns-grey-400 mb-8">
                From early-career grad hiring to senior staff assessments — Standor adapts to your team's evaluation criteria, problem library, and reporting needs.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Startups', 'Scale-ups', 'Enterprise', 'Agencies', 'Academia'].map(tag => (
                  <span key={tag} className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold text-ns-grey-300 uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="ns-glass p-8 rounded-3xl border border-white/5 space-y-2">
                <div className="text-3xl font-bold text-white">65%</div>
                <div className="text-[10px] font-mono text-ns-grey-500 uppercase tracking-widest">Less Prep Time</div>
              </div>
              <div className="ns-glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-2 lg:translate-y-8">
                <div className="text-3xl font-bold text-white">10×</div>
                <div className="text-[10px] font-mono text-ns-grey-500 uppercase tracking-widest">Screening Throughput</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 md:mt-32 lg:mt-48 text-center">
          <h3 className="text-2xl font-bold text-white mb-10">Ready to see Standor in action?</h3>
          <button
            onClick={() => navigate('/register')}
            className="ns-btn-primary mx-auto inline-flex items-center gap-2 px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold"
          >
            Get Started
            <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
