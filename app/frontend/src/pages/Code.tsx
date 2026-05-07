import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedHero from '../components/AnimatedHero';
import { Zap, Code2, CheckCircle } from 'lucide-react';

const SAMPLE_CODE = `function assessCandidate(solution) {
  const quality = evaluateLogic(solution);
  const efficiency = checkComplexity(solution);
  return { quality, efficiency };
}`;

const FEATURES = [
  { icon: Zap, title: 'Real-time Analysis', desc: 'Instant feedback as code is written' },
  { icon: Code2, title: 'Pattern Detection', desc: 'Identifies best practices and anti-patterns' },
  { icon: CheckCircle, title: 'Holistic Scoring', desc: 'Non-question-specific, generalized insights' },
];

export default function CodePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111317] to-[#0b0d10] py-20 text-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-[#f5f7fa] mb-6 tracking-tight">Code Analysis</h1>
          <p className="text-xl text-[#4b4f55] max-w-3xl leading-relaxed">
            Real-time code evaluation powered by AI, providing objective, generalized feedback on code quality, architecture, and engineering practices.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            {/* Code Sample */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Code2 className="text-[#f5f7fa]" size={20} />
                Example Assessment
              </h3>
              <div className="bg-[#17191d] border border-white/10 rounded-xl p-6 overflow-auto shadow-lg">
                <pre className="text-[#f5f7fa] text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                  <code>{SAMPLE_CODE}</code>
                </pre>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/8 transition-all hover:border-white/15 border border-transparent">
                  <f.icon className="text-[#f5f7fa] flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-[#f5f7fa] font-semibold text-sm">{f.title}</h4>
                    <p className="text-[#2f3237] text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Hero */}
          <div className="sticky top-20">
            <AnimatedHero />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-white/5 via-white/8 to-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-[#f5f7fa] mb-3">Ready to assess objectively?</h3>
          <p className="text-[#4b4f55] mb-6 max-w-2xl mx-auto">Start a session and let AI guide your hiring decisions with generalized, human-focused feedback.</p>
          <button 
            onClick={() => navigate('/create-session')}
            className="ns-btn-primary"
          >
            Start Session
          </button>
        </div>
      </div>
    </main>
  );
}
