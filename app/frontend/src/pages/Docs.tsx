import { useState } from 'react';

import {
  Search,
  Book,
  Code,
  Users,
  Shield,
  ChevronRight,
  ArrowUpRight,
  BarChart2,
  Activity,
  Zap,
  Key,
  GitBranch
} from 'lucide-react';

const DOCS_NAV = [
  {
    title: 'Getting Started',
    links: [
      { label: 'What is Standor?', href: '#intro' },
      { label: 'Creating Your Account', href: '#account' },
      { label: 'Creating Your First Interview', href: '#create' },
      { label: 'Navigating the Interview Room', href: '#navigate' },
    ]
  },
  {
    title: 'Interview Platform',
    links: [
      { label: 'Collaborative Code Editor', href: '#editor' },
      { label: 'Code Execution Engine', href: '#execution' },
      { label: 'AI Code Evaluation', href: '#ai' },
      { label: 'Interview Timeline', href: '#timeline' },
      { label: 'Session Replay', href: '#replay' },
    ]
  },
  {
    title: 'Collaboration',
    links: [
      { label: 'Interview Rooms', href: '#rooms' },
      { label: 'Live Collaboration', href: '#live' },
      { label: 'Annotations & Notes', href: '#annotations' },
      { label: 'Activity Feed', href: '#activity' },
    ]
  },
  {
    title: 'Security & Account',
    links: [
      { label: 'MFA & Passkeys', href: '#mfa' },
      { label: 'API Keys', href: '#apikeys' },
      { label: 'Webhooks & Integrations', href: '#webhooks' },
      { label: 'Data & Privacy', href: '#privacy' },
    ]
  }
];

function Section({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="mb-20 scroll-mt-24">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight pb-4 border-b border-white/[0.04]">
        {title}
      </h2>
      {children}
    </section>
  );
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-ns-grey-400 text-base leading-relaxed mb-4">
    {children}
  </p>
);

const UL = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 mb-6">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-sm text-ns-grey-500">
        <div className="w-1 h-1 rounded-full bg-ns-accent mt-2 shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

function StepCard({ number, title, desc }: { number: number, title: string, desc: string }) {
  return (
    <div className="flex gap-5 p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-white/10 transition-all">
      <div className="w-9 h-9 rounded-xl bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center shrink-0 text-ns-accent font-bold text-sm">
        {number}
      </div>
      <div>
        <div className="text-sm font-semibold text-white mb-1">
          {title}
        </div>
        <div className="text-sm text-ns-grey-600 leading-relaxed">
          {desc}
        </div>
      </div>
    </div>
  );
}

export default function Docs() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ns-bg pt-24">
      {searchOpen && (
        <div
          className="fixed inset-0 bg-ns-bg-900/80 backdrop-blur-sm z-[200] flex items-start justify-center p-6 pt-32"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-ns-bg-900 border border-white/10 w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
              <Search size={20} className="text-ns-grey-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search documentation…"
                className="bg-transparent border-none outline-none text-white w-full text-lg placeholder:text-ns-grey-700"
              />
            </div>
            <p className="text-xs text-ns-grey-700 font-mono">
              Press Esc to close
            </p>
          </div>
        </div>
      )}

      <div className="flex">
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto p-8 border-r border-white/[0.04]">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-ns-grey-600 text-sm mb-8 hover:border-white/10 transition-colors"
            >
              <Search size={14} />
              <span>Search docs…</span>
            </button>

            {DOCS_NAV.map((group, i) => (
              <div key={i} className="mb-10">
                <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4">
                  {group.title}
                </h5>
                <ul className="space-y-1">
                  {group.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href={link.href}
                        className="flex items-center justify-between group py-1.5 text-sm text-ns-grey-500 hover:text-white transition-colors"
                      >
                        {link.label}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 md:px-16 py-16">
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Standor Documentation
            </h1>

            <p className="text-xl text-ns-grey-400 mb-16">
              Everything you need to run collaborative coding interviews,
              evaluate candidates, and manage engineering hiring workflows.
            </p>

            <Section id="intro" title="What is Standor?">
              <P>
                Standor is a browser-based collaborative coding interview
                platform designed for engineering teams. It allows companies
                to run live coding interviews, evaluate candidate solutions,
                and collaborate in real time — all without installing software.
              </P>
              <UL items={[
                'Real-time collaborative code editor',
                'Multi-language execution environment',
                'AI-assisted code evaluation',
                'Interview timeline and replay system',
                'Shared annotations and candidate notes',
                'Structured interview reports',
                'Team-based interview rooms'
              ]} />
            </Section>

            <Section id="account" title="Creating Your Account">
              <div className="space-y-3 mb-8">
                <StepCard
                  number={1}
                  title="Create your account"
                  desc="Go to /register and create a new Standor account using your email."
                />
                <StepCard
                  number={2}
                  title="Verify your email"
                  desc="Check your inbox and confirm your email address."
                />
                <StepCard
                  number={3}
                  title="Create your organisation"
                  desc="Set up your engineering team workspace."
                />
                <StepCard
                  number={4}
                  title="Invite interviewers"
                  desc="Invite team members to join your organisation."
                />
              </div>
            </Section>

            <Section id="create" title="Creating Your First Interview">
              <UL items={[
                'Open the dashboard and click Create Interview',
                'Select the programming language and template',
                'Add interviewers and participants',
                'Start the live coding session',
                'Track candidate activity and code execution'
              ]} />
            </Section>

            <Section id="editor" title="Collaborative Code Editor">
              <P>
                Standor provides a collaborative code editor similar to
                Google Docs but optimized for programming interviews.
              </P>
              <UL items={[
                'Live multi-cursor editing',
                'Syntax highlighting for multiple languages',
                'Shared execution console',
                'Code formatting and linting',
                'Version snapshots during the interview'
              ]} />
            </Section>

            <Section id="ai" title="AI Code Evaluation">
              <P>
                Standor includes an AI-assisted evaluation engine that
                analyzes candidate code in real time.
              </P>
              <UL items={[
                'Code complexity analysis',
                'Algorithm pattern detection',
                'Edge-case detection',
                'Performance insights',
                'Structured interview feedback generation'
              ]} />
            </Section>

            <Section id="rooms" title="Interview Rooms">
              <P>
                Interview rooms are collaborative spaces where
                interviewers and candidates work together during a
                coding interview.
              </P>
              <UL items={[
                'Multiple interviewers per session',
                'Shared code workspace',
                'Private interviewer notes',
                'Live cursor presence',
                'Interview timeline playback'
              ]} />
            </Section>

            <Section id="mfa" title="MFA & Passkeys">
              <UL items={[
                'Enable TOTP authentication for your account',
                'Use WebAuthn passkeys for passwordless login',
                'Generate backup recovery codes',
                'Protect your organisation workspace'
              ]} />
            </Section>

            <Section id="apikeys" title="API Keys">
              <UL items={[
                'Create API keys for integrations',
                'Automate interview creation',
                'Retrieve evaluation reports programmatically',
                'Rotate and revoke keys anytime'
              ]} />
            </Section>

            <Section id="privacy" title="Data & Privacy">
              <UL items={[
                'All interview sessions are encrypted',
                'Execution environments are sandboxed',
                'Candidate code is stored securely',
                'You can delete interview data anytime',
                'Enterprise data retention policies supported'
              ]} />
            </Section>

          </div>
        </main>
      </div>
    </div>
  );
}
