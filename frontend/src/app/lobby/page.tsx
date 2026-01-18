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
    const [gameMode, setGameMode] = React.useState<'INFILTRATOR' | 'SPY'>('INFILTRATOR');

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
        <div className="w-full flex flex-col gap-6">
            <div className="text-center">
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-bold mb-3">ROOM CODE</p>
                <div
                    className="text-5xl md:text-6xl font-black text-white font-mono bg-white/5 inline-block px-8 py-4 rounded-2xl border-2 border-dashed border-white/10 tracking-[0.15em] relative group cursor-pointer hover:border-indigo-500/50 transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
                    onClick={() => {
                        navigator.clipboard.writeText(room.id);
                        // could show toast
                    }}
                >
                    {room.id}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 rounded">Click to copy</span>
                </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl w-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Waiting for players
                    </h2>
                    <span className="bg-white/5 text-gray-300 font-mono font-bold px-3 py-1 rounded-full text-xs border border-white/10">
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
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3 block">Game Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setGameMode('INFILTRATOR')}
                                    className={`p-3 rounded-lg border transition-all ${gameMode === 'INFILTRATOR'
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-300'
                                        }`}
                                >
                                    <div className="font-bold text-sm mb-1">Infiltrator</div>
                                    <div className="text-[10px] opacity-70">1 Hidden Infiltrator vs Citizens</div>
                                </button>
                                <button
                                    onClick={() => setGameMode('SPY')}
                                    className={`p-3 rounded-lg border transition-all ${gameMode === 'SPY'
                                        ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/20'
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-300'
                                        }`}
                                >
                                    <div className="font-bold text-sm mb-1">Spy Mode</div>
                                    <div className="text-[10px] opacity-70">1 Spy (Similar Word) vs Agents</div>
                                </button>
                            </div>
                        </div>

                        <ShadowButton
                            className="w-full"
                            onClick={() => startGame(gameMode)}
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
