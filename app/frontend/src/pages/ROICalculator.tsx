import { useState, useMemo } from 'react';
import { ArrowRight, Clock, TrendingUp, Users, Zap, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Productivity improvement assumptions:
// - Automated PCAP parsing eliminates ~80% of manual parsing overhead
// - 3D protocol visualization reduces triage time by ~50%
// - Real-time collaboration cuts back-and-forth by ~40%
// - Combined effect: ~65% reduction in per-investigation time
const EFFICIENCY_GAIN = 0.65;
const COLLAB_MULTIPLIER = 0.85; // team overhead reduction when >1 analyst
const HOURS_PER_DAY = 8;

function Slider({
  label, sublabel, min, max, step, value, unit, onChange,
}: {
  label: string; sublabel: string; min: number; max: number; step: number;
  value: number; unit: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-lg font-bold text-white">{label}</p>
          <p className="text-xs text-ns-grey-600 mt-1">{sublabel}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-white tracking-tighter">{value.toLocaleString()}</span>
          <span className="text-sm text-ns-grey-500 ml-1">{unit}</span>
        </div>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/[0.06]">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-ns-accent"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-ns-accent shadow-lg pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-ns-grey-700 uppercase tracking-widest">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon, value, unit, label, sub,
}: {
  icon: React.ElementType; value: string; unit: string; label: string; sub: string;
}) {
  return (
    <div className="ns-glass-dark rounded-[2rem] border border-white/[0.05] p-8 flex flex-col gap-6">
      <div className="w-10 h-10 rounded-xl bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center">
        <Icon size={18} className="text-ns-accent" />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-4xl font-bold text-white tracking-tighter">{value}</span>
          <span className="text-sm text-ns-grey-500">{unit}</span>
        </div>
        <p className="text-sm font-semibold text-white/70">{label}</p>
        <p className="text-[10px] font-mono text-ns-grey-700 uppercase tracking-widest mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default function ROICalculator() {
  const navigate = useNavigate();
  const [analysts, setAnalysts] = useState(3);
  const [incidents, setIncidents] = useState(40);
  const [hoursPerInvestigation, setHoursPerInvestigation] = useState(4);

  const results = useMemo(() => {
    const teamFactor = analysts > 1 ? COLLAB_MULTIPLIER : 1;
    const currentMonthlyHours = analysts * incidents * hoursPerInvestigation;
    const savedHoursPerInvestigation = hoursPerInvestigation * EFFICIENCY_GAIN * teamFactor;
    const savedMonthlyHours = analysts * incidents * savedHoursPerInvestigation;
    const savedDaysPerMonth = savedMonthlyHours / HOURS_PER_DAY;
    const savedDaysPerYear = savedDaysPerMonth * 12;
    const newInvestigationTime = hoursPerInvestigation * (1 - EFFICIENCY_GAIN * teamFactor);
    const mttrReduction = Math.round(EFFICIENCY_GAIN * teamFactor * 100);

    return {
      currentMonthlyHours: Math.round(currentMonthlyHours),
      savedMonthlyHours: Math.round(savedMonthlyHours),
      savedDaysPerMonth: Math.round(savedDaysPerMonth * 10) / 10,
      savedDaysPerYear: Math.round(savedDaysPerYear),
      newInvestigationTime: Math.round(newInvestigationTime * 10) / 10,
      mttrReduction,
      capacityGain: Math.round((savedMonthlyHours / (currentMonthlyHours - savedMonthlyHours + 1)) * 100),
    };
  }, [analysts, incidents, hoursPerInvestigation]);

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">

        {/* Header */}
        <div className="max-w-4xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-10">
            <BarChart2 size={12} className="text-ns-accent" />
            <span className="text-[10px] font-mono text-ns-grey-400 uppercase tracking-widest">Productivity Calculator</span>
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            See what your team <br />
            <span className="text-ns-grey-600">gets back.</span>
          </h1>
          <p className="text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Estimate how much investigation time Standor can return to your analysts — based on automated parsing, visual triage, and real-time collaboration.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 mb-24">

          {/* Inputs */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tighter mb-2">Your current workflow</h2>
              <p className="text-sm text-ns-grey-600">Adjust the sliders to match your team's metrics.</p>
            </div>

            <div className="ns-glass rounded-[2.5rem] border border-white/[0.04] p-10 space-y-12">
              <Slider
                label="Analyst team size"
                sublabel="How many people investigate network incidents"
                min={1} max={50} step={1}
                value={analysts} unit="analysts"
                onChange={setAnalysts}
              />
              <Slider
                label="Incidents per month"
                sublabel="Network events requiring PCAP-level investigation"
                min={5} max={500} step={5}
                value={incidents} unit="incidents"
                onChange={setIncidents}
              />
              <Slider
                label="Time per investigation"
                sublabel="Average hours from capture to conclusion, without tooling"
                min={1} max={24} step={0.5}
                value={hoursPerInvestigation} unit="hours"
                onChange={setHoursPerInvestigation}
              />
            </div>

            {/* Assumptions note */}
            <div className="text-xs text-ns-grey-700 leading-relaxed space-y-1">
              <p className="font-mono uppercase tracking-widest text-[10px] text-ns-grey-700 mb-2">Model assumptions</p>
              <p>• Automated parsing eliminates ~80% of manual decode overhead</p>
              <p>• 3D protocol visualisation reduces triage time by ~50%</p>
              <p>• Real-time collaboration reduces analyst coordination overhead</p>
              <p>• Combined effective time reduction: ~{Math.round(EFFICIENCY_GAIN * 100)}%</p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tighter mb-2">Your projected savings</h2>
              <p className="text-sm text-ns-grey-600">Estimated impact based on your inputs.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={Clock}
                value={results.savedMonthlyHours.toLocaleString()}
                unit="hrs / mo"
                label="Hours recovered"
                sub="Analyst time returned per month"
              />
              <MetricCard
                icon={Users}
                value={results.savedDaysPerYear.toLocaleString()}
                unit="days / yr"
                label="Analyst-days freed"
                sub="Equivalent full working days"
              />
              <MetricCard
                icon={Zap}
                value={`${results.mttrReduction}%`}
                unit=""
                label="MTTR reduction"
                sub="Estimated mean-time-to-respond"
              />
              <MetricCard
                icon={TrendingUp}
                value={`${results.newInvestigationTime}h`}
                unit=""
                label="New avg. investigation"
                sub={`Down from ${hoursPerInvestigation}h per incident`}
              />
            </div>

            {/* Summary bar */}
            <div className="ns-glass-dark rounded-[2rem] border border-white/[0.05] p-8">
              <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest mb-4">Monthly workload shift</p>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-xs text-ns-grey-500 w-24 text-right">Without</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full rounded-full bg-white/20" style={{ width: '100%' }} />
                </div>
                <span className="text-xs text-ns-grey-400 w-16">{results.currentMonthlyHours.toLocaleString()}h</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-ns-grey-500 w-24 text-right">With Standor</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-ns-accent"
                    style={{ width: `${Math.max(5, 100 - results.mttrReduction)}%` }}
                  />
                </div>
                <span className="text-xs text-ns-grey-400 w-16">{(results.currentMonthlyHours - results.savedMonthlyHours).toLocaleString()}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="ns-glass-dark rounded-[3.5rem] border border-white/[0.05] p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-ns-accent/5 blur-[120px] -z-10" />
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tighter">
            Ready to reclaim {results.savedDaysPerMonth} analyst-days per month?
          </h2>
          <p className="text-lg text-ns-grey-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Standor is completely free. Start your first investigation in minutes — no credit card, no enterprise lock-in.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="group px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center gap-2 shadow-2xl"
            >
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-10 py-4 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
            >
              Talk to Us
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}