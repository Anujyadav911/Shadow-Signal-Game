import { Server, Socket } from 'socket.io';
import { shadowStore } from '../store/shadow_store';
import { generateRoomCode } from '../utils/shadow_utils';
import { Player } from '../types';

export function registerShadowRoomHandlers(io: Server, socket: Socket) {

    socket.on('create_room', (username: string, callback?: (response: any) => void) => {
        try {
            const roomCode = generateRoomCode();
            const newPlayer: Player = {
                id: socket.id,
                username,
                isHost: true,
                isAlive: true,
                hasVoted: false,
                votesReceived: 0,
            };

            const room = shadowStore.createRoom(roomCode, newPlayer);
            socket.join(roomCode);

            console.log(`Room created: ${roomCode} by ${username}`);
            if (callback) callback({ success: true, roomCode });

            // Emit update to the room (even though it's just the host)
            io.to(roomCode).emit('lobby_update', {
                players: Array.from(room.players.values()),
                hostId: newPlayer.id
            });

        } catch (error) {
            console.error("Error creating room:", error);
            if (callback) callback({ success: false, message: "Failed to create room" });
        }
    });

    socket.on('join_room', ({ roomCode, username }: { roomCode: string, username: string }, callback?: (response: any) => void) => {
        try {
            const room = shadowStore.getRoom(roomCode);
            if (!room) {
                if (callback) callback({ success: false, message: "Room not found" });
                return;
            }

            if (room.phase !== 'LOBBY') {
                if (callback) callback({ success: false, message: "Game already in progress" });
                return;
            }

            // Prevent duplicate usernames? (Optional but good UX)
            // For simplicity, we assume unique enough or allow duplicates

            const newPlayer: Player = {
                id: socket.id,
                username,
                isHost: false, // Default to false
                isAlive: true,
                hasVoted: false,
                votesReceived: 0,
            };

            const updatedRoom = shadowStore.addPlayerToRoom(roomCode, newPlayer);
            if (updatedRoom) {
                socket.join(roomCode);
                console.log(`${username} joined room ${roomCode}`);
                if (callback) callback({ success: true, roomCode });

                const host = Array.from(updatedRoom.players.values()).find(p => p.isHost);
                io.to(roomCode).emit('lobby_update', {
                    players: Array.from(updatedRoom.players.values()),
                    hostId: host?.id
                });
            }

        } catch (error) {
            console.error("Error joining room:", error);
            if (callback) callback({ success: false, message: "Failed to join room" });
        }
    });

    socket.on('disconnect', () => {
        const room = shadowStore.findRoomByPlayerId(socket.id);
        if (room) {
            const player = room.players.get(socket.id);
            const wasHost = player?.isHost;

            shadowStore.removePlayerFromRoom(room.id, socket.id);
            console.log(`${player?.username} disconnected from room ${room.id}`);

            // Identify new host if needed
            if (wasHost && room.players.size > 0) {
                const newHost = room.players.values().next().value;
                if (newHost) {
                    newHost.isHost = true;
                    // Update the store reference? (Not strictly needed since we mutated the object)
                    room.players.set(newHost.id, newHost);
                }
            }

            if (room.players.size === 0) {
                // Room is gone, already handled in store but nice to log
                console.log(`Room ${room.id} deleted`);
            } else {
                const currentHost = Array.from(room.players.values()).find(p => p.isHost);
                io.to(room.id).emit('lobby_update', {
                    players: Array.from(room.players.values()),
                    hostId: currentHost?.id
                });
                // Also emit a general player_left event if needed by client
                io.to(room.id).emit('player_left', { playerId: socket.id });
            }
        }
    });
}
