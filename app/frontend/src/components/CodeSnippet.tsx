import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeSnippetProps {
  title: string;
  code: string;
  language?: string;
}

export default function CodeSnippet({ title, code, language = 'python' }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-ns-grey-500" />
          <span className="text-[10px] font-bold text-ns-grey-400 uppercase tracking-widest">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-ns-grey-500 hover:text-white"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check size={14} className="text-ns-success" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Copy size={14} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto custom-scrollbar">
        <pre className="text-ns-grey-300">
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-ns-grey-700 w-4 select-none">{i + 1}</span>
              <span dangerouslySetInnerHTML={{ 
                __html: highlightCode(line, language) 
              }} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// Simple regex-based syntax highlighting for the demo
function highlightCode(line: string, lang: string) {
  if (lang === 'python') {
    return line
      .replace(/(import|from|def|return|if|else|for|in|class|await|async|as)\b/g, '<span class="text-ns-accent">$1</span>')
      .replace(/(".*?"|'.*?')/g, '<span class="text-ns-success">$1</span>')
      .replace(/\b(session|Standor|Client)\b/g, '<span class="text-blue-400">$1</span>')
      .replace(/(#.*)/g, '<span class="text-ns-grey-600 italic">$1</span>');
  }
  return line;
}
