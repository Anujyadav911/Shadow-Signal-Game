import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameTimerProps {
    timeLeft: number | null;
    phase: string;
}

export const GameTimer: React.FC<GameTimerProps> = ({ timeLeft, phase }) => {
    if (timeLeft === null) return null;

    const getColor = () => {
        if (timeLeft <= 5) return 'text-rose-500';
        if (timeLeft <= 10) return 'text-yellow-500';
        return 'text-white';
    };

    return (
        <div className="flex flex-col items-center justify-center py-4">
            <div className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
                {phase === 'SPEAKING' ? 'Time Remaining' : 'Time'}
            </div>
            <motion.div
                key={timeLeft}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-5xl font-black tabular-nums tracking-tight ${getColor()}`}
            >
                {timeLeft}
            </motion.div>
        </div>
    );
};
