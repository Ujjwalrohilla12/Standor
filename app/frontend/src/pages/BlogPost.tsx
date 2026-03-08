import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Linkedin, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { POSTS } from './Blog';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const post = POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-ns-grey-600 mb-6">This article could not be found.</p>
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-white hover:text-ns-accent transition-colors mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Engineering Blog
          </button>
        </div>
      </div>
    );
  }

  // Render content: lines starting with ## become h2, ``` blocks become pre/code
  const renderContent = (raw: string) => {
    const blocks = raw.split(/\n\n+/);
    const elements: React.ReactNode[] = [];
    let inCode = false;
    let codeLines: string[] = [];
    let key = 0;

    const flushCode = () => {
      if (codeLines.length) {
        elements.push(
          <pre key={key++} className="bg-white/[0.03] border border-white/[0.06] rounded-xl md:rounded-2xl p-4 md:p-6 overflow-x-auto text-xs md:text-sm text-ns-grey-300 font-mono leading-relaxed mb-8">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
      }
    };

    for (const block of blocks) {
      if (block.startsWith('```')) {
        inCode = !inCode;
        if (!inCode) flushCode();
        continue;
      }
      if (inCode) {
        codeLines.push(...block.split('\n'));
        continue;
      }
      if (block.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl font-bold text-white mt-12 mb-4 tracking-tight">
            {block.slice(3)}
          </h2>
        );
      } else {
        elements.push(
          <p key={key++} className="text-ns-grey-400 leading-relaxed mb-6">
            {block}
          </p>
        );
      }
    }
    if (inCode) flushCode();
    return elements;
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-ns-grey-500 hover:text-white transition-colors text-sm mb-12 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Engineering Blog
          </button>

          {/* Tag */}
          <span className="text-[9px] font-mono text-ns-accent uppercase tracking-widest px-3 py-1 rounded-full bg-ns-accent/10 border border-ns-accent/20 inline-block mb-8">
            {post.tag}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tighter mb-8">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-ns-grey-600 font-mono mb-16 pb-12 border-b border-white/[0.04]">
            <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> {post.readTime}</span>
            <span className="flex items-center gap-1.5"><User size={12} /> {post.author}</span>
          </div>

          {/* Share buttons */}
          {(() => {
            const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
            const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

            const copyLink = () => {
              navigator.clipboard.writeText(pageUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            };

            return (
              <div className="flex items-center gap-2 mb-12">
                <span className="text-[10px] text-ns-grey-600 uppercase tracking-widest font-mono mr-1">Share</span>
                <a
                  href={liUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-ns-grey-500 hover:text-white hover:border-white/[0.2] transition-colors text-xs"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin size={12} /> LinkedIn
                </a>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-ns-grey-500 hover:text-white hover:border-white/[0.2] transition-colors text-xs"
                  aria-label="Copy link"
                >
                  {copied ? <Check size={12} className="text-ns-success" /> : <Link2 size={12} />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            );
          })()}

          {/* Excerpt lead */}
          <p className="text-lg md:text-xl text-ns-grey-300 leading-relaxed mb-12 font-medium">
            {post.excerpt}
          </p>

          {/* Body */}
          <div className="prose-like">
            {renderContent(post.content)}
          </div>

          {/* Footer nav */}
          <div className="mt-20 pt-12 border-t border-white/[0.04] flex items-center justify-between">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-ns-grey-500 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="text-xs text-ns-grey-600 hover:text-white transition-colors"
            >
              Suggest a topic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
