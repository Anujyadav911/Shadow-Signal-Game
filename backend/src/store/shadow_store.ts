import { Room, Player, GamePhase } from '../types';

class ShadowStore {
    private rooms: Map<string, Room> = new Map();

    createRoom(roomId: string, hostPlayer: Player): Room {
        const newRoom: Room = {
            id: roomId,
            players: new Map([[hostPlayer.id, hostPlayer]]),
            phase: 'LOBBY',
            currentTurnIndex: 0,
            turnTimer: null,
            roundNumber: 1,
        };
        this.rooms.set(roomId, newRoom);
        return newRoom;
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    deleteRoom(roomId: string): boolean {
        return this.rooms.delete(roomId);
    }

    addPlayerToRoom(roomId: string, player: Player): Room | undefined {
        const room = this.rooms.get(roomId);
        if (!room) return undefined;

        room.players.set(player.id, player);
        return room;
    }

    removePlayerFromRoom(roomId: string, playerId: string): Room | undefined {
        const room = this.rooms.get(roomId);
        if (!room) return undefined;

        room.players.delete(playerId);
        // Logic to handle host migration or room deletion if empty should be handled in the handler layer primarily
        // but we can ensure basic cleanup here if needed.
        if (room.players.size === 0) {
            this.rooms.delete(roomId);
            return undefined;
        }

        return room;
    }

    // Helper to find which room a player socket belongs to (useful for disconnects)
    findRoomByPlayerId(playerId: string): Room | undefined {
        for (const room of this.rooms.values()) {
            if (room.players.has(playerId)) {
                return room;
            }
        }
        return undefined;
    }
}

export const shadowStore = new ShadowStore();
