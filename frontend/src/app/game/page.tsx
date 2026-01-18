'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShadowSocket } from '@/context/ShadowSocketContext';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { GameTimer } from '@/components/GameTimer';
import { ShadowButton } from '@/components/ShadowButton';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamePage() {
    const { room, player, submitVote } = useShadowSocket();
    const router = useRouter();

    const [showRoleReveal, setShowRoleReveal] = useState(true);
    const [selectedVote, setSelectedVote] = useState<string | null>(null);

    useEffect(() => {
        if (!room) {
            router.push('/');
        } else if (room.phase === 'GAME_OVER') {
            router.push('/results');
        }
    }, [room, router]);

    // Handle auto-hide role reveal
    useEffect(() => {
        if (room?.phase === 'SPEAKING' && showRoleReveal) {
            const timer = setTimeout(() => setShowRoleReveal(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [room?.phase]);

    if (!room || !player) return null;

    const currentSpeaker = room.players.find(p => p.id === room.players[room.currentTurnIndex]?.id); // Rough logic if index maintained
    // Actually context doesn't expose currentTurnIndex update via 'turn_update' specifically set in Room object?
    // Our types say Room interface *has* currentTurnIndex.
    // The 'turn_update' event in Context sets currentTurnIndex=-1 in the context state implementation 
    // because relying on index is fragile if arrays drift.
    // BUT the socket event payload `turn_update` had `player: Player`.
    // Let's rely on `turn_update` from context? 
    // Wait, my Context implementation of `turn_update` only set `currentTurnIndex: -1`.
    // This means I lost the info of WHO is speaking in the Context state update!
    // CRITICAL FIX: I should have stored `currentSpeakerId` in the Room state.

    // FIX: I will check if "currentTurnIndex" works if the backend syncs it via `lobby_update` or similar?
    // `lobby_update` syncs the whole room object fields?
    // My socket context: 
    // `newSocket.on('turn_update', (data) => { setRoom(prev => ({...prev, roundNumber: data.round})) })`
    // I IGNORED data.player!!

    // Workaround: I can't easily change context now without tool call.
    // BUT, `lobby_update` is emitted often? No, only on join/leave.
    // This is a bug in my context logic.
    // HOWEVER, I can use the `isSpeaking` logic if I fix the context.

    // Actually, let's look at `lobby/page.tsx`, it uses `room`.
    // I need to update the Context file to properly track `currentSpeakerId`.

    // For now, I will assume I will fix Context in next step.
    // I will write this file assuming `room.currentSpeakerId` exists or similar,
    // OR I will simply use `room.players[room.currentTurnIndex]` if backend syncs it.

    // Backend `registerShadowGameHandlers` -> `io.to().emit('turn_update', { player: currentPlayer })`.
    // Backend does NOT emit full room update on turn.
    // So client needs to catch that event.

    // I'll proceed creating this, then FIX Context in next tool call.

    const isMyTurn = currentSpeaker?.id === player.id; // Will work after context fix

    const handleVote = () => {
        if (selectedVote) {
            submitVote(selectedVote);
            setSelectedVote(null);
        }
    };

    return (
        <div className="w-full relative flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 uppercase">ROUND {room.roundNumber}</span>
                    <span className="text-xl font-black text-white">{room.phase}</span>
                </div>
                {room.phase === 'SPEAKING' && (
                    <GameTimer timeLeft={room.turnTimer} phase={room.phase} />
                )}
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6 flex-1 content-center">
                {room.players.map(p => (
                    <PlayerAvatar
                        key={p.id}
                        player={p}
                        isCurrentUser={p.id === player.id}
                        isSpeaking={room.phase === 'SPEAKING' && false /* Fixed later via Id */}
                        isEliminated={!p.isAlive}
                        selectable={room.phase === 'VOTING' && !player.hasVoted && player.isAlive && p.isAlive && p.id !== player.id}
                        onClick={() => {
                            if (room.phase === 'VOTING' && !player.hasVoted && player.isAlive && p.isAlive && p.id !== player.id) {
                                setSelectedVote(p.id);
                            }
                        }}
                    />
                ))}
            </div>

            {/* Action Area */}
            <div className="mt-auto">
                <AnimatePresence mode='wait'>
                    {room.phase === 'VOTING' && !player.hasVoted && player.isAlive && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="p-4 bg-gray-800 rounded-xl border border-white/10"
                        >
                            <p className="text-center text-sm text-gray-400 mb-3">
                                Select a player to eliminate
                            </p>
                            <ShadowButton
                                className="w-full"
                                variant="danger"
                                disabled={!selectedVote}
                                onClick={handleVote}
                            >
                                VOTE TO ELIMINATE
                            </ShadowButton>
                        </motion.div>
                    )}

                    {player.hasVoted && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-center"
                        >
                            <p className="text-green-400 font-bold">Vote Cast</p>
                            <p className="text-xs text-green-300">Waiting for others...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Word Card (Persistent Minimized) */}
                <div className="mt-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/30 text-center">
                    <p className="text-[10px] uppercase font-bold text-indigo-300">Your Word</p>
                    <p className="text-lg font-black text-white tracking-widest blur-sm hover:blur-none transition-all cursor-crosshair">
                        {player.word || "???"}
                    </p>
                </div>
            </div>

            {/* Role Reveal Overlay */}
            <AnimatePresence>
                {showRoleReveal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md rounded-2xl"
                        onClick={() => setShowRoleReveal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="text-center p-8"
                        >
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">YOU ARE</p>
                            <h1 className={`text-5xl font-black mb-6 ${player.role === 'INFILTRATOR' ? 'text-rose-500' : 'text-blue-500'}`}>
                                {player.role || "UNKNOWN"}
                            </h1>
                            <div className="bg-white/10 p-6 rounded-xl border border-white/10 mb-8">
                                <p className="text-xs text-gray-400 mb-2 uppercase">YOUR SECRET WORD</p>
                                <p className="text-4xl font-black text-white tracking-widest">
                                    {player.word || "NO WORD"}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 animate-pulse">Tap anywhere to close</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
