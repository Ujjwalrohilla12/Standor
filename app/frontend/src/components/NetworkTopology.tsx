import { useRef, useEffect, useState, useCallback } from 'react';

/* ────────────────────────────────────────────
   Network Topology Graph
   Canvas-based animated network graph.
   Nodes + edges light up based on scroll or external highlights.
   Interactive packet flow and edge direction hints.
   ──────────────────────────────────────────── */

type Node = {
  x: number; y: number;
  label: string;
  color: string;
  baseX: number; baseY: number;
  active: boolean;
  activateAt: number;
};

type Edge = {
  from: number; to: number;
  active: boolean;
  activateAt: number;
  pulsePhase: number;
};

const NODE_R = 9;
const GLOW_R = 18;

interface NetworkTopologyProps {
  className?: string;
  highlightedNodes?: string[];
}

export default function NetworkTopology({ className, highlightedNodes = [] }: NetworkTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const scrollProg = useRef(0);
  const raf = useRef(0);

  const nodesRef = useRef<Node[]>([
    { x: 0.15, y: 0.18, label: 'Agent', color: '#0A84FF', baseX: 0.15, baseY: 0.18, active: false, activateAt: 0.1 },
    { x: 0.35, y: 0.12, label: 'Firewall', color: '#FF9F0A', baseX: 0.35, baseY: 0.12, active: false, activateAt: 0.2 },
    { x: 0.52, y: 0.32, label: 'Router', color: '#32D74B', baseX: 0.52, baseY: 0.32, active: false, activateAt: 0.3 },
    { x: 0.72, y: 0.18, label: 'Parser', color: '#0A84FF', baseX: 0.72, baseY: 0.18, active: false, activateAt: 0.35 },
    { x: 0.88, y: 0.38, label: 'DPI', color: '#A855F7', baseX: 0.88, baseY: 0.38, active: false, activateAt: 0.45 }, // Brighter purple
    { x: 0.28, y: 0.55, label: 'Collector', color: '#14B8A6', baseX: 0.28, baseY: 0.55, active: false, activateAt: 0.25 },
    { x: 0.55, y: 0.65, label: 'Indexer', color: '#06B6D4', baseX: 0.55, baseY: 0.65, active: false, activateAt: 0.5 },
    { x: 0.78, y: 0.72, label: 'Store', color: '#3B82F6', baseX: 0.78, baseY: 0.72, active: false, activateAt: 0.55 },
    { x: 0.18, y: 0.82, label: 'Client A', color: '#0A84FF', baseX: 0.18, baseY: 0.82, active: false, activateAt: 0.6 },
    { x: 0.62, y: 0.88, label: 'Client B', color: '#0A84FF', baseX: 0.62, baseY: 0.88, active: false, activateAt: 0.65 },
  ]);

  const edgesRef = useRef<Edge[]>([
    { from: 0, to: 1, active: false, activateAt: 0.15, pulsePhase: 0 },
    { from: 1, to: 2, active: false, activateAt: 0.25, pulsePhase: 0.5 },
    { from: 2, to: 3, active: false, activateAt: 0.32, pulsePhase: 1.0 },
    { from: 3, to: 4, active: false, activateAt: 0.4, pulsePhase: 1.5 },
    { from: 0, to: 5, active: false, activateAt: 0.2, pulsePhase: 0.3 },
    { from: 5, to: 6, active: false, activateAt: 0.35, pulsePhase: 0.8 },
    { from: 6, to: 7, active: false, activateAt: 0.5, pulsePhase: 1.2 },
    { from: 5, to: 2, active: false, activateAt: 0.28, pulsePhase: 0.6 },
    { from: 7, to: 4, active: false, activateAt: 0.52, pulsePhase: 1.4 },
    { from: 8, to: 5, active: false, activateAt: 0.55, pulsePhase: 1.6 },
    { from: 9, to: 6, active: false, activateAt: 0.58, pulsePhase: 1.8 },
    { from: 9, to: 7, active: false, activateAt: 0.6, pulsePhase: 2.0 },
  ]);

  // Scroll progress
  useEffect(() => {
    const handler = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      scrollProg.current = Math.max(0, Math.min(1, 1 - rect.top / vh));
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let t = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      const prog = scrollProg.current;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      nodes.forEach(n => {
        n.active = prog >= n.activateAt || highlightedNodes.includes(n.label);
      });
      edges.forEach((e, idx) => {
        const fromActive = nodes[e.from].active;
        const toActive = nodes[e.to].active;
        e.active = (prog >= e.activateAt) || (fromActive && toActive);
      });

      // Magnetic pull
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      nodes.forEach(n => {
        const dx = mx - n.baseX, dy = my - n.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pull = mx !== -1 ? Math.max(0, 1 - dist / 0.3) * 0.015 : 0;
        n.x += (n.baseX + dx * pull - n.x) * 0.08;
        n.y += (n.baseY + dy * pull - n.y) * 0.08;
      });

      // Edges
      edges.forEach(e => {
        const a = nodes[e.from], b = nodes[e.to];
        const ax = a.x * w, ay = a.y * h, bx = b.x * w, by = b.y * h;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);

        if (e.active) {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)'; // Increased contrast
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.1)'; // Increased contrast
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();

        // Edge direction hints: Tiny moving dots
        const dotCount = 2;
        for (let i = 0; i < dotCount; i++) {
          const dotPt = (t * 0.2 + i / dotCount) % 1;
          const dotX = ax + (bx - ax) * dotPt;
          const dotY = ay + (by - ay) * dotPt;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
          ctx.fillStyle = e.active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';
          ctx.fill();
        }

        // Packet Flow Pulses
        if (e.active) {
          const pt = ((t * 0.5 + e.pulsePhase) % 1);
          const px = ax + (bx - ax) * pt;
          const py = ay + (by - ay) * pt;

          const g = ctx.createRadialGradient(px, py, 0, px, py, 10);
          g.addColorStop(0, 'rgba(255,255,255,0.8)');
          g.addColorStop(0.3, 'rgba(10,132,255,0.4)');
          g.addColorStop(1, 'rgba(10,132,255,0)');

          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      });

      // Nodes
      nodes.forEach((n, idx) => {
        const nx = n.x * w, ny = n.y * h;
        const isHighlighted = highlightedNodes.includes(n.label);
        const isDPI = n.label === 'DPI';

        // Scale factors
        let scale = n.active ? 1.0 : 0.8;
        if (isHighlighted) scale *= 1.25;
        if (isDPI && n.active) scale *= (1 + Math.sin(t * 3) * 0.05); // Stronger pulse for DPI

        const breathe = n.active ? 1 + Math.sin(t * 1.5 + idx * 0.7) * 0.03 : 1;
        const r = NODE_R * scale * breathe;

        // Glow
        if (n.active) {
          const glowR = isHighlighted ? GLOW_R * 1.8 : GLOW_R;
          const g = ctx.createRadialGradient(nx, ny, r, nx, ny, glowR * 2.5);
          g.addColorStop(0, n.color + (isHighlighted ? '60' : '30'));
          g.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(nx, ny, glowR * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();

          // Soft pulsing glow for all active nodes
          ctx.shadowBlur = isHighlighted ? 25 : 15;
          ctx.shadowColor = n.color;
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = n.active ? n.color : 'rgba(255,255,255,0.08)';
        ctx.fill();

        ctx.shadowBlur = 0; // Reset shadow

        // Label
        if (n.active) {
          ctx.font = isHighlighted ? 'bold 11px Inter, sans-serif' : '9px Inter, sans-serif';
          ctx.fillStyle = isHighlighted ? '#fff' : 'rgba(255,255,255,0.55)';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, nx, ny + r + 20);
        }
      });

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, [highlightedNodes]);

  return (
    <div ref={containerRef} className={className} onMouseMove={handleMouse}
      onMouseLeave={() => { mouseRef.current = { x: -1, y: -1 }; }}
      style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
