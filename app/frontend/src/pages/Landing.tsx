import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Github, Code2, Brain, Terminal, Layers, Play, Check } from 'lucide-react';

const CODE_LINES = [
  { code: 'function twoSum(nums: number[], target: number) {', key: 0 },
  { code: '  const map = new Map<number, number>();', key: 1, hl: true },
  { code: '  for (let i = 0; i < nums.length; i++) {', key: 2 },
  { code: '    const comp = target - nums[i];', key: 3 },
  { code: '    if (map.has(comp)) {', key: 4 },
  { code: '      return [map.get(comp)!, i];', key: 5, hl: true },
  { code: '    }', key: 6 },
  { code: '    map.set(nums[i], i);', key: 7 },
  { code: '  }', key: 8 },
  { code: '}', key: 9 },
];

export default function Landing() {
  const [visibleLines, setVisibleLines] = useState(0);
  const demoRef = useRef<HTMLDivElement>(null);
  const demoInView = useInView(demoRef, { once: true });

  useEffect(() => {
    if (!demoInView) return;
    let i = 0;
    const t = setInterval(() => { i++; setVisibleLines(i); if (i >= CODE_LINES.length) clearInterval(t); }, 110);
    return () => clearInterval(t);
  }, [demoInView]);

  return (
    <main className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white/30 text-[15px]">

      {/* ── HERO SECTION ── */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center pt-24 pb-16 px-6 lg:px-12 bg-black">
        {/* Background Ambient Swoosh (Subtle monochrome) */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[400px] pointer-events-none overflow-hidden opacity-20">
          <div className="w-[150%] h-full ml-[-25%] bg-gradient-to-r from-zinc-900 via-zinc-800 to-black blur-[120px] rounded-[100%] scale-y-50 rotate-[-10deg]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left: Text */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-bold leading-[1.1] tracking-tight mb-6 text-white">
              The Interview Platform for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                Real Engineers
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white mb-10 max-w-lg leading-relaxed opacity-90">
              Discover, organize, and conduct seamless technical interviews. Write code in the same Monaco editor, evaluate instantly with AI, and hire the best. Join the community!
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/join" className="px-8 py-3 rounded-lg border border-white bg-white text-black font-semibold hover:bg-zinc-100 transition-all flex items-center gap-2">
                Join Meeting
                <Play size={16} fill="currentColor" />
              </Link>
              <Link to="/login" className="px-8 py-3 rounded-lg border border-white/20 bg-black text-white font-medium hover:bg-white/5 transition-all">
                Login
              </Link>
            </div>
          </motion.div>

          {/* Right: Glowing UI Mockup Frame */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[500px] flex items-center justify-center">
            {/* Subtle white/zinc glow border */}
            <div className="absolute inset-4 rounded-[32px] bg-gradient-to-br from-white/30 to-zinc-900 blur-[15px] opacity-30"></div>

            <div className="relative w-full h-full p-1 rounded-[28px] bg-zinc-800/20 shadow-2xl">
              <div ref={demoRef} className="w-full h-full bg-[#0d1117] rounded-[24px] overflow-hidden flex flex-col border border-white/10">
                {/* Editor Top Bar Mock */}
                <div className="h-10 border-b border-white/10 bg-[#161b22] px-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 ml-2">twoSum.ts</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-bold border border-white/10 shadow">RS</span>
                    <span className="w-5 h-5 rounded-full bg-zinc-500 flex items-center justify-center text-[9px] font-bold border border-white/10 shadow -ml-2">AK</span>
                  </div>
                </div>
                {/* Editor Content Mock */}
                <div className="flex-1 p-5 font-mono text-xs sm:text-sm leading-6 sm:leading-7 overflow-hidden text-zinc-400">
                  {CODE_LINES.map((line, i) => (
                    <div key={line.key} className={`flex items-center transition-all duration-300 ${i < visibleLines ? 'opacity-100' : 'opacity-0'} ${(line as any).hl ? 'text-white bg-white/10 px-1 rounded -mx-1' : ''}`}>
                      <span className="text-zinc-700 w-6 text-right mr-4 select-none">{i + 1}</span>
                      <span>{line.code}</span>
                      {i === visibleLines - 1 && <span className="inline-block w-1.5 h-4 bg-white ml-1 animate-pulse" />}
                    </div>
                  ))}
                </div>
                {/* Editor Bottom Bar Mock */}
                <div className="h-10 border-t border-white/10 bg-[#161b22] px-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-600">TypeScript · WebRTC Sync</span>
                  <div className="px-3 py-1 bg-white/5 text-zinc-400 rounded text-[10px] font-bold border border-white/5">● Connected</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="w-full py-24 px-6 lg:px-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-16 text-white uppercase tracking-widest">About Standor</h2>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">

            {/* Left: Dashboard Mockup */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative aspect-video lg:aspect-square w-full max-w-lg mx-auto lg:max-w-none">
              <div className="absolute inset-6 bg-white/5 blur-[25px] opacity-10 rounded-2xl"></div>
              <div className="relative h-full bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 overflow-hidden">
                <h3 className="font-bold text-center text-sm border-b border-white/10 pb-3 text-zinc-500 uppercase tracking-tighter">Session Stats</h3>
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-zinc-900/50 rounded-xl p-4 flex flex-col items-center justify-center border border-white/[0.05]">
                    <Brain className="text-white mb-2" size={24} />
                    <span className="text-xs text-zinc-500 text-center">AI Confidence</span>
                    <span className="text-2xl font-bold text-white mt-1">94%</span>
                  </div>
                  <div className="bg-zinc-900/50 rounded-xl p-4 flex flex-col border border-white/[0.05] relative overflow-hidden">
                    <span className="text-xs text-zinc-500">Total Runs</span>
                    <span className="text-2xl font-bold text-white mt-1">12</span>
                    <div className="absolute bottom-0 left-0 w-full h-8 flex items-end px-2 pb-2 gap-1 opacity-50">
                      <div className="w-full bg-zinc-600 rounded-t-sm h-[40%]"></div>
                      <div className="w-full bg-zinc-400 rounded-t-sm h-[60%]"></div>
                      <div className="w-full bg-zinc-700 rounded-t-sm h-[30%]"></div>
                      <div className="w-full bg-zinc-200 rounded-t-sm h-[90%]"></div>
                    </div>
                  </div>
                  <div className="col-span-2 bg-zinc-900/50 rounded-xl p-4 border border-white/[0.05] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Time Elapsed</span>
                      <span className="text-xl font-bold font-mono">42:15</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ffffff_70%,transparent_0)] opacity-20" />
                      <div className="w-10 h-10 bg-zinc-950 rounded-full z-10 flex items-center justify-center text-[10px] font-bold">OK</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Text */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-white text-lg leading-relaxed opacity-90">
                Standor is a platform built for tech enthusiasts to discover, showcase, and evaluate coding skills with like-minded individuals. You can create your own interview rooms, execute code seamlessly, and get AI recommendations on the basis of your solutions and problem-solving approach. Standor is a community that brings engineers together through a shared love of elegant code.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="w-full py-24 px-6 lg:px-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-16 text-white uppercase tracking-widest">Features</h2>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">

            {/* Feature 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden group hover:border-white transition-all duration-300">
              <div className="h-48 sm:h-56 p-6 flex justify-center items-center bg-zinc-950">
                <div className="w-full max-w-sm h-full bg-[#161b22] border border-white/5 rounded-lg shadow-lg relative overflow-hidden flex flex-col">
                  <div className="h-8 border-b border-white/5 bg-[#0d1117] px-3 flex items-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Rooms</span>
                  </div>
                  <div className="flex-1 p-3 flex gap-2">
                    <div className="w-1/3 bg-zinc-800 border border-white/10 rounded-md opacity-20"></div>
                    <div className="w-1/3 bg-zinc-700 border border-white/5 rounded-md opacity-30"></div>
                    <div className="w-1/3 bg-zinc-600 border border-white/10 rounded-md opacity-40"></div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">Room Creation</h3>
                <p className="text-sm text-white opacity-70">Create and manage your own collaborative coding rooms instantly.</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden group hover:border-white transition-all duration-300">
              <div className="h-48 sm:h-56 p-6 flex justify-center items-center bg-zinc-950">
                <div className="w-full max-w-sm h-full flex gap-3">
                  <div className="flex-1 bg-[#161b22] border border-white/5 rounded-lg flex flex-col p-3 shadow-lg">
                    <div className="h-6 bg-white/10 rounded w-1/2 mb-3"></div>
                    <div className="h-3 bg-white/5 rounded w-full mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-4/5 mb-4"></div>
                    <div className="mt-auto h-24 bg-zinc-900 rounded-lg flex items-end justify-center pb-2">
                      <Brain className="text-white opacity-40" size={32} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">AI powered Insights</h3>
                <p className="text-sm text-white opacity-70">Keep a personalized, automated journal entry for every session you host.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden group hover:border-white transition-all duration-300">
              <div className="h-48 sm:h-56 p-6 flex justify-center items-center bg-zinc-950">
                <div className="w-full max-w-sm h-full bg-[#161b22] border border-white/5 rounded-lg shadow-lg relative p-4 flex gap-4">
                  <div className="w-16 h-[120%] -mt-6 rounded overflow-hidden shadow-2xl bg-zinc-800 flex-shrink-0 border border-white/10 opacity-60"></div>
                  <div className="w-16 h-[120%] -mt-6 rounded overflow-hidden shadow-2xl bg-zinc-600 flex-shrink-0 border border-white/10 opacity-70"></div>
                  <div className="w-16 h-[120%] -mt-6 rounded overflow-hidden shadow-2xl bg-zinc-700 flex-shrink-0 border border-white/10 opacity-80"></div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">Top Library Problems</h3>
                <p className="text-sm text-white opacity-70">Effortlessly curate and showcase your top coding challenges in a sleek, customizable list.</p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden group hover:border-white transition-all duration-300">
              <div className="h-48 sm:h-56 p-6 flex justify-center items-center bg-zinc-950">
                <div className="w-full max-w-sm h-full bg-[#161b22] border border-white/5 rounded-lg shadow-lg relative flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-white/5 flex gap-2">
                    <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded border border-white/10">Python</span>
                    <span className="text-[10px] bg-white/5 text-zinc-400 px-2 py-0.5 rounded border border-white/5">JavaScript</span>
                    <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold">Rust</span>
                  </div>
                  <div className="flex-1 p-3">
                    <div className="h-2 w-1/3 bg-zinc-800 rounded mb-2"></div>
                    <div className="h-2 w-1/2 bg-zinc-800 rounded mb-2"></div>
                    <div className="h-2 w-2/5 bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">Sandboxed Execution</h3>
                <p className="text-sm text-white opacity-70">Get lightning-fast, secure execution for your code across 12+ real runtime environments.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </main>
  );
}
