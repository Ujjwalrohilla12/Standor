import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal — returns a ref and a boolean `visible`.
 * When the element enters the viewport (threshold 0.12 by default),
 * visible flips to true and stays true (one-shot).
 */
export function useScrollReveal(threshold = 0.12) {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // If user prefers reduced motion, reveal immediately
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setVisible(true);
            return;
        }

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect(); // one-shot
                }
            },
            { threshold }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return { ref, visible };
}
