import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ParallaxGrid() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // 3 layers at different speeds
    const gridY = useTransform(scrollY, [0, 1000], [0, -80]);     // 0.08x
    const dotsY = useTransform(scrollY, [0, 1000], [0, -160]);    // 0.16x

    const dots = Array.from({ length: 22 }).map((_, i) => ({
        x: `${5 + (i * 83) % 90}%`,
        y: `${5 + (i * 57) % 90}%`,
        dur: 3.5 + (i % 4) * 0.8,
        delay: i * 0.28,
        size: i % 3 === 0 ? 2 : 1.5,
        color: i % 5 === 0 ? 'rgba(200,200,220,0.35)' : i % 3 === 0 ? 'rgba(216,216,232,0.45)' : 'rgba(255,255,255,0.18)',
    }));

    return (
        <div ref={ref} className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* Layer 1: Grid — slower parallax */}
            <motion.div
                style={{ y: gridY }}
                className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
            />

            {/* Layer 2: Floating packet dots — faster parallax */}
            <motion.div style={{ y: dotsY }} className="absolute inset-0">
                {dots.map((d, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: d.x,
                            top: d.y,
                            width: d.size,
                            height: d.size,
                            backgroundColor: d.color,
                        }}
                        animate={{ y: [-10, 10, -10], opacity: [0.15, 0.6, 0.15] }}
                        transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </motion.div>

            {/* Layer 3: Radial cinematic glows — static depth */}
            <div
                className="absolute top-0 left-[20%] w-[700px] h-[500px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(216,216,232,0.07) 0%, transparent 65%)' }}
            />
            <div
                className="absolute top-[35%] right-[5%] w-[550px] h-[550px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(200,200,220,0.05) 0%, transparent 65%)' }}
            />
            <div
                className="absolute bottom-[15%] left-[5%] w-[450px] h-[450px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(216,216,232,0.04) 0%, transparent 65%)' }}
            />
        </div>
    );
}
