import { useState, createContext, useContext, useCallback } from 'react';

/* ────────────────────────────────────────────
   FocusCards — Elite Focus Behavior
   When one card is hovered, siblings dim.
   Hovered card: full opacity, elevated.
   Others: 0.65 opacity, scale 0.98.
   220ms transition. No spring. No bounce.
   ──────────────────────────────────────────── */

interface FocusContextValue {
    hoveredIndex: number | null;
    setHoveredIndex: (i: number | null) => void;
    totalItems: number;
}

const FocusContext = createContext<FocusContextValue>({
    hoveredIndex: null,
    setHoveredIndex: () => { },
    totalItems: 0,
});

/* ── Container ────────────────────────────── */

interface FocusCardsProps {
    children: React.ReactNode;
    className?: string;
}

function FocusCardsRoot({ children, className = '' }: FocusCardsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Count child items for context
    const totalItems = Array.isArray(children) ? children.length : 1;

    return (
        <FocusContext.Provider value={{ hoveredIndex, setHoveredIndex, totalItems }}>
            <div
                className={className}
                onMouseLeave={() => setHoveredIndex(null)}
            >
                {children}
            </div>
        </FocusContext.Provider>
    );
}

/* ── Item ─────────────────────────────────── */

interface FocusItemProps {
    children: React.ReactNode;
    index: number;
    className?: string;
}

function FocusItem({ children, index, className = '' }: FocusItemProps) {
    const { hoveredIndex, setHoveredIndex } = useContext(FocusContext);

    const isAnyHovered = hoveredIndex !== null;
    const isThisHovered = hoveredIndex === index;
    const isDimmed = isAnyHovered && !isThisHovered;

    const handleMouseEnter = useCallback(() => {
        setHoveredIndex(index);
    }, [index, setHoveredIndex]);

    return (
        <div
            className={className}
            onMouseEnter={handleMouseEnter}
            style={{
                opacity: isDimmed ? 0.65 : 1,
                transform: isDimmed ? 'scale(0.98)' : 'scale(1)',
                transition: [
                    'opacity 220ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                    'transform 220ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                    'box-shadow 280ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                ].join(', '),
                boxShadow: isThisHovered
                    ? '0 18px 60px rgba(0,0,0,0.5)'
                    : '0 10px 40px rgba(0,0,0,0.35)',
            }}
        >
            {children}
        </div>
    );
}

/* ── Compound export ──────────────────────── */

const FocusCards = Object.assign(FocusCardsRoot, { Item: FocusItem });
export default FocusCards;
