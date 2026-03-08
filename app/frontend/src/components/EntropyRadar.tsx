import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const SPOKES = 8;
const LABELS = ['TLS', 'Covert', 'DNS', 'HTTP', 'UDP', 'ICMP', 'TCP', 'GRE'];
const COLORS = ['#A855F7', '#FF453A', '#32D74B', '#FF9F0A', '#0A84FF', '#14B8A6', '#6366F1', '#F472B6'];

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function EntropyRadar() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView({ current: ref.current }, { once: false, margin: '-80px' });
  const [tick, setTick] = useState(0);
  const [anomalyIdx, setAnomalyIdx] = useState(1); // "Covert" spike

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      if (Math.random() < 0.04) setAnomalyIdx(Math.floor(Math.random() * SPOKES));
    }, 80);
    return () => clearInterval(id);
  }, []);

  const cx = 120, cy = 120, maxR = 90;
  const rings = [0.25, 0.5, 0.75, 1];

  // Dynamic values per spoke
  const values = LABELS.map((_, i) => {
    const base = i === anomalyIdx ? 0.88 : 0.25 + Math.random() * 0.3;
    const wave = Math.sin(tick * 0.1 + i * 0.8) * 0.08;
    return Math.max(0.1, Math.min(1, base + wave));
  });

  const points = values.map((v, i) => {
    const angle = (360 / SPOKES) * i;
    return polarToXY(angle, v * maxR, cx, cy);
  });
  const polyPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z';

  return (
    <div className="flex flex-col items-center gap-4">
      <svg ref={ref} viewBox="0 0 240 240" className="w-56 h-56">
        {/* Ring guides */}
        {rings.map(r => (
          <polygon
            key={r}
            points={LABELS.map((_, i) => {
              const angle = (360 / SPOKES) * i;
              const p = polarToXY(angle, r * maxR, cx, cy);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Spokes */}
        {LABELS.map((_, i) => {
          const angle = (360 / SPOKES) * i;
          const outer = polarToXY(angle, maxR, cx, cy);
          return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
        })}

        {/* Data polygon */}
        <motion.path
          d={polyPath}
          fill="rgba(168,85,247,0.12)"
          stroke="#A855F7"
          strokeWidth="1.5"
          animate={{ d: polyPath }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />

        {/* Data dots */}
        {points.map((p, i) => (
          <motion.circle key={i} cx={p.x} cy={p.y} r={i === anomalyIdx ? 5 : 3}
            fill={i === anomalyIdx ? '#FF453A' : COLORS[i]}
            animate={{ r: i === anomalyIdx ? [5, 7, 5] : 3 }}
            transition={{ duration: 0.6, repeat: i === anomalyIdx ? Infinity : 0 }}
          />
        ))}

        {/* Labels */}
        {LABELS.map((label, i) => {
          const angle = (360 / SPOKES) * i;
          const p = polarToXY(angle, maxR + 14, cx, cy);
          return (
            <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontFamily="monospace" fill={i === anomalyIdx ? '#FF453A' : 'rgba(255,255,255,0.35)'}>
              {label}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center gap-2 text-[9px] font-mono text-ns-grey-600">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span>ANOMALY DETECTED — HIGH ENTROPY COVERT CHANNEL</span>
      </div>
    </div>
  );
}
