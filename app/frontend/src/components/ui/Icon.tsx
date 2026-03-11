import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

export interface IconProps {
  /** The Lucide icon component to render */
  icon: LucideIcon;
  /** Size of the icon in pixels (default: 24) */
  size?: number;
  /** Color of the icon (default: white) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Color to apply on hover (default: accent color) */
  hoverColor?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

/**
 * Icon Component
 * 
 * Centralized wrapper for Lucide React icons that enforces consistent
 * sizing, coloring, and hover behavior across the application.
 * 
 * Features:
 * - Default monochrome white rendering
 * - Accent color on hover
 * - Consistent sizing
 * - Type-safe icon prop
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <Icon icon={Code2} size={48} />
 * <Icon icon={Brain} size={24} hoverColor="#0EA5A4" />
 * ```
 */
export function Icon({
  icon: IconComponent,
  size = 24,
  color = 'currentColor',
  className = '',
  hoverColor,
  ariaLabel,
}: IconProps) {
  const [isHovered, setIsHovered] = useState(false);

  const iconColor = isHovered && hoverColor ? hoverColor : color;

  return (
    <IconComponent
      size={size}
      color={iconColor}
      className={`transition-colors duration-[var(--motion-small)] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
}

export default Icon;
