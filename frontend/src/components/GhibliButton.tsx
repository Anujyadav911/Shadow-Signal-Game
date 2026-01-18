import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GhibliButtonProps extends HTMLMotionProps<"button"> {
    variant: 'create' | 'join';
    children: React.ReactNode;
}

export const GhibliButton: React.FC<GhibliButtonProps> = ({
    variant,
    children,
    className = '',
    ...props
}) => {
    const isCreate = variant === 'create';

    // Create: Teal/Green glow
    // Join: Warm Red/Orange glow
    const baseColor = isCreate
        ? 'bg-teal-500/20 hover:bg-teal-400/30 border-teal-400/50 text-teal-100 shadow-[0_0_15px_rgba(45,212,191,0.3)]'
        : 'bg-orange-600/20 hover:bg-orange-500/30 border-orange-400/50 text-orange-100 shadow-[0_0_15px_rgba(251,146,60,0.3)]';

    const hoverGlow = isCreate
        ? 'hover:shadow-[0_0_25px_rgba(45,212,191,0.6)]'
        : 'hover:shadow-[0_0_25px_rgba(251,146,60,0.6)]';

    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
            className={`
                relative px-12 py-4 rounded-xl backdrop-blur-md border 
                font-cinzel text-xl font-bold tracking-widest uppercase
                transition-all duration-300 ease-out
                ${baseColor}
                ${hoverGlow}
                ${className}
            `}
            {...props}
        >
            {/* Inner sheen effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
            </div>

            <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-md">
                {children}
            </span>
        </motion.button>
    );
};
