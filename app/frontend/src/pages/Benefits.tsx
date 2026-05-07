import React from 'react';
import AnimatedHero from '../components/AnimatedHero';
import { CheckCircle, Users, Clock, ShieldCheck, TrendingUp } from 'lucide-react';

const BENEFITS = [
  { icon: CheckCircle, title: 'Objective Scoring', desc: 'Consistent, rubric-driven evaluation across all sessions.' },
  { icon: Users, title: 'Collaborative Reviews', desc: 'Share session replays and AI insights with your hiring team.' },
  { icon: Clock, title: 'Faster Hiring', desc: 'Reduce time-to-hire with evidence-backed decisions.' },
  { icon: ShieldCheck, title: 'Privacy Protected', desc: 'Candidate data secured; detailed reports shared only with hosts.' },
  { icon: TrendingUp, title: 'Data-Driven Insights', desc: 'Track hiring patterns and improve your assessment process.' },
];

export default function Benefits() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111317] to-[#0b0d10] py-20 text-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-[#f5f7fa] mb-6 tracking-tight">Built for Teams</h1>
          <p className="text-xl text-[#4b4f55] max-w-3xl leading-relaxed">
            Standor empowers hiring teams to make better decisions. AI supports human judgment — your team stays in control.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="p-6 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-all hover:border-white/15 group">
                  <div className="flex items-start gap-3 mb-3">
                    <b.icon className="text-[#f5f7fa] flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" size={20} />
                  </div>
                  <h4 className="text-[#f5f7fa] font-semibold text-sm mb-2">{b.title}</h4>
                  <p className="text-[#2f3237] text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Hero */}
          <div className="sticky top-20">
            <AnimatedHero />
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-gradient-to-r from-white/5 via-white/8 to-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-[#f5f7fa] mb-4">Hiring that feels human</h3>
          <p className="text-[#4b4f55] max-w-2xl mx-auto mb-6">
            Standor combines AI analysis with human insight — giving your team confidence in every decision, and candidates a fair, transparent experience.
          </p>
          <div className="flex justify-center gap-4">
            <button className="ns-btn-primary">
              Explore Features
            </button>
            <button className="ns-btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
