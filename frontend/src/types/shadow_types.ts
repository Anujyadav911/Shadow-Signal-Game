export type Role = 'CITIZEN' | 'INFILTRATOR' | 'SPY' | 'AGENT';
export type GameMode = 'INFILTRATOR' | 'SPY';
export type GamePhase = 'LOBBY' | 'ASSIGNMENT' | 'SPEAKING' | 'VOTING' | 'ELIMINATION' | 'GAME_OVER';

export interface Player {
    id: string;
    username: string;
    isHost: boolean;
    role?: Role;
    word?: string; // Client-side this will only be populated for the user
    isAlive: boolean;
    hasVoted: boolean;
    votesReceived: number;
    team?: 'SPY' | 'AGENTS' | 'CITIZENS' | 'INFILTRATOR';
}

export interface Room {
    id: string;
    players: Player[]; // Array on frontend for easier render
    phase: GamePhase;
    currentTurnIndex: number;
    turnTimer: number | null;
    roundNumber: number;
    winner?: Role | 'DRAW';
    winningTeam?: 'SPY' | 'AGENTS' | 'CITIZENS' | 'INFILTRATOR';
    wordCategory?: string;
    hostId?: string; // Helper to easily identify host
}

export interface ShadowGameContextProps {
    socket: any; // Socket type
    isConnected: boolean;
    room: Room | null;
    player: Player | null; // Current user
    createRoom: (username: string) => void;
    joinRoom: (roomCode: string, username: string) => void;
    startGame: (mode?: 'INFILTRATOR' | 'SPY') => void;
    submitVote: (targetId: string) => void;
    error: string | null;
    clearError: () => void;
}
