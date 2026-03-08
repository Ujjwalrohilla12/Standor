import { useRef, useCallback, useState, useEffect } from 'react';

/* ────────────────────────────────────────────
   Glass 3D Tilt Card — Elite Motion Spec
   CSS-only 3D perspective tilt on hover.
   Max ±3° tilt. No wobble. No bounce.
   Easing: cubic-bezier(.22, .9, .3, 1)
   ──────────────────────────────────────────── */

type GlassTiltCardProps = {
    children: React.ReactNode;
    className?: string;
};

export default function GlassTiltCard({ children, className = '' }: GlassTiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');
    const [glare, setGlare] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (reducedMotion || !cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;   // 0..1
            const y = (e.clientY - rect.top) / rect.height;    // 0..1

            const maxTilt = 3; // degrees — restrained, per spec
            const rotY = (x - 0.5) * maxTilt * 2;   // -3..+3
            const rotX = -(y - 0.5) * maxTilt * 2;  // -3..+3

            setTransform(
                `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px) scale(1.01)`
            );
            setGlare({ x: x * 100, y: y * 100 });
        },
        [reducedMotion]
    );

    const handleMouseLeave = useCallback(() => {
        setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)');
        setGlare({ x: 50, y: 50 });
        setIsHovered(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    return (
        <div
            ref={cardRef}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                transform: reducedMotion ? undefined : transform,
                transition: [
                    'transform 280ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                    'box-shadow 280ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                    'border-color 200ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                ].join(', '),
                transformStyle: 'preserve-3d',
                willChange: isHovered ? 'transform' : undefined,
                boxShadow: isHovered
                    ? '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)'
                    : '0 10px 40px rgba(0,0,0,0.35)',
                position: 'relative',
            }}
        >
            {/* Inner grid texture — faint depth layer */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    zIndex: 1,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Cursor spotlight glare */}
            {isHovered && !reducedMotion && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        pointerEvents: 'none',
                        zIndex: 10,
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.06) 0%, transparent 55%)`,
                        transition: 'background 280ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                    }}
                />
            )}
            {children}
        </div>
    );
}
