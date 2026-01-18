'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShadowSocket } from '../context/ShadowSocketContext';

export default function LandingPage() {
    const router = useRouter();
    const { createRoom, joinRoom, error, clearError, room } = useShadowSocket();

    const [mode, setMode] = useState<'MENU' | 'CREATE' | 'JOIN'>('MENU');
    const [username, setUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');

    // Redirect to lobby if room is set
    useEffect(() => {
        if (room && room.id) {
            router.push('/lobby');
        }
    }, [room, router]);

    const handleCreate = () => {
        if (!username.trim()) return;
        createRoom(username);
    };

    const handleJoin = () => {
        if (!username.trim() || !roomCode.trim()) return;
        joinRoom(roomCode, username);
    };

    return (
        <main className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center gap-16 py-10">

            {/* Main Content */}
            <div className="relative z-20 w-full max-w-4xl flex flex-col items-center justify-center min-h-[600px]">

                {/* Title Section */}
                <div className="text-center flex flex-col items-center">
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 font-cinzel drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-widest mb-2">
                        SHADOW SIGNAL
                    </h1>
                    <p className="text-indigo-200 font-outfit text-xl tracking-[0.5em] uppercase text-shadow-sm font-light opacity-80">
                        Trust No One
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute top-1/2 -translate-y-1/2 z-50 bg-rose-900/80 backdrop-blur-md border border-rose-500/50 text-rose-100 px-6 py-3 rounded-lg shadow-xl flex items-center gap-4">
                        <span>{error}</span>
                        <button onClick={clearError} className="hover:text-white font-bold">&times;</button>
                    </div>
                )}

                {/* Interaction Area */}
                <div className="w-full max-w-md">
                    {mode === 'MENU' && (
                        <div className="flex flex-col gap-6 w-full px-4">
                            <button
                                onClick={() => setMode('CREATE')}
                                className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded"
                            >
                                Create Room
                            </button>
                            <button
                                onClick={() => setMode('JOIN')}
                                className="px-8 py-3 border border-white text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-colors rounded"
                            >
                                Join Room
                            </button>
                        </div>
                    )}

                    {mode === 'CREATE' && (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-lg space-y-6">
                            <h2 className="text-2xl font-bold text-white text-center mb-4 tracking-wider">Commander Setup</h2>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-bold tracking-wide uppercase">Codename</label>
                                <input
                                    type="text"
                                    placeholder="Enter your alias..."
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black border border-white/20 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all font-mono"
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setMode('MENU')}
                                    className="flex-1 px-4 py-3 rounded border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!username.trim()}
                                    className="flex-[2] px-4 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                                >
                                    Initialize
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'JOIN' && (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-lg space-y-6">
                            <h2 className="text-2xl font-bold text-white text-center mb-4 tracking-wider">Infiltrate Room</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold tracking-wide uppercase">Signal Code</label>
                                    <input
                                        type="text"
                                        placeholder="XXXXXX"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        maxLength={6}
                                        className="w-full bg-black border border-white/20 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all font-mono tracking-widest text-center uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-sm font-bold tracking-wide uppercase">Codename</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your alias..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black border border-white/20 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setMode('MENU')}
                                    className="flex-1 px-4 py-3 rounded border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleJoin}
                                    disabled={!username.trim() || roomCode.length < 6}
                                    className="flex-[2] px-4 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main >
    );
}
