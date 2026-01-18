import React from 'react';
import { Player } from '../types/shadow_types';
import { motion } from 'framer-motion';

interface PlayerAvatarProps {
    player: Player;
    isCurrentUser?: boolean;
    showRole?: boolean;
    isSpeaking?: boolean;
    isEliminated?: boolean;
    onClick?: () => void;
    selectable?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
    player,
    isCurrentUser,
    showRole,
    isSpeaking,
    isEliminated,
    onClick,
    selectable
}) => {

    const getRoleColor = (role?: string) => {
        if (!role) return 'bg-gray-600';
        return role === 'INFILTRATOR' ? 'bg-rose-600' : 'bg-blue-600';
    };

    return (
        <motion.div
            className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${selectable ? 'cursor-pointer hover:bg-white/5 ring-2 ring-transparent hover:ring-indigo-500/50' : ''} ${isSpeaking ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''} ${player.hasVoted ? 'opacity-75' : ''}`}
            onClick={onClick}
            whileHover={selectable ? { scale: 1.05 } : {}}
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${isEliminated ? 'bg-gray-800 grayscale opacity-50' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} border-4 ${isSpeaking ? 'border-yellow-400' : 'border-gray-900'}`}>
                {player.username.substring(0, 2).toUpperCase()}
            </div>

            {/* Badges */}
            {player.isHost && (
                <span className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">HOST</span>
            )}

            {showRole && player.role && (
                <div className={`absolute -top-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm border border-white/10 ${getRoleColor(player.role)}`}>
                    {player.role}
                </div>
            )}

            {isEliminated && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black text-xs px-2 py-1 rotate-[-15deg] border-2 border-white shadow-lg z-10">
                    OUT
                </div>
            )}

            {player.votesReceived > 0 && (
                <div className="absolute bottom-12 right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-900">
                    {player.votesReceived}
                </div>
            )}

            <span className="mt-2 text-sm font-medium text-gray-200 truncate max-w-[80px] text-center">
                {player.username} {isCurrentUser && '(You)'}
            </span>

            {isSpeaking && (
                <motion.div
                    layoutId="speaking-indicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </motion.div>
    );
};
