import { useRef, useCallback, useState, type ReactNode } from 'react';

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    accentColor?: string; // hex for per-card colored glow
}

export default function SpotlightCard({ children, className = '', accentColor }: SpotlightCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const spotRef = useRef<HTMLDivElement>(null);
    const borderRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50 });

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        const spot = spotRef.current;
        const border = borderRef.current;
        if (!card || !spot) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;   // px from left
        const y = e.clientY - rect.top;    // px from top
        const nx = x / rect.width;         // 0..1
        const ny = y / rect.height;        // 0..1

        // Cursor spotlight
        spot.style.left = `${x}px`;
        spot.style.top = `${y}px`;
        spot.style.opacity = '1';

        // Border radial glow
        if (border && accentColor) {
            border.style.background = `radial-gradient(220px circle at ${x}px ${y}px, ${accentColor}28, transparent 75%)`;
        }

        // 3D tilt — max ±4°
        const rotY = (nx - 0.5) * 8;
        const rotX = -(ny - 0.5) * 8;
        setTilt({ x: rotX, y: rotY });
        setGlare({ x: nx * 100, y: ny * 100 });
    }, [accentColor]);

    const handleMouseEnter = useCallback(() => setHovered(true), []);

    const handleMouseLeave = useCallback(() => {
        const spot = spotRef.current;
        if (spot) spot.style.opacity = '0';
        setHovered(false);
        setTilt({ x: 0, y: 0 });
    }, []);

    const spotGradient = accentColor
        ? `radial-gradient(circle, ${accentColor}1C 0%, transparent 65%)`
        : 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)';

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden group ${className}`}
            style={{
                transform: hovered
                    ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.015)`
                    : 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)',
                transition: 'transform 180ms cubic-bezier(.22,.9,.3,1), box-shadow 200ms ease',
                transformStyle: 'preserve-3d',
                boxShadow: hovered
                    ? `0 22px 70px rgba(0,0,0,0.55), 0 0 0 1px ${accentColor ? accentColor + '30' : 'rgba(255,255,255,0.10)'}`
                    : '0 10px 40px rgba(0,0,0,0.3)',
                willChange: hovered ? 'transform' : undefined,
            }}
        >
            {/* Cursor spotlight blob */}
            <div
                ref={spotRef}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full z-0"
                style={{
                    opacity: 0,
                    transition: 'opacity 200ms ease',
                    background: spotGradient,
                }}
            />

            {/* Inset border glow — follows cursor */}
            <div
                ref={borderRef}
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 z-0"
                style={{
                    transition: 'opacity 200ms ease',
                    boxShadow: `inset 0 0 0 1px ${accentColor ? accentColor + '45' : 'rgba(255,255,255,0.14)'}`,
                }}
            />

            {/* Glare sheen on hover */}
            {hovered && (
                <div
                    className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
                    style={{
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.045) 0%, transparent 55%)`,
                        transition: 'background 180ms ease',
                    }}
                />
            )}

            <div className="relative z-10">{children}</div>
        </div>
    );
}
