import { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Terminal, Search, Play, Loader2, FileText, HelpCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

// Services
import { dpiApi, DpiResult, BlockingRules } from '../services/dpiApi';

// Components
import RuleBuilder from '../components/dpi/RuleBuilder';
import DpiResults from '../components/dpi/DpiResults';
import CopyCmd from '../components/dpi/CopyCmd';
import { detectPlatform } from '../components/dpi/constants';

// Store
import useStore from '../store/useStore';

export default function DpiTools() {
    const navigate = useNavigate();
    // Use user from the existing store, or mock auth if needed.
    const user = useStore(state => state.user);

    useEffect(() => {
        // Enforce login for this SaaS tool
        // Assuming user is null if not logged in.
        // If your store does not have user, this condition can be adjusted.
        if (user === null) {
            // Uncomment if you want strict redirect:
            // navigate("/login");
        }
    }, [user, navigate]);

    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<(DpiResult & { blockedFlows?: number }) | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [rules, setRules] = useState<BlockingRules>({ blockedIPs: [], blockedApps: [], blockedDomains: [], blockedPorts: [] });
    const [activeTab, setActiveTab] = useState<'online' | 'local'>('online');
    const [platform, setPlatform] = useState(detectPlatform());
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock rate limiting UI
    const remainingAnalyses = 3;
    const totalAnalyses = 10;

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && (dropped.name.endsWith('.pcap') || dropped.name.endsWith('.pcapng') || dropped.name.endsWith('.cap'))) {
            setFile(dropped);
        } else {
            toast.error('Please drop a .pcap or .pcapng file');
        }
    }, []);

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setProgress(0);
        setResult(null);

        const totalRules = rules.blockedIPs.length + rules.blockedApps.length + rules.blockedDomains.length + rules.blockedPorts.length;

        try {
            const onProgress = (e: any) => { if (e.total) setProgress(Math.round((e.loaded / e.total) * 100)); };

            let res: DpiResult & { blockedFlows?: number };
            if (totalRules > 0) {
                res = await dpiApi.analyzeWithRules(file, rules, onProgress);
            } else {
                res = await dpiApi.analyze(file, onProgress);
            }
            setResult(res);
            toast.success(`DPI complete: ${res.totalPackets} packets, ${res.activeFlows} flows`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Standor DPI Engine — Deep Packet Inspection</title>
                <meta name="description" content="Online deep packet inspection with full C++ engine feature parity." />
            </Helmet>
            <div className="min-h-screen bg-[#09090b] relative overflow-hidden">
                {/* Ambient background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
                    {/* ── Hero ── */}
                    <div className="text-center mb-12 mt-4">
                        <div className="inline-flex items-center px-6 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-full text-[13px] font-bold text-white/80 uppercase tracking-widest mb-6">
                            Standor SaaS Component
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black mb-5 tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
                            Standor DPI Engine
                        </h1>
                        <p className="text-[#b0b0b0] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Full C++ engine feature parity — online.
                        </p>
                        <p className="text-[#666] text-sm max-w-xl mx-auto mt-3 leading-relaxed">
                            Upload PCAP files, apply blocking rules, inspect traffic at the packet level. Or download the native binary.
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-5 text-sm text-[#999] font-medium">
                            <span>Real-time analysis</span>
                            <span className="w-1 h-1 rounded-full bg-[#444]" />
                            <span>Rule-based blocking</span>
                            <span className="w-1 h-1 rounded-full bg-[#444]" />
                            <span>27+ app signatures</span>
                        </div>
                    </div>

                    {/* ── Tab switcher ── */}
                    <div className="flex justify-center mb-10" role="tablist">
                        <div className="flex bg-white/[0.02] border border-white/[0.05] rounded-2xl p-1.5 gap-1">
                            <button onClick={() => setActiveTab('online')} role="tab" aria-selected={activeTab === 'online'}
                                className={`px-7 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 flex items-center gap-2.5 ${activeTab === 'online' ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-[#888] hover:text-white hover:bg-white/[0.04]'}`}>
                                <Search size={15} /> Online Analysis
                            </button>
                            <button onClick={() => setActiveTab('local')} role="tab" aria-selected={activeTab === 'local'}
                                className={`px-7 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 flex items-center gap-2.5 ${activeTab === 'local' ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-[#888] hover:text-white hover:bg-white/[0.04]'}`}>
                                <Download size={15} /> Local Install
                            </button>
                        </div>
                    </div>

                    {/* ═══════════ ONLINE ANALYSIS TAB ═══════════ */}
                    {activeTab === 'online' && (
                        <div role="tabpanel" className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
                            {/* Left panel: Upload + Rules + Rate Limits */}
                            <div className="space-y-6">
                                {/* Rate Limiting Box */}
                                <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 flex items-center justify-between">
                                    <span className="text-sm text-indigo-200 font-medium">Remaining analyses today</span>
                                    <span className="text-sm font-bold text-indigo-400">{remainingAnalyses} / {totalAnalyses}</span>
                                </div>

                                {/* File Upload */}
                                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 space-y-5">
                                    <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                                        <Upload size={16} className="text-white/60" /> Upload PCAP
                                    </h3>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${dragOver ? 'border-indigo-500/50 bg-indigo-500/10' : file ? 'border-white/30 bg-white/[0.03]' : 'border-white/[0.08] hover:border-white/20'}`}>
                                        <input ref={fileInputRef} type="file" accept=".pcap,.pcapng,.cap" className="hidden"
                                            onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                                        {file ? (
                                            <div className="space-y-2">
                                                <FileText size={24} className="mx-auto text-white/70" />
                                                <div className="text-[15px] font-mono text-white font-bold">{file.name}</div>
                                                <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }} className="text-[12px] text-red-400 hover:text-red-300 transition-colors">✕ Remove file</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload size={28} className="mx-auto text-[#555]" />
                                                <div className="text-[15px] text-[#c0c0c0]">Drop a <span className="text-white font-semibold">.pcap</span> file here or click to browse</div>
                                                <div className="text-[12px] text-[#666]">Max 100 MB</div>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={handleAnalyze} disabled={!file || loading}
                                        className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[15px] font-bold transition-all ${!file || loading ? 'bg-white/[0.05] text-[#555] cursor-not-allowed' : 'bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10'}`}>
                                        {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing… {progress > 0 && `${progress}%`}</> : <><Play size={16} /> Run Analysis</>}
                                    </button>
                                </div>

                                {/* Rule Builder Component */}
                                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6">
                                    <RuleBuilder rules={rules} onChange={setRules} />
                                </div>

                                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 space-y-4">
                                    <h3 className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider flex items-center gap-1.5"><Zap size={12} className="text-white/50" /> Engine Features</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                        {['TLS SNI extraction', 'ALPN detection', 'HTTP Host parsing', 'QUIC/HTTP3 detection', 'DNS queries', '27+ named apps', 'Rule-based blocking'].map(f => (
                                            <div key={f} className="flex items-center gap-2 text-[12px] text-[#9b9b9b]">
                                                <span className="text-indigo-400">✓</span> {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right panel */}
                            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6">
                                {!result && !loading && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-[#e6e6e6]">
                                            <HelpCircle size={15} className="text-white/60" /> Instructions
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { step: '1', title: 'Upload PCAP', desc: 'Securely upload network captures for remote analysis.' },
                                                { step: '2', title: 'Set Rules', desc: 'Optional: simulate C++ RuleManager dropping traffic.' },
                                                { step: '3', title: 'Inspect Results', desc: 'Get faang-level telemetry on active packet flows.' }
                                            ].map(({ step, title, desc }) => (
                                                <div key={step} className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-[13px] font-bold text-white shrink-0">{step}</div>
                                                    <div>
                                                        <div className="text-[13px] font-semibold text-[#e6e6e6]">{title}</div>
                                                        <div className="text-[12px] text-[#777] mt-0.5">{desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
                                        <Loader2 size={36} className="text-indigo-400 animate-spin" />
                                        <div className="text-[16px] font-semibold text-white">Analysing via Backend API...</div>
                                    </div>
                                )}
                                {result && <DpiResults result={result} />}
                            </div>
                        </div>
                    )}

                    {/* ═══════════ LOCAL INSTALL TAB ═══════════ */}
                    {activeTab === 'local' && (
                        <div role="tabpanel" className="max-w-3xl mx-auto space-y-8">
                            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8 space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                                    <Terminal size={20} className="text-white/60" /> Native Binary Install
                                </h3>
                                <div className="flex gap-2">
                                    {(['windows', 'linux', 'macos'] as const).map(p => (
                                        <button key={p} onClick={() => setPlatform(p)}
                                            className={`px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all ${platform === p ? 'bg-white text-black' : 'bg-white/[0.03] text-[#9b9b9b] hover:text-white'}`}>
                                            <span className="capitalize">{p}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <a href={dpiApi.binaryUrl(platform)} download className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white text-black text-[15px] font-bold hover:bg-neutral-200">
                                        <Download size={18} /> Download Binary
                                    </a>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8 space-y-5">
                                <h3 className="text-[15px] font-bold text-white">CLI Reference</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">Basic Run</div>
                                        <CopyCmd cmd={platform === 'windows' ? 'standor-dpi.exe input.pcap output.pcap' : './standor-dpi input.pcap output.pcap'} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">Block App</div>
                                        <CopyCmd cmd={platform === 'windows' ? 'standor-dpi.exe in.pcap out.pcap --block-app YouTube' : './standor-dpi in.pcap out.pcap --block-app YouTube'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
