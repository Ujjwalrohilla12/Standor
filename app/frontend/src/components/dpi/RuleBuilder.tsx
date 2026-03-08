import { useState } from 'react';
import { Shield, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { BlockingRules } from '../../services/dpiApi';
import { SUPPORTED_APPS, APP_COLORS } from './constants';

export default function RuleBuilder({ rules, onChange }: { rules: BlockingRules; onChange: (r: BlockingRules) => void }) {
    const [ipInput, setIpInput] = useState('');
    const [domainInput, setDomainInput] = useState('');
    const [portInput, setPortInput] = useState('');
    const [appOpen, setAppOpen] = useState(false);

    const addIP = () => { if (ipInput.trim() && !rules.blockedIPs.includes(ipInput.trim())) { onChange({ ...rules, blockedIPs: [...rules.blockedIPs, ipInput.trim()] }); setIpInput(''); } };
    const addDomain = () => { if (domainInput.trim() && !rules.blockedDomains.includes(domainInput.trim())) { onChange({ ...rules, blockedDomains: [...rules.blockedDomains, domainInput.trim()] }); setDomainInput(''); } };
    const addPort = () => { const p = parseInt(portInput); if (p > 0 && p <= 65535 && !rules.blockedPorts.includes(p)) { onChange({ ...rules, blockedPorts: [...rules.blockedPorts, p] }); setPortInput(''); } };
    const toggleApp = (app: string) => {
        const apps = rules.blockedApps.includes(app) ? rules.blockedApps.filter(a => a !== app) : [...rules.blockedApps, app];
        onChange({ ...rules, blockedApps: apps });
    };

    const totalRules = rules.blockedIPs.length + rules.blockedApps.length + rules.blockedDomains.length + rules.blockedPorts.length;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#e6e6e6] flex items-center gap-2">
                    <Shield size={15} className="text-red-400" />
                    Blocking Rules
                    <span className="text-[11px] text-[#9b9b9b] font-normal">— C++ RuleManager</span>
                </h3>
                {totalRules > 0 && (
                    <button onClick={() => onChange({ blockedIPs: [], blockedApps: [], blockedDomains: [], blockedPorts: [] })} className="text-[11px] text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 rounded px-1">
                        Clear All ({totalRules})
                    </button>
                )}
            </div>

            {/* IP Blocking */}
            <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Block IPs <span className="text-[#555] ml-1 font-mono text-[10px]">--block-ip</span></label>
                <div className="flex gap-2">
                    <input value={ipInput} onChange={e => setIpInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIP()}
                        placeholder="e.g. 192.168.1.50 or 10.0.0." aria-label="IP address to block" className="flex-1 px-3 py-2 bg-[#101214] border border-white/[0.1] rounded-lg text-[13px] font-mono text-[#e6e6e6] placeholder-[#555] focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                    <button onClick={addIP} aria-label="Add IP rule" className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-bold hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"><Plus size={14} /></button>
                </div>
                {rules.blockedIPs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">{rules.blockedIPs.map(ip => (
                        <span key={ip} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-red-300">
                            {ip} <button onClick={() => onChange({ ...rules, blockedIPs: rules.blockedIPs.filter(i => i !== ip) })} aria-label={`Remove ${ip}`} className="hover:text-red-200 transition-colors"><X size={10} /></button>
                        </span>
                    ))}</div>
                )}
            </div>

            {/* App Blocking */}
            <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Block Apps <span className="text-[#555] ml-1 font-mono text-[10px]">--block-app</span></label>
                <button onClick={() => setAppOpen(v => !v)} aria-expanded={appOpen} className="w-full flex items-center justify-between px-3 py-2 bg-[#101214] border border-white/[0.1] rounded-lg text-[13px] text-[#9b9b9b] hover:border-white/[0.18] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <span>{rules.blockedApps.length > 0 ? `${rules.blockedApps.length} app(s) blocked` : 'Select apps to block…'}</span>
                    {appOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {appOpen && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-3 bg-[#101214] border border-white/[0.1] rounded-lg max-h-52 overflow-y-auto">
                        {SUPPORTED_APPS.map(app => (
                            <button key={app} onClick={() => toggleApp(app)}
                                className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${rules.blockedApps.includes(app) ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'bg-white/[0.03] border border-white/[0.06] text-[#9b9b9b] hover:text-white hover:border-white/[0.15]'}`}>
                                {app}
                            </button>
                        ))}
                    </div>
                )}
                {rules.blockedApps.length > 0 && !appOpen && (
                    <div className="flex flex-wrap gap-1.5">{rules.blockedApps.map(app => (
                        <span key={app} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold" style={{ background: `${APP_COLORS[app] || '#ef4444'}15`, border: `1px solid ${APP_COLORS[app] || '#ef4444'}30`, color: APP_COLORS[app] || '#ef4444' }}>
                            {app} <button onClick={() => toggleApp(app)} aria-label={`Remove ${app}`}><X size={10} /></button>
                        </span>
                    ))}</div>
                )}
            </div>

            {/* Domain Blocking */}
            <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Block Domains <span className="text-[#555] ml-1 font-mono text-[10px]">--block-domain</span></label>
                <div className="flex gap-2">
                    <input value={domainInput} onChange={e => setDomainInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDomain()}
                        placeholder="e.g. *.tiktok.com" aria-label="Domain to block" className="flex-1 px-3 py-2 bg-[#101214] border border-white/[0.1] rounded-lg text-[13px] font-mono text-[#e6e6e6] placeholder-[#555] focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                    <button onClick={addDomain} aria-label="Add domain rule" className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-bold hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"><Plus size={14} /></button>
                </div>
                {rules.blockedDomains.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">{rules.blockedDomains.map(d => (
                        <span key={d} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-red-300">
                            {d} <button onClick={() => onChange({ ...rules, blockedDomains: rules.blockedDomains.filter(x => x !== d) })} aria-label={`Remove ${d}`} className="hover:text-red-200"><X size={10} /></button>
                        </span>
                    ))}</div>
                )}
            </div>

            {/* Port Blocking */}
            <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Block Ports <span className="text-[#555] ml-1 font-mono text-[10px]">--block-port</span></label>
                <div className="flex gap-2">
                    <input value={portInput} onChange={e => setPortInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPort()} type="number" min="1" max="65535"
                        placeholder="e.g. 443" aria-label="Port number to block" className="flex-1 px-3 py-2 bg-[#101214] border border-white/[0.1] rounded-lg text-[13px] font-mono text-[#e6e6e6] placeholder-[#555] focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                    <button onClick={addPort} aria-label="Add port rule" className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-bold hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"><Plus size={14} /></button>
                </div>
                {rules.blockedPorts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">{rules.blockedPorts.map(p => (
                        <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-red-300">
                            :{p} <button onClick={() => onChange({ ...rules, blockedPorts: rules.blockedPorts.filter(x => x !== p) })} aria-label={`Remove port ${p}`} className="hover:text-red-200"><X size={10} /></button>
                        </span>
                    ))}</div>
                )}
            </div>
        </div>
    );
}
