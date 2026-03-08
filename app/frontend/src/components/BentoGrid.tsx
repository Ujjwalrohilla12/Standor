import React from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const BentoGrid = ({ children, className = "" }: BentoGridProps) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
            {children}
        </div>
    );
};

export const BentoCard = ({ children, className = "", delay = 0 }: BentoCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.5,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={`ns-glass rounded-[2rem] border border-white/[0.05] p-8 hover:border-white/[0.12] transition-colors group relative overflow-hidden flex flex-col ${className}`}
        >
            {children}
        </motion.div>
    );
};
