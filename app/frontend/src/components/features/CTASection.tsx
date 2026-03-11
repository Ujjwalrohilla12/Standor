import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface CTAButton {
  /** Button text */
  text: string;
  /** Button href/link */
  href: string;
  /** Aria label for accessibility */
  ariaLabel: string;
  /** Optional onClick handler */
  onClick?: () => void;
}

export interface CTASectionProps {
  /** Section heading */
  heading: string;
  /** Section description/supporting text */
  description: string;
  /** Primary CTA button (solid white bg, black text) */
  primaryCTA: CTAButton;
  /** Optional secondary CTA button (outline) */
  secondaryCTA?: CTAButton;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * CTASection Component
 * 
 * Call-to-action section with clear hierarchy between primary and secondary actions.
 * Follows FAANG-grade design standards with strong visual weight on primary CTA.
 * 
 * Button Specifications:
 * - Primary: Solid white background, black text, rounded-full, px-8 py-3.5
 * - Secondary: Outline border-white/10, white text, rounded-full, px-8 py-3.5
 * - Maximum 2 CTAs per section
 * - Primary CTA positioned before secondary
 * - All buttons include aria-label for accessibility
 * 
 * @example
 * ```tsx
 * <CTASection
 *   heading="Ready to transform your hiring?"
 *   description="Join thousands of companies using Standor to hire top engineering talent."
 *   primaryCTA={{
 *     text: "Get Started Free",
 *     href: "/register",
 *     ariaLabel: "Sign up for free account"
 *   }}
 *   secondaryCTA={{
 *     text: "Schedule Demo",
 *     href: "/demo",
 *     ariaLabel: "Schedule a product demo"
 *   }}
 * />
 * ```
 */
export function CTASection({
  heading,
  description,
  primaryCTA,
  secondaryCTA,
  className = '',
}: CTASectionProps) {
  return (
    <section className={`py-24 px-6 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
        >
          {heading}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA */}
          <a
            href={primaryCTA.href}
            onClick={primaryCTA.onClick}
            aria-label={primaryCTA.ariaLabel}
            className="
              inline-flex items-center gap-2
              px-8 py-3.5
              bg-white text-black
              rounded-full
              font-semibold text-base
              hover:bg-white/90
              hover:scale-105
              active:scale-95
              transition-all duration-[var(--motion-small)]
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
              group
            "
          >
            {primaryCTA.text}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-[var(--motion-small)]"
            />
          </a>

          {/* Secondary CTA (Optional) */}
          {secondaryCTA && (
            <a
              href={secondaryCTA.href}
              onClick={secondaryCTA.onClick}
              aria-label={secondaryCTA.ariaLabel}
              className="
                inline-flex items-center gap-2
                px-8 py-3.5
                bg-transparent text-white
                border border-white/10
                rounded-full
                font-medium text-base
                hover:bg-white/5
                hover:border-white/20
                transition-all duration-[var(--motion-small)]
                focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
              "
            >
              {secondaryCTA.text}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;
