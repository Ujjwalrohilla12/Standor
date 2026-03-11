import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ComparisonRow {
  /** Feature name/description */
  feature: string;
  /** Whether Standor has this feature */
  standor: boolean;
  /** Whether competitor 1 has this feature */
  competitor1: boolean;
  /** Whether competitor 2 has this feature */
  competitor2: boolean;
}

export interface ComparisonGridProps {
  /** Array of comparison rows */
  rows: ComparisonRow[];
  /** Column headers [Feature, Standor, Competitor1, Competitor2] */
  columns: string[];
  /** Optional className for additional styling */
  className?: string;
}

/**
 * ComparisonGrid Component
 * 
 * Card-based comparison grid displaying Standor features against competitors.
 * Responsive layout that stacks vertically on mobile and displays as a table on desktop.
 * 
 * Layout Specifications:
 * - Desktop: 3-column table layout
 * - Mobile: Stacked cards (vertical layout)
 * - Check icons: Circles with bg-white/10 background
 * - Accent color for Standor column
 * - Responsive breakpoint: 768px
 * 
 * @example
 * ```tsx
 * <ComparisonGrid
 *   columns={['Feature', 'Standor', 'Competitor A', 'Competitor B']}
 *   rows={comparisonData}
 * />
 * ```
 */
export function ComparisonGrid({ rows, columns, className = '' }: ComparisonGridProps) {
  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      {/* Desktop View - Table Layout */}
      <div className="hidden md:block">
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
            {columns.map((column, index) => (
              <div
                key={column}
                className={`text-sm font-semibold ${
                  index === 0 ? 'text-white' : 'text-center'
                } ${index === 1 ? 'text-[var(--accent)]' : 'text-white/80'}`}
              >
                {column}
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, rowIndex) => (
            <motion.div
              key={`row-${rowIndex}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: rowIndex * 0.05 }}
              className="grid grid-cols-4 gap-4 p-6 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <div className="text-sm text-white/90">{row.feature}</div>
              <div className="flex justify-center">
                <CheckIcon checked={row.standor} isStandor />
              </div>
              <div className="flex justify-center">
                <CheckIcon checked={row.competitor1} />
              </div>
              <div className="flex justify-center">
                <CheckIcon checked={row.competitor2} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile View - Stacked Cards */}
      <div className="md:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <motion.div
            key={`mobile-row-${rowIndex}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: rowIndex * 0.05 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
          >
            <h4 className="text-sm font-semibold text-white mb-4">{row.feature}</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--accent)]">{columns[1]}</span>
                <CheckIcon checked={row.standor} isStandor />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">{columns[2]}</span>
                <CheckIcon checked={row.competitor1} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">{columns[3]}</span>
                <CheckIcon checked={row.competitor2} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * CheckIcon Component
 * 
 * Displays a check or X icon in a circle with appropriate styling.
 */
function CheckIcon({ checked, isStandor = false }: { checked: boolean; isStandor?: boolean }) {
  const Icon = checked ? Check : X;
  const bgColor = checked
    ? isStandor
      ? 'bg-[var(--accent)]/10'
      : 'bg-white/10'
    : 'bg-white/5';
  const iconColor = checked
    ? isStandor
      ? 'text-[var(--accent)]'
      : 'text-white'
    : 'text-white/30';

  return (
    <div
      className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center transition-colors`}
    >
      <Icon size={16} className={iconColor} />
    </div>
  );
}

export default ComparisonGrid;
