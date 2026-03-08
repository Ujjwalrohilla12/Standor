import { useState, useCallback, useRef, useEffect } from 'react';

export default function GridBackground({ interactive = false }) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, [interactive]);

  // Smooth lerp animation loop for interactive mode
  useEffect(() => {
    if (!interactive) return;
    const animate = () => {
      const lerp = 0.06;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp;
      setMouse({ x: currentRef.current.x, y: currentRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [interactive]);

  // Derive transforms from mouse position
  const offsetX = (mouse.x - 0.5) * 30;
  const offsetY = (mouse.y - 0.5) * 20;
  const rotY = (mouse.x - 0.5) * 4;
  const rotX = 55 + (mouse.y - 0.5) * 6;
  const floatARotY = -15 + (mouse.x - 0.5) * 8;
  const floatARotX = 10 + (mouse.y - 0.5) * 6;
  const floatBRotY = 20 - (mouse.x - 0.5) * 8;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      onMouseMove={interactive ? handleMouseMove : undefined}
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      aria-hidden="true"
    >
      {/* Main perspective grid floor */}
      <div className="absolute inset-0" style={{
        perspective: '600px',
        perspectiveOrigin: `${50 + (mouse.x - 0.5) * 10}% ${40 + (mouse.y - 0.5) * 8}%`,
      }}>
        <div className="absolute w-[200%] h-[200%] -left-[50%] -top-[20%]" style={{
          transform: interactive
            ? `rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${offsetX}px, ${offsetY}px)`
            : 'rotateX(55deg)',
          transformOrigin: 'center center',
          transition: interactive ? 'none' : undefined,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: interactive ? 'none' : 'gridDrift 25s linear infinite',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)',
        }} />
      </div>

      {/* Floating grid plane A */}
      <div className="absolute top-[10%] right-[8%] w-[200px] h-[200px] opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        transform: interactive
          ? `perspective(400px) rotateY(${floatARotY}deg) rotateX(${floatARotX}deg)`
          : 'perspective(400px) rotateY(-15deg) rotateX(10deg)',
        transition: interactive ? 'none' : undefined,
        animation: interactive ? 'none' : 'floatA 12s ease-in-out infinite',
      }} />

      {/* Floating grid plane B */}
      <div className="absolute bottom-[15%] left-[5%] w-[160px] h-[160px] opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        transform: interactive
          ? `perspective(300px) rotateY(${floatBRotY}deg) rotateX(${-5 + (mouse.y - 0.5) * 5}deg)`
          : 'perspective(300px) rotateY(20deg) rotateX(-5deg)',
        transition: interactive ? 'none' : undefined,
        animation: interactive ? 'none' : 'floatB 15s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes gridDrift {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        @keyframes floatA {
          0%, 100% { transform: perspective(400px) rotateY(-15deg) rotateX(10deg) translateY(0); }
          50% { transform: perspective(400px) rotateY(-12deg) rotateX(14deg) translateY(-12px); }
        }
        @keyframes floatB {
          0%, 100% { transform: perspective(300px) rotateY(20deg) rotateX(-5deg) translateY(0); }
          50% { transform: perspective(300px) rotateY(16deg) rotateX(-2deg) translateY(10px); }
        }
      `}</style>
    </div>
  );
}
