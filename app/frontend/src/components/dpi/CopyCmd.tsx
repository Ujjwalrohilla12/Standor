import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyCmd({ cmd }: { cmd: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg border border-white/[0.06] font-mono text-[11px] text-neutral-400 group">
            <span className="text-green-500/60">$</span>
            <span className="flex-1 truncate">{cmd}</span>
            <button onClick={copy} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-white">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            </button>
        </div>
    );
}
