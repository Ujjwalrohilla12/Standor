import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Github, Code2, Brain, Terminal, Layers, Play, Check } from 'lucide-react';

const CODE_LINES = [
    { code: 'function twoSum(nums: number[], target: number) {', key: 0 },
    { code: '  const map = new Map<number, number>();', key: 1, hl: true },
    { code: '  for (let i = 0; i < nums.length; i++) {', key: 2 },
    { code: '    const comp = target - nums[i];', key: 3 },
    { code: '    if (map.has(comp)) {', key: 4 },
    { code: '      return [map.get(comp)!, i];', key: 5, hl: true },
    { code: '    }', key: 6 },
    { code: '    map.set(nums[i], i);', key: 7 },
    { code: '  }', key: 8 },
    { code: '}', key: 9 },
];

export default function Landing() {
    const [visibleLines, setVisibleLines] = useState(0);
    const demoRef = useRef<HTMLDivElement>(null);
    const demoInView = useInView(demoRef, { once: true });

    useEffect(() => {
        if (!demoInView) return;
        let i = 0;
        const t = setInterval(() => { i++; setVisibleLines(i); if (i >= CODE_LINES.length) clearInterval(t); }, 110);
        return () => clearInterval(t);
    }, [demoInView]);

    return (
        <main className="w-full">
        </main>
    );
}
