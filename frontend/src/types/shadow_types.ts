export type Role = 'CITIZEN' | 'INFILTRATOR';
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
}

export interface Room {
    id: string;
    players: Player[]; // Array on frontend for easier render
    phase: GamePhase;
    currentTurnIndex: number;
    turnTimer: number | null;
    roundNumber: number;
    winner?: Role | 'DRAW';
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
    startGame: () => void;
    submitVote: (targetId: string) => void;
    error: string | null;
    clearError: () => void;
}
