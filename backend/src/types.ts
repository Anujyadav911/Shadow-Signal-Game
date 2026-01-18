export type Role = 'CITIZEN' | 'INFILTRATOR' | 'SPY' | 'AGENT';
export type GameMode = 'INFILTRATOR' | 'SPY';
export type GamePhase = 'LOBBY' | 'ASSIGNMENT' | 'SPEAKING' | 'VOTING' | 'ELIMINATION' | 'GAME_OVER';

export interface Player {
    id: string; // Socket ID
    username: string;
    isHost: boolean;
    role?: Role;
    word?: string; // Private word
    isAlive: boolean;
    hasVoted: boolean;
    votesReceived: number;
}

export interface Room {
    id: string; // 6-digit code
    players: Map<string, Player>;
    phase: GamePhase;
    currentTurnIndex: number; // Index of the player whose turn it is
    turnTimer: number | null; // Seconds remaining
    roundNumber: number;
    winner?: Role | 'DRAW';
    wordCategory?: string; // For display
}
