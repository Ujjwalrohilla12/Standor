import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Code,
  Users,
  Brain,
  BarChart3,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import HeroSlider from '../components/HeroSlider';
import GlassTiltCard from '../components/GlassTiltCard';
import FadeUp from '../components/FadeUp';
import ScrollStorySection from '../components/ScrollStorySection';


/* ────────────────────────── MOCKUPS ────────────────────────── */

function EditorMockup() {
  const lines = [
    "function twoSum(nums, target) {",
    "  const map = new Map();",
    "  for (let i = 0; i < nums.length; i++) {",
    "    const diff = target - nums[i];",
    "    if (map.has(diff)) {",
    "      return [map.get(diff), i];",
    "    }",
    "    map.set(nums[i], i);",
    "  }",
    "}"
  ];

  return (
    <div className="h-full rounded-2xl ns-glass-dark p-6 font-mono text-xs text-ns-grey-300 flex flex-col gap-1">
      {lines.map((l, i) => (
        <div key={i} className="flex gap-4">
          <span className="text-ns-grey-600 w-6">{i + 1}</span>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function AIMockup() {
  const items = [
    { label: "Time Complexity", value: "O(n)" },
    { label: "Space Complexity", value: "O(n)" },
    { label: "Bug Detection", value: "None" }
  ];

  return (
    <div className="h-full rounded-2xl ns-glass-dark p-6 flex flex-col justify-center gap-4">
      {items.map((i, idx) => (
        <div key={idx} className="flex justify-between text-xs font-mono text-ns-grey-300">
          <span>{i.label}</span>
          <span className="text-white">{i.value}</span>
        </div>
      ))}
    </div>
  );
}

function ReplayMockup() {
  return (
    <div className="h-full rounded-2xl ns-glass-dark p-6 flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-4">
        <Play className="text-ns-accent" />
        <span className="text-white font-mono">Replay Session</span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-ns-accent w-[40%]" />
      </div>

      <div className="text-xs font-mono text-ns-grey-400">
        00:02:31 / 00:10:00
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const values = [40, 60, 30, 80, 90, 55];

  return (
    <div className="h-full rounded-2xl ns-glass-dark p-6 flex items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex-1">
          <div
            className="bg-ns-accent/30 rounded-t-md"
            style={{ height: `${v}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── FEATURES ───────────────────────── */

const FEATURES = [
  {
    title: "Live Coding Environment",
    desc: "Collaborative Monaco editor with multi-cursor editing and instant synchronization.",
    icon: Code,
    mockup: EditorMockup
  },
  {
    title: "AI Code Evaluation",
    desc: "Automatic complexity analysis, bug detection, and style recommendations.",
    icon: Brain,
    mockup: AIMockup
  },
  {
    title: "Session Replay",
    desc: "Replay every keystroke, cursor movement, and discussion from the interview.",
    icon: Clock,
    mockup: ReplayMockup
  },
  {
    title: "Recruiter Analytics",
    desc: "Track candidate performance and hiring pipeline metrics in real time.",
    icon: BarChart3,
    mockup: AnalyticsMockup
  }
];

function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-32 px-6">
      <div className="ns-container">

        <FadeUp>
          <div className="max-w-3xl mb-24">

            <h2 className="text-[clamp(1.4rem,3vw,2.2rem)] font-bold text-white leading-tight tracking-tighter mb-8 italic whitespace-nowrap">
              Built for <span className="text-ns-grey-600 not-italic">modern technical interviews.</span>
            </h2>

            <p className="text-[18px] text-ns-grey-300 leading-relaxed font-medium max-w-2xl">
              Standor provides a collaborative coding workspace designed for
              recruiters and engineers. Real-time editing, AI-powered evaluation,
              and structured hiring analytics in one platform.
            </p>

          </div>
        </FadeUp>

        <FadeUp delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[440px]">

            {/* Editor Feature */}
            <GlassTiltCard className="md:col-span-6 lg:col-span-8 group rounded-[2.5rem] ns-glass border border-white/[0.05] p-10 hover:border-white/[0.15] transition-all duration-500 flex flex-col gap-10 relative overflow-hidden">

              <div className="h-full w-full bg-black/40 rounded-3xl overflow-hidden border border-white/5">
                <EditorMockup />
              </div>

              <div>
                <Code size={20} className="text-ns-accent mb-4"/>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                  Real-Time Coding
                </h3>

                <p className="text-sm text-ns-grey-500 leading-relaxed max-w-md">
                  A collaborative coding environment where candidates and interviewers
                  work together in the same editor instantly.
                </p>
              </div>

            </GlassTiltCard>

            {/* AI */}
            <GlassTiltCard className="md:col-span-3 lg:col-span-4 p-10 rounded-[2.5rem] ns-glass border border-white/[0.05]">

              <div className="h-[200px]">
                <AIMockup />
              </div>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">
                AI Evaluation
              </h3>

              <p className="text-sm text-ns-grey-500">
                Automated feedback including complexity analysis, bug detection,
                and coding quality insights.
              </p>

            </GlassTiltCard>

            {/* Replay */}
            <GlassTiltCard className="md:col-span-3 lg:col-span-5 p-10 rounded-[2.5rem] ns-glass border border-white/[0.05]">

              <div className="h-[200px]">
                <ReplayMockup />
              </div>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">
                Session Replay
              </h3>

              <p className="text-sm text-ns-grey-500">
                Revisit entire interviews with timeline playback and key coding events.
              </p>

            </GlassTiltCard>

            {/* Analytics */}
            <GlassTiltCard className="md:col-span-6 lg:col-span-7 p-10 rounded-[2.5rem] ns-glass border border-white/[0.05] flex gap-10 items-center">

              <div className="flex-1">
                <BarChart3 className="text-ns-accent mb-4"/>

                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                  Recruiter Dashboard
                </h3>

                <p className="text-sm text-ns-grey-500">
                  Gain insights into candidate performance and optimize hiring
                  decisions with structured analytics.
                </p>

              </div>

              <div className="flex-1 h-full">
                <AnalyticsMockup />
              </div>

            </GlassTiltCard>

          </div>
        </FadeUp>

        <div className="mt-24 text-center">
          <button
            onClick={() => navigate('/features')}
            className="btn-sweep group px-12 py-5 rounded-full bg-white text-black font-bold hover:bg-ns-grey-100 transition-all flex items-center gap-2 mx-auto shadow-2xl"
          >
            Explore Standor
            <ArrowRight size={20}/>
          </button>
        </div>

      </div>
    </section>
  );
}


/* ───────────────────────── COLLAB SECTION ───────────────────────── */

function CollaborationSection() {

  const navigate = useNavigate();

  return (
    <section className="py-32 px-6 relative">

      <div className="ns-container grid lg:grid-cols-2 gap-24 items-center">

        <div>

          <FadeUp>
            <h2 className="text-5xl font-bold text-white mb-8 tracking-tighter">
              Interview together in <span className="text-ns-accent">real time</span>.
            </h2>

            <p className="text-[18px] text-ns-grey-300 mb-10 leading-relaxed">
              Standor allows interviewers and candidates to collaborate in the
              same coding environment with live cursors, shared state, and
              synchronized execution.
            </p>
          </FadeUp>

          <div className="space-y-6">

            {[
              {
                t: "Live Cursor Tracking",
                d: "Observe candidate reasoning with real-time editing."
              },
              {
                t: "Shared Coding Environment",
                d: "Both participants interact with the same Monaco editor."
              },
              {
                t: "Instant Feedback",
                d: "AI analyzes code during the interview."
              }

            ].map((item, i) => (

              <div key={i} className="flex gap-4">

                <Check size={16} className="text-ns-accent"/>

                <div>
                  <h4 className="text-base font-bold text-white">{item.t}</h4>
                  <p className="text-sm text-ns-grey-500">{item.d}</p>
                </div>

              </div>

            ))}

          </div>

          <div className="mt-12">

            <button
              onClick={() => navigate('/docs')}
              className="group flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest"
            >

              Explore Developer Docs
              <ArrowRight size={14}/>

            </button>

          </div>

        </div>

      </div>

    </section>
  );

}


/* ───────────────────────── MAIN PAGE ───────────────────────── */

export default function Landing() {

  const [searchParams] = useSearchParams();

  const [banner, setBanner] = useState(null);

  useEffect(() => {

    const status = searchParams.get("newsletter");

    if (status) setBanner(status);

  }, []);

  return (
    <>
      {banner === "confirmed" && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full bg-ns-success/10 border border-ns-success/30 text-ns-success text-sm font-medium shadow-xl backdrop-blur-sm">
          <CheckCircle2 size={16}/>
          Subscription confirmed
        </div>
      )}

      {banner === "error" && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium shadow-xl backdrop-blur-sm">
          <AlertTriangle size={16}/>
          Subscription failed
        </div>
      )}

      <HeroSlider />

      <FeaturesSection />

      <ScrollStorySection />

      <CollaborationSection />

    </>
  );

}