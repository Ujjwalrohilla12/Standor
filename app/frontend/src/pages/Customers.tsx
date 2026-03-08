import { ArrowRight, Code, Brain, Users, FileText, Zap, Lock, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FocusCards from '../components/FocusCards';

const ROLES = [
  {
    icon: Code,
    title: 'Engineering Teams',
    description: 'Run structured technical interviews with a collaborative coding environment designed for real-world engineering evaluation.',
    tags: ['Collaborative Editor', 'Live Coding', 'Execution Sandbox'],
  },
  {
    icon: Brain,
    title: 'Hiring Managers',
    description: 'Evaluate candidates with AI-powered code analysis, structured interview timelines, and detailed evaluation reports.',
    tags: ['AI Evaluation', 'Interview Insights', 'Candidate Reports'],
  },
  {
    icon: Users,
    title: 'Interview Panels',
    description: 'Multiple interviewers can join the same session, observe code execution, annotate candidate reasoning, and collaborate in real time.',
    tags: ['Shared Sessions', 'Live Presence', 'Interview Notes'],
  },
  {
    icon: FileText,
    title: 'Recruiting Teams',
    description: 'Capture structured interview outcomes and maintain consistent evaluation frameworks across multiple interview rounds.',
    tags: ['Evaluation Templates', 'Interview History', 'Candidate Records'],
  },
  {
    icon: Zap,
    title: 'Developer Platforms',
    description: 'Integrate Standor directly into hiring workflows using our API. Automate interview creation, evaluation retrieval, and analytics.',
    tags: ['API Access', 'Webhook Events', 'Automation'],
  },
  {
    icon: Lock,
    title: 'Enterprise Organizations',
    description: 'Secure interview infrastructure with role-based access, encrypted session data, and isolated execution environments.',
    tags: ['Secure Execution', 'RBAC', 'Compliance Ready'],
  },
];

const CAPABILITIES = [
  { value: '1000+', label: 'Concurrent interview sessions' },
  { value: '<50ms', label: 'Real-time editor latency' },
  { value: '10+', label: 'Programming languages supported' },
  { value: 'AI', label: 'Automated code evaluation engine' },
];

export default function Customers() {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">

        {/* Header */}
        <div className="max-w-4xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[11px] text-ns-grey-500 font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-ns-success" />
            Early access · Free for engineering teams
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            Built for modern <br />
            <span className="text-ns-grey-600">engineering hiring.</span>
          </h1>
          <p className="text-lg md:text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Standor helps engineering teams conduct better technical interviews with collaborative coding, AI insights, and structured evaluation workflows.
          </p>
        </div>



        {/* Who uses Standor */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-white tracking-tighter mb-3">Who uses Standor</h2>
          <p className="text-ns-grey-500 mb-12 max-w-xl">
            Designed for engineering teams hiring the next generation of developers.
          </p>
          <FocusCards className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map(({ icon: Icon, title, description, tags }, i) => (
              <FocusCards.Item key={title} index={i}>
                <div
                  className="ns-glass rounded-3xl border border-white/[0.05] p-8 hover:border-white/[0.12] transition-all duration-500 group h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:bg-white/[0.07] transition-colors">
                    <Icon size={18} className="text-ns-grey-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
                  <p className="text-sm text-ns-grey-500 leading-relaxed mb-6">{description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/[0.04] text-ns-grey-600 border border-white/[0.06]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FocusCards.Item>
            ))}
          </FocusCards>
        </div>

        {/* Share your story CTA */}
        <div className="mb-24">
          <div className="ns-glass-dark rounded-[2rem] md:rounded-[3.5rem] border border-white/[0.07] p-8 md:p-16 lg:p-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-ns-accent/3 blur-[120px] -z-10" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10">
              <div className="max-w-lg">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <Star size={16} className="text-amber-400" />
                  <span className="text-[11px] font-mono text-ns-grey-600">Early Adopter Programme</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tighter">
                  Using Standor for hiring?
                </h2>
                <p className="text-sm md:text-base text-ns-grey-400 leading-relaxed">
                  Share how your team uses Standor for technical interviews and developer assessments. Your feedback helps shape the future of the platform.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto flex-shrink-0">
                <button
                  onClick={() => navigate('/contact')}
                  className="group px-6 py-3 md:px-8 md:py-3.5 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center justify-center gap-2 text-sm w-full"
                >
                  Share Your Experience
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/enterprise')}
                  className="px-6 py-3 md:px-8 md:py-3.5 rounded-full border border-white/[0.1] text-white font-medium text-sm hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 w-full"
                >
                  Enterprise Enquiry
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Use cases grid link */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {[
            { title: 'Use Cases', desc: 'Explore how teams conduct technical interviews, run coding assessments, and evaluate developer talent.', href: '/use-cases' },
            { title: 'Interview Workflows', desc: 'Learn how engineering teams structure collaborative coding sessions and evaluate candidates effectively.', href: '/interview-workflows' },
            { title: 'Security & Privacy', desc: 'Understand how Standor secures interview sessions, execution environments, and candidate data.', href: '/security' },
          ].map(({ title, desc, href }) => (
            <button
              key={title}
              onClick={() => navigate(href)}
              className="ns-glass rounded-2xl border border-white/[0.05] p-8 text-left hover:border-white/[0.1] transition-all group"
            >
              <h3 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-ns-grey-200 transition-colors">{title}</h3>
              <p className="text-sm text-ns-grey-500 leading-relaxed mb-4">{desc}</p>
              <span className="text-xs text-ns-grey-600 group-hover:text-white transition-colors flex items-center gap-1">
                Learn more <ChevronRight size={12} />
              </span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="ns-glass-dark rounded-[2rem] md:rounded-[3.5rem] border border-white/[0.05] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-ns-accent/5 blur-[120px] -z-10" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 tracking-tighter">Free for engineering teams.</h2>
          <p className="text-base md:text-lg text-ns-grey-400 max-w-2xl mx-auto mb-8 md:mb-12">
            Standor is free for developers and engineering teams conducting technical interviews. No hidden fees — just powerful hiring infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate('/register')}
              className="group px-8 py-4 sm:px-12 sm:py-5 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center justify-center gap-2 mx-auto sm:mx-0 shadow-2xl w-full sm:w-auto"
            >
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 sm:px-12 sm:py-5 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all w-full sm:w-auto"
            >
              Contact Us
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
