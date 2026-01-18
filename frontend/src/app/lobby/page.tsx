'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShadowSocket } from '@/context/ShadowSocketContext';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { ShadowButton } from '@/components/ShadowButton';
import { motion } from 'framer-motion';

export default function LobbyPage() {
    const { room, player, startGame } = useShadowSocket();
    const router = useRouter();

    useEffect(() => {
        if (!room) {
            router.push('/');
        } else if (room.phase === 'SPEAKING' || room.phase === 'VOTING' || room.phase === 'ASSIGNMENT') {
            // Simple routing redirect if game started
            router.push('/game');
        }
    }, [room, router]);

    if (!room || !player) return null;

    return (
        <div className="w-full">
            <div className="mb-8 text-center">
                <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">ROOM CODE</p>
                <div className="text-5xl font-black text-white font-mono bg-white/5 inline-block px-6 py-2 rounded-xl border-2 border-dashed border-white/10 tracking-[0.2em] relative group cursor-pointer hover:border-indigo-500/50 transition-colors"
                    onClick={() => {
                        navigator.clipboard.writeText(room.id);
                        // could show toast
                    }}
                >
                    {room.id}
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Click to copy</span>
                </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        Waiting for players
                    </h2>
                    <span className="bg-indigo-600/20 text-indigo-300 font-bold px-3 py-1 rounded-full text-xs">
                        {room.players.length} / 12
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {room.players.map(p => (
                        <PlayerAvatar
                            key={p.id}
                            player={p}
                            isCurrentUser={p.id === player.id}
                        />
                    ))}

                    {/* Empty slots placeholders */}
                    {Array.from({ length: Math.max(0, 3 - room.players.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/5" />
                        </div>
                    ))}
                </div>

                {player.isHost ? (
                    <div className="space-y-3">
                        <ShadowButton
                            className="w-full"
                            onClick={startGame}
                            disabled={room.players.length < 3}
                        >
                            {room.players.length < 3 ? "Need 3 Players" : "Start Game"}
                        </ShadowButton>
                        {room.players.length < 3 && (
                            <p className="text-center text-xs text-gray-500">Invite friends using the room code above.</p>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                        <p className="text-indigo-300 font-medium animate-pulse">Waiting for host to start...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
