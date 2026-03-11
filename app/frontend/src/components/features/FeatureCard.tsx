import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Feature title (text-lg font-semibold) */
  title: string;
  /** Feature description (12-18 words, max 2 lines, text-sm) */
  description: string;
  /** Accent color for icon ring and hover effects */
  accentColor?: string;
  /** Optional "Learn more" link href */
  learnMoreHref?: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * FeatureCard Component
 * 
 * Uniform card component for displaying product features with consistent
 * styling, padding, and hover effects. Follows FAANG-grade design standards.
 * 
 * Design Specifications:
 * - Padding: p-6 (mobile), p-8 (desktop)
 * - Border radius: rounded-2xl
 * - Background: rgba(255,255,255,0.02)
 * - Border: 1px solid rgba(255,255,255,0.06)
 * - Icon container: 48×48px with subtle accent ring on hover
 * - Title: text-lg font-semibold
 * - Description: text-sm, 12-18 words, max 2 lines
 * 
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={Code2}
 *   title="Real-time Collaboration"
 *   description="Write code together with seamless real-time synchronization and cursor tracking."
 *   accentColor="#0EA5A4"
 *   learnMoreHref="/features/collaboration"
 * />
 * ```
 */
export function FeatureCard({
  icon: IconComponent,
  title,
  description,
  accentColor = 'var(--accent)',
  learnMoreHref,
  className = '',
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
      className={`
        group
        p-6 md:p-8
        rounded-2xl
        bg-[rgba(255,255,255,0.02)]
        border border-[rgba(255,255,255,0.06)]
        hover:bg-[rgba(255,255,255,0.04)]
        hover:border-[rgba(255,255,255,0.12)]
        transition-all duration-[var(--motion-small)]
        ${className}
      `}
    >
      {/* Icon Container - 48×48px with accent ring on hover */}
      <div
        className="
          w-12 h-12
          mb-6
          rounded-xl
          bg-white/5
          border border-white/10
          flex items-center justify-center
          group-hover:border-[var(--accent)]/20
          group-hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]
          transition-all duration-[var(--motion-small)]
        "
        style={{
          ['--accent' as string]: accentColor,
        }}
      >
        <IconComponent
          size={24}
          className="text-white group-hover:text-[var(--accent)] transition-colors duration-[var(--motion-small)]"
          style={{
            ['--accent' as string]: accentColor,
          }}
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-3 leading-snug">
        {title}
      </h3>

      {/* Description - 12-18 words, max 2 lines */}
      <p className="text-sm text-[#A1AAB2] leading-relaxed mb-4 line-clamp-2">
        {description}
      </p>

      {/* Learn More Link */}
      {learnMoreHref && (
        <a
          href={learnMoreHref}
          className="
            inline-flex items-center gap-2
            text-sm font-medium
            text-white/60
            hover:text-[var(--accent)]
            transition-colors duration-[var(--motion-small)]
            group/link
          "
          style={{
            ['--accent' as string]: accentColor,
          }}
          aria-label={`Learn more about ${title}`}
        >
          Learn more
          <ArrowRight
            size={14}
            className="group-hover/link:translate-x-1 transition-transform duration-[var(--motion-small)]"
          />
        </a>
      )}
    </motion.div>
  );
}

export default FeatureCard;
