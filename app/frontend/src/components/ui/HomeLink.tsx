import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "../../lib/utils";

interface HomeLinkProps {
    className?: string;
}

export const HomeLink: React.FC<HomeLinkProps> = ({ className }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === '/';

    return (
        <button
            onClick={() => navigate('/')}
            className={cn(
                "text-xs font-bold tracking-widest uppercase transition-colors",
                isActive ? "text-white" : "text-ns-grey-400 hover:text-white",
                className
            )}
            aria-label="Go to Home"
        >
            Home
        </button>
    );
};
