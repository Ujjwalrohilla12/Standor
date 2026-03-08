import { useState, useRef, useCallback, useEffect } from 'react';

/* ────────────────────────────────────────────
   3D Architecture Stack
   Layered horizontal slabs with Z-depth separation.
   Hover expands the layer. Each has accent glow.
   Scroll-triggered entrance animation.
   ──────────────────────────────────────────── */

const LAYERS = [
    { name: 'Frontend', desc: 'React 18 · Vite · TypeScript · Three.js · TailwindCSS', color: '#0A84FF', z: 0 },
    { name: 'State', desc: 'Zustand · React Hook Form · Zod validation', color: '#8B5CF6', z: 1 },
    { name: 'Real-time', desc: 'Socket.io · Yjs CRDT · WebSocket collaboration', color: '#06B6D4', z: 2 },
    { name: 'API', desc: 'Express · TypeScript · JWT · Argon2 · Helmet', color: '#3B82F6', z: 3 },
    { name: 'Queue', desc: 'BullMQ · Redis (ioredis) · Job scheduling', color: '#FF9F0A', z: 4 },
    { name: 'Database', desc: 'MongoDB (Mongoose) · Docker · Node 20 Alpine', color: '#32D74B', z: 5 },
];

export default function ArchitectureStack({ className }: { className?: string }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const handleMouse = useCallback((idx: number) => setHoveredIdx(idx), []);
    const handleLeave = useCallback(() => setHoveredIdx(null), []);

    return (
        <div ref={containerRef} className={className}>
            <div style={{
                perspective: '800px',
                perspectiveOrigin: '50% 40%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                {LAYERS.map((layer, i) => {
                    const isHovered = hoveredIdx === i;
                    const delay = i * 80;

                    return (
                        <div
                            key={layer.name}
                            onMouseEnter={() => handleMouse(i)}
                            onMouseLeave={handleLeave}
                            style={{
                                transform: visible
                                    ? `translateZ(${isHovered ? 20 : 0}px) translateY(${isHovered ? -2 : 0}px) scale(${isHovered ? 1.02 : 1})`
                                    : 'translateZ(-30px) translateY(20px) scale(0.95)',
                                opacity: visible ? 1 : 0,
                                transition: `all 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`,
                                transformStyle: 'preserve-3d',
                                cursor: 'pointer',
                                position: 'relative',
                            }}
                        >
                            <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-xl" style={{
                                background: isHovered
                                    ? `linear-gradient(135deg, ${layer.color}15, ${layer.color}08)`
                                    : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isHovered ? layer.color + '30' : 'rgba(255,255,255,0.04)'}`,
                                boxShadow: isHovered
                                    ? `0 8px 30px ${layer.color}15, 0 0 0 1px ${layer.color}10`
                                    : '0 2px 8px rgba(0,0,0,0.2)',
                                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '3px',
                                        height: '28px',
                                        borderRadius: '2px',
                                        background: layer.color,
                                        opacity: isHovered ? 1 : 0.4,
                                        boxShadow: isHovered ? `0 0 10px ${layer.color}60` : 'none',
                                        transition: 'all 0.3s ease',
                                    }} />
                                    <div>
                                        <div className="text-xs sm:text-[13px] font-bold tracking-[0.02em] transition-colors duration-300" style={{
                                            color: isHovered ? '#fff' : 'rgba(255,255,255,0.7)',
                                        }}>
                                            {layer.name}
                                        </div>
                                        <div className="text-[10px] sm:text-[11px] font-mono mt-1 sm:mt-[2px]" style={{
                                            color: 'rgba(255,255,255,0.35)',
                                        }}>
                                            {layer.desc}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '10px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    color: isHovered ? layer.color : 'rgba(255,255,255,0.2)',
                                    transition: 'color 0.3s ease',
                                }}>
                                    L{i}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
