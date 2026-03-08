import { useEffect, useState } from 'react';

/* ────────────────────────────────────────────
   Props & defaults
   ──────────────────────────────────────────── */
export type ReactiveGrid3DProps = {
    gridColor?: string;
    glowColor?: string;
    gridSpacing?: number;
    lineThickness?: number;
    floatAmplitude?: number;
    floatSpeed?: number;
    mouseRotationFactor?: number;
    className?: string;
};

/* ────────────────────────────────────────────
   CSS Grid — perspective grid with mouse parallax
   ──────────────────────────────────────────── */
export default function ReactiveGrid3D({ className }: ReactiveGrid3DProps) {
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            setMouse({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };
        window.addEventListener('mousemove', handler, { passive: true });
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    const offsetX = (mouse.x - 0.5) * 8;
    const offsetY = (mouse.y - 0.5) * 5;

    return (
        <div
            className={className}
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: '-20%',
                    transform: `perspective(600px) rotateX(55deg) translate(${offsetX}px, ${offsetY}px)`,
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px',
                    maskImage:
                        'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)',
                    transition: 'transform 0.3s ease-out',
                }}
            />
        </div>
    );
}
