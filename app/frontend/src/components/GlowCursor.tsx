import { useEffect, useRef, useState } from 'react';

/* ────────────────────────────────────────────
   Glow Cursor
   Replaces default cursor with a subtle
   glowing dot + trailing soft halo.
   Respects prefers-reduced-motion.
   ──────────────────────────────────────────── */

export default function GlowCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const haloRef = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: -100, y: -100 });
    const smoothPos = useRef({ x: -100, y: -100 });
    const raf = useRef(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (reducedMotion) return;

        // Hide default cursor globally
        document.body.style.cursor = 'none';

        const handleMove = (e: MouseEvent) => {
            pos.current = { x: e.clientX, y: e.clientY };
        };

        const handleLeave = () => {
            pos.current = { x: -100, y: -100 };
            smoothPos.current = { x: -100, y: -100 };
        };

        window.addEventListener('mousemove', handleMove, { passive: true });
        document.addEventListener('mouseleave', handleLeave);

        // Smooth follow loop for halo
        const tick = () => {
            smoothPos.current.x += (pos.current.x - smoothPos.current.x) * 0.15;
            smoothPos.current.y += (pos.current.y - smoothPos.current.y) * 0.15;

            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
            }
            if (haloRef.current) {
                haloRef.current.style.transform = `translate(${smoothPos.current.x - 16}px, ${smoothPos.current.y - 16}px)`;
            }

            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);

        return () => {
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseleave', handleLeave);
            cancelAnimationFrame(raf.current);
        };
    }, [reducedMotion]);

    if (reducedMotion) return null;

    return (
        <>
            {/* Inner dot — precise position */}
            <div
                ref={dotRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 0 6px rgba(255,255,255,0.4)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    mixBlendMode: 'difference',
                    willChange: 'transform',
                }}
            />
            {/* Outer halo — smooth follow */}
            <div
                ref={haloRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'radial-gradient(circle, rgba(10,132,255,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    willChange: 'transform',
                }}
            />
        </>
    );
}
