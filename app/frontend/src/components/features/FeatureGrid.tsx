import { FeatureCard, FeatureCardProps } from './FeatureCard';

export interface FeatureGridProps {
  /** Array of feature card data (exactly 9 features) */
  features: FeatureCardProps[];
  /** Optional className for additional styling */
  className?: string;
}

/**
 * FeatureGrid Component
 * 
 * Responsive grid layout for displaying 9 feature cards with consistent
 * spacing and responsive behavior.
 * 
 * Layout Specifications:
 * - Grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
 * - Gap: gap-4 (16px)
 * - Max width: max-w-6xl
 * - Centered: mx-auto
 * - Renders exactly 9 FeatureCard instances
 * 
 * @example
 * ```tsx
 * <FeatureGrid features={featuresData} />
 * ```
 */
export function FeatureGrid({ features, className = '' }: FeatureGridProps) {
  // Validate that exactly 9 features are provided
  if (features.length !== 9) {
    console.warn(
      `FeatureGrid expects exactly 9 features, but received ${features.length}. Displaying all provided features.`
    );
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <FeatureCard
            key={`feature-${index}-${feature.title}`}
            {...feature}
          />
        ))}
      </div>
    </div>
  );
}

export default FeatureGrid;
