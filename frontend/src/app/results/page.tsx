'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShadowSocket } from '@/context/ShadowSocketContext';
import { ShadowButton } from '@/components/ShadowButton';
import { motion } from 'framer-motion';

export default function ResultsPage() {
    const { room, player } = useShadowSocket();
    const router = useRouter();

    useEffect(() => {
        if (!room || room.phase !== 'GAME_OVER') {
            // If refreshed, or navigated manually, redirect
            if (!room) router.push('/');
        }
    }, [room, router]);

    if (!room || !player) return null;

    const isWin = (room.winner === 'CITIZEN' && player.role === 'CITIZEN') ||
        (room.winner === 'INFILTRATOR' && player.role === 'INFILTRATOR');

    return (
        <div className="flex flex-col items-center w-full min-h-[50vh] justify-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center mb-12"
            >
                <p className="text-gray-400 font-bold tracking-widest uppercase mb-4">GAME OVER</p>
                <h1 className={`text-6xl font-black mb-2 ${isWin ? 'text-green-500' : 'text-rose-500'}`}>
                    {isWin ? 'VICTORY' : 'DEFEAT'}
                </h1>
                <p className="text-xl text-white font-medium">
                    {room.winner}S WIN
                </p>
            </motion.div>

            <div className="w-full bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl mb-8">
                <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">Role Reveal</h3>
                <div className="space-y-3">
                    {room.players.map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                            <span className={`font-medium ${p.id === player.id ? 'text-white' : 'text-gray-400'}`}>
                                {p.username} {p.id === player.id && '(You)'}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${p.role === 'INFILTRATOR' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                {p.role}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <ShadowButton onClick={() => window.location.href = '/'}>
                Return to Menu
            </ShadowButton>
        </div>
    );
}
