import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerShadowRoomHandlers } from './handlers/shadow_room_handler';
import { registerShadowGameHandlers } from './handlers/shadow_game_handler';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4000;

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register Handlers
    registerShadowRoomHandlers(io, socket);
    registerShadowGameHandlers(io, socket);

    socket.on('disconnect', () => {
        // console.log('User disconnected', socket.id); // Handled in room handler
    });
});

httpServer.listen(PORT, () => {
    console.log(`Shadow Signal Backend running on port ${PORT}`);
});
