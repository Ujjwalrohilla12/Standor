import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Globe, Zap, Database, Cpu } from 'lucide-react';
import api from '../utils/api';

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  version: string;
}

const SERVICES = [
  { name: 'REST API', icon: Globe },
  { name: 'Authentication Service', icon: Zap },
  { name: 'Database (MongoDB)', icon: Database },
  { name: 'Real-time Collaboration (Socket.io)', icon: Cpu },
  { name: 'PCAP Upload & Parsing', icon: Cpu },
];

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function Status() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'operational' | 'degraded'>('checking');

  useEffect(() => {
    api.get('/health')
      .then(r => {
        setHealth(r.data);
        setApiStatus('operational');
      })
      .catch(() => {
        setApiStatus('degraded');
      });
  }, []);

  const isOperational = apiStatus === 'operational';

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        {/* Header */}
        <div className="max-w-4xl mb-32">
          <div className="flex items-center gap-4 mb-8">
            {apiStatus === 'checking' ? (
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
            ) : isOperational ? (
              <div className="w-3 h-3 rounded-full bg-ns-success animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
            )}
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {apiStatus === 'checking' ? 'Checking systems…' : isOperational ? 'All systems operational.' : 'Service disruption detected.'}
            </h1>
          </div>
          <p className="text-xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Live status of the Standor API and infrastructure services.
          </p>
        </div>

        {/* Live metrics */}
        {health && (
          <div className="grid md:grid-cols-3 gap-8 mb-48">
            <div className="ns-glass-dark rounded-[2rem] border border-white/[0.05] p-10">
              <Globe size={24} className="text-ns-grey-600 mb-6" />
              <p className="text-4xl font-bold text-white mb-2 tracking-tighter">{health.version}</p>
              <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest">API Version</p>
            </div>
            <div className="ns-glass-dark rounded-[2rem] border border-white/[0.05] p-10">
              <Clock size={24} className="text-ns-grey-600 mb-6" />
              <p className="text-4xl font-bold text-white mb-2 tracking-tighter">{formatUptime(health.uptime)}</p>
              <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest">Current Uptime</p>
            </div>
            <div className="ns-glass-dark rounded-[2rem] border border-white/[0.05] p-10">
              <Zap size={24} className="text-ns-grey-600 mb-6" />
              <p className="text-4xl font-bold text-white mb-2 tracking-tighter capitalize">{health.status}</p>
              <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest">API Status</p>
            </div>
          </div>
        )}

        {/* Service Health */}
        <div className="mb-48">
          <h2 className="text-4xl font-bold text-white tracking-tighter mb-12">Service Health</h2>
          <div className="ns-glass rounded-[2.5rem] border border-white/[0.04] overflow-hidden">
            {SERVICES.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-8 border-b border-white/[0.04] last:border-none hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-6">
                  {apiStatus === 'checking' ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 animate-pulse" />
                  ) : isOperational ? (
                    <CheckCircle2 size={18} className="text-ns-success" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                  <span className="text-lg font-bold text-white">{s.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-3 py-1 rounded-full border uppercase tracking-widest ${
                  apiStatus === 'checking'
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    : isOperational
                    ? 'bg-ns-success/10 text-ns-success border-ns-success/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {apiStatus === 'checking' ? 'Checking' : isOperational ? 'Operational' : 'Degraded'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <div className="mb-32">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-12">Incident History</h2>
          <div className="ns-glass-dark rounded-[2rem] border border-white/[0.05] p-10 text-center">
            <p className="text-ns-grey-600 text-sm">No incidents recorded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}