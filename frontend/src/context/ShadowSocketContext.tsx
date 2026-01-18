'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, Player, ShadowGameContextProps } from '../types/shadow_types';

const ShadowSocketContext = createContext<ShadowGameContextProps | undefined>(undefined);

export const useShadowSocket = () => {
    const context = useContext(ShadowSocketContext);
    if (!context) {
        throw new Error('useShadowSocket must be used within a ShadowSocketProvider');
    }
    return context;
};

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const ShadowSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [room, setRoom] = useState<Room | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'], // Force websocket
            autoConnect: true,
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to backend');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from backend');
        });

        newSocket.on('error', (err: any) => {
            setError(err.message || 'An unknown error occurred');
        });

        // Game Events
        newSocket.on('lobby_update', (data: { players: Player[], hostId: string }) => {
            setRoom(prev => {
                if (!prev) return null; // Should have created room first? handled in join callback usually
                // Actually we need to be careful. If we just joined, `room` might be null in state 
                // but we receive update. We should initialize room structure if needed or wait for join callback.
                // Ideally join callback sets initial state, then this updates it.
                // But for "Create Room", callback gives ID.
                return {
                    ...prev,
                    players: data.players,
                    hostId: data.hostId,
                    // If phase isn't set yet (new room), default to LOBBY
                    phase: prev.phase || 'LOBBY',
                    id: prev.id // Maintain ID
                } as Room;
            });

            // Update current player object from list
            if (newSocket.id) {
                const me = data.players.find(p => p.id === newSocket.id);
                if (me) setPlayer(me);
            }
        });

        newSocket.on('game_started', (data: { role: any, word: string }) => {
            setRoom(prev => prev ? ({ ...prev, phase: 'SPEAKING' }) : null);
            setPlayer(prev => prev ? ({ ...prev, role: data.role, word: data.word }) : null);
        });

        newSocket.on('turn_update', (data: { player: Player, round: number }) => {
            setRoom(prev => prev ? ({
                ...prev,
                // Store the full player object of who is speaking to match IDs later
                // We'll hijack 'currentTurnIndex' to store the INDEX if we can find it, or just use a new field?
                // The Types interface has `currentTurnIndex`.
                // Let's find basic index in the array.
                currentTurnIndex: prev.players.findIndex(p => p.id === data.player.id),
                roundNumber: data.round
            }) : null);
        });

        newSocket.on('timer_update', (data: { timeLeft: number }) => {
            setRoom(prev => prev ? ({ ...prev, turnTimer: data.timeLeft }) : null);
        });

        newSocket.on('phase_change', (data: { phase: any, message: string }) => {
            setRoom(prev => prev ? ({ ...prev, phase: data.phase }) : null);
        });

        newSocket.on('game_over', (data: { winner: any }) => {
            setRoom(prev => prev ? ({ ...prev, phase: 'GAME_OVER', winner: data.winner }) : null);
        });

        newSocket.on('vote_update', () => {
            // Maybe trigger sound or subtle UI cue
        });

        newSocket.on('player_eliminated', (data: { playerId: string, role: string }) => {
            // Handled via lobby_update usually? Or explicit event?
            // Backend emits "player_eliminated" then likely nothing else unless next round
            // We should update the player list's isAlive status
            setRoom(prev => {
                if (!prev) return null;
                const newPlayers = prev.players.map(p =>
                    p.id === data.playerId ? { ...p, isAlive: false, role: data.role as any } : p // Reveal role
                );
                return { ...prev, players: newPlayers };
            });
        });

        newSocket.on('new_round', (data: { round: number }) => {
            setRoom(prev => prev ? ({ ...prev, roundNumber: data.round, phase: 'SPEAKING' }) : null);
        });


        return () => {
            newSocket.disconnect();
        };
    }, []);

    const createRoom = (username: string) => {
        if (!socket) return;
        socket.emit('create_room', username, (response: any) => {
            if (response.success) {
                // Initialize room state
                const initialMe: Player = {
                    id: socket.id!,
                    username,
                    isHost: true,
                    isAlive: true,
                    hasVoted: false,
                    votesReceived: 0
                };
                setRoom({
                    id: response.roomCode,
                    players: [initialMe],
                    phase: 'LOBBY',
                    currentTurnIndex: 0,
                    turnTimer: null,
                    roundNumber: 1,
                    hostId: socket.id!
                });
                setPlayer(initialMe);
            } else {
                setError(response.message);
            }
        });
    };

    const joinRoom = (roomCode: string, username: string) => {
        if (!socket) return;
        socket.emit('join_room', { roomCode, username }, (response: any) => {
            if (response.success) {
                // We wait for lobby_update to fill details, but set ID now
                setRoom({
                    id: roomCode,
                    players: [], // Will fill
                    phase: 'LOBBY',
                    currentTurnIndex: 0,
                    turnTimer: null,
                    roundNumber: 1
                });
                // We don't setPlayer yet, wait for lobby_update to confirm ID match
            } else {
                setError(response.message);
            }
        });
    };

    const startGame = (mode: 'INFILTRATOR' | 'SPY' = 'INFILTRATOR') => {
        if (!socket || !room) return;
        socket.emit('start_game', { roomCode: room.id, mode });
    };

    const submitVote = (targetId: string) => {
        if (!socket || !room) return;
        socket.emit('submit_vote', { roomCode: room.id, targetId });
        setPlayer(prev => prev ? { ...prev, hasVoted: true } : null); // Optimistic update
    };

    const clearError = () => setError(null);

    return (
        <ShadowSocketContext.Provider value={{
            socket,
            isConnected,
            room,
            player,
            createRoom,
            joinRoom,
            startGame,
            submitVote,
            error,
            clearError
        }}>
            {children}
        </ShadowSocketContext.Provider>
    );
};
