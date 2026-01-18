import { Server, Socket } from 'socket.io';
import { shadowStore } from '../store/shadow_store';
import { assignRoles, getRandomWordPair } from '../utils/shadow_utils';
import { Room, Player, Role } from '../types';

export function registerShadowGameHandlers(io: Server, socket: Socket) {

    // Helper to start the turn timer
    const startTurnTimer = (room: Room, duration: number = 30) => {
        if (room.turnTimer) {
            clearInterval(room.turnTimer as any);
        }

        let timeLeft = duration;
        room.turnTimer = setInterval(() => {
            timeLeft--;
            io.to(room.id).emit('timer_update', { timeLeft });

            if (timeLeft <= 0) {
                clearInterval(room.turnTimer as any);
                room.turnTimer = null;
                advanceTurn(room);
            }
        }, 1000) as unknown as number;
    };

    const advanceTurn = (room: Room) => {
        // Find next alive player
        let nextIndex = (room.currentTurnIndex + 1) % room.players.size; // This index logic assumes array-like access which Map doesn't support directly
        // Better approach: convert to array
        const players = Array.from(room.players.values());
        let attempts = 0;

        // Find the next ALIVE player
        while (attempts < players.length) {
            if (players[nextIndex].isAlive) {
                break;
            }
            nextIndex = (nextIndex + 1) % players.length;
            attempts++;
        }

        // Check if we completed a full round (everyone has spoken)
        // Logic: If we wrapped around to the start or a specific condition met?
        // Simpler logic for this assignment:
        // We need to track who has spoken THIS round.
        // But standard "Shadow" game usually has speaking phase then voting.
        // Let's assume one pass of speaking per round, then vote.
        // We need to know who started the round to know when it ends.
        // For simplicity: If nextIndex < currentTurnIndex (wrap around), end speaking phase.
        // OR: track `speakingCount` in room.

        // Let's implement a simple "Check if everyone spoke" logic?
        // Actually, standard social deduction often just cycles.
        // Prompt says: "Players take turns, 30 seconds each... Voting Phase... Elimination"
        // Implies: Loop through all alive players once -> Vote.

        // Let's stick to: Store a "turnOrder" array in the Room?
        // Or just iterate standard array order.
        // If we reach the end of the array, go to voting.

        room.currentTurnIndex = nextIndex;

        // Check if nextIndex wrapped around to 0 (or first alive player)?
        // This is tricky with eliminations.
        // Let's just track "turns taken" count in the room relative to alive players.
        // Or simpler: The room needs a `turnOrder` list required for stable turn management.

        // QUICK FIX for In-Memory complexity:
        // Just check if `nextIndex` is less than `prevIndex` implies wrap around.
        // BUT if player 0 is eliminated, we start at 1.
        // Let's add `turnOrder` to Room interface locally or just re-calculate.

        // We will iterate through `players` array.
        // If we finish the list, start Voting.

        // Let's define: Phase starts, index = 0.
        // Find connected alive player at index.
        // If index >= players.length -> End Speaking Phase -> Start Voting.

        // RE-IMPLEMENT `advanceTurn` with explicit specific logic below.
    };

    const nextTurnOrVote = (room: Room) => {
        const players = Array.from(room.players.values());
        let nextIndex = room.currentTurnIndex + 1;

        // Find next alive player
        while (nextIndex < players.length && !players[nextIndex].isAlive) {
            nextIndex++;
        }

        if (nextIndex >= players.length) {
            // Everyone has spoken
            startVotingPhase(room);
        } else {
            // Next player speaks
            room.currentTurnIndex = nextIndex;
            const currentPlayer = players[nextIndex];

            io.to(room.id).emit('turn_update', {
                player: currentPlayer,
                round: room.roundNumber
            });

            startTurnTimer(room, 30);
        }
    };

    const startVotingPhase = (room: Room) => {
        if (room.turnTimer) clearInterval(room.turnTimer as any);
        room.phase = 'VOTING';
        // Reset votes
        for (const p of room.players.values()) {
            p.hasVoted = false;
            p.votesReceived = 0;
        }

        io.to(room.id).emit('phase_change', {
            phase: 'VOTING',
            message: 'Discussion over! Cast your votes.'
        });
    };

    const checkWinCondition = (room: Room) => {
        const players = Array.from(room.players.values());
        const alivePlayers = players.filter(p => p.isAlive);
        const aliveInfiltrator = alivePlayers.find(p => p.role === 'INFILTRATOR');
        const aliveCitizens = alivePlayers.filter(p => p.role === 'CITIZEN');

        if (!aliveInfiltrator) {
            // Infiltrator eliminated -> Citizens Win
            room.winner = 'CITIZEN';
            room.phase = 'GAME_OVER';
            io.to(room.id).emit('game_over', { winner: 'CITIZENS', message: 'The Infiltrator has been eliminated!' });
            return true;
        }

        if (aliveCitizens.length <= 1) {
            // 1 vs 1 (or 0 vs 1) -> Infiltrator Wins (usually needs majority to eliminate, so 1v1 is deadlock/win)
            // Prompt: "If only two players remain and the special role is still alive -> Special role wins"
            if (alivePlayers.length <= 2) {
                room.winner = 'INFILTRATOR';
                room.phase = 'GAME_OVER';
                io.to(room.id).emit('game_over', { winner: 'INFILTRATOR', message: 'The Infiltrator survived until the end!' });
                return true;
            }
        }

        return false;
    };

    socket.on('start_game', ({ roomCode }) => {
        const room = shadowStore.getRoom(roomCode);
        if (!room) return;

        const player = room.players.get(socket.id);
        if (!player?.isHost) return; // Only host

        if (room.players.size < 3) { // Minimum 3 players usually
            socket.emit('error', { message: 'Need at least 3 players to start.' });
            return;
        }

        // 1. Assign Roles
        const playersList = Array.from(room.players.values());
        const assignedPlayers = assignRoles(playersList);

        // 2. Get Word
        const { citizenWord, infiltratorWord } = getRandomWordPair();

        // 3. Distribute info
        assignedPlayers.forEach(p => {
            room.players.set(p.id, p); // Update store
            p.word = (p.role === 'CITIZEN') ? citizenWord : (infiltratorWord || undefined);
            p.isAlive = true;
            p.votesReceived = 0;
            p.hasVoted = false;

            // Emit private info
            io.to(p.id).emit('game_started', {
                role: p.role,
                word: p.word
            });
        });

        room.phase = 'SPEAKING';
        room.currentTurnIndex = -1; // Will increment to 0
        room.roundNumber = 1;
        room.wordCategory = "Mystery"; // Could pass category from JSON if available

        // Start first turn
        nextTurnOrVote(room);
    });

    socket.on('submit_vote', ({ roomCode, targetId }) => {
        const room = shadowStore.getRoom(roomCode);
        if (!room || room.phase !== 'VOTING') return;

        const voter = room.players.get(socket.id);
        if (!voter || !voter.isAlive || voter.hasVoted) return;
        if (voter.id === targetId) return; // Self-vote check (already in prompt req)

        const target = room.players.get(targetId);
        if (!target || !target.isAlive) return;

        voter.hasVoted = true;
        target.votesReceived++;

        // Check if all alive players have voted
        const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
        const totalVotes = alivePlayers.reduce((acc, p) => acc + (p.hasVoted ? 1 : 0), 0);

        io.to(room.id).emit('vote_update', {
            voterId: voter.id,
            // Don't reveal target yet? Usually revealed at end.
            // For realtime feedback, maybe just "someone voted".
        });

        if (totalVotes === alivePlayers.length) {
            // Tally votes
            let maxVotes = 0;
            let candidate: Player | null = null;
            let isTie = false;

            for (const p of alivePlayers) {
                if (p.votesReceived > maxVotes) {
                    maxVotes = p.votesReceived;
                    candidate = p;
                    isTie = false;
                } else if (p.votesReceived === maxVotes) {
                    isTie = true;
                }
            }

            // Reveal results
            const voteSummary = alivePlayers.map(p => ({ username: p.username, votes: p.votesReceived }));
            io.to(room.id).emit('vote_results', { results: voteSummary });

            // Elimination logic
            if (candidate && !isTie) {
                candidate.isAlive = false;
                io.to(room.id).emit('player_eliminated', {
                    playerId: candidate.id,
                    role: candidate.role // Reveal role on death? Usually yes.
                });
            } else {
                io.to(room.id).emit('vote_tie', { message: 'Tie vote! No one eliminated.' });
            }

            // Check Win
            if (checkWinCondition(room)) {
                return;
            }

            // Next Round
            setTimeout(() => {
                room.roundNumber++;
                room.phase = 'SPEAKING';
                room.currentTurnIndex = -1;
                io.to(room.id).emit('new_round', { round: room.roundNumber });
                nextTurnOrVote(room);
            }, 3000); // Delay to show results
        }
    });
}
