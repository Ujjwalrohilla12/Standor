import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/* ────────────────────────────────────────────────────────
   PageTransition — Framer Motion AnimatePresence
   Smooth, glitch-free route transitions across the entire
   site. Uses mode="wait" so the outgoing page exits
   completely before the incoming page appears.

   Feel:
     • Enter — 450ms spring-like ease, fade + slide up 12px
     • Exit  — 200ms fast ease-in,   fade + slide up -8px

   Reduced-motion: Framer Motion automatically respects the
   OS prefers-reduced-motion setting.
   ──────────────────────────────────────────────────────── */

interface Props {
    children: React.ReactNode;
}

export default function PageTransition({ children }: Props) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.6,
                        ease: [0.22, 0.9, 0.3, 1],
                    },
                }}
                exit={{
                    opacity: 0,
                    y: -6,
                    transition: {
                        duration: 0.2,
                        ease: [0.22, 0.9, 0.3, 1],
                    },
                }}
                style={{ minHeight: '100vh' }}
                onAnimationStart={() => {
                    // Snap scroll to top as the new page begins animating in
                    window.scrollTo(0, 0);
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
