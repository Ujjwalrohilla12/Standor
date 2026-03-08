import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeUpProps {
    children: React.ReactNode;
    delay?: number;          // seconds
    duration?: number;       // seconds
    distance?: number;       // px — how far it slides up from
    className?: string;
    once?: boolean;          // default true (one-shot)
}

/**
 * FadeUp — wraps any content with a scroll-triggered fade+slide up.
 * Uses Framer Motion useInView for reliable, performant detection.
 *
 * Usage:
 *   <FadeUp delay={0.1}>
 *     <YourComponent />
 *   </FadeUp>
 */
export default function FadeUp({
    children,
    delay = 0,
    duration = 0.6,
    distance = 12,
    className,
    once = true,
}: FadeUpProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once, margin: '-60px 0px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: distance }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
            transition={{
                duration,
                delay,
                ease: [0.22, 0.9, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
