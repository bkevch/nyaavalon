// src/lib/server/socket-server.ts
import { Server, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { Player } from '$lib/types';

// Define the events and their payloads
interface ServerToClientEvents {
    'update-lobby': (players: Player[]) => void;
}

interface ClientToServerEvents {
    'join-room': (gameId: string) => void;
}

// We'll use this typed server instance throughout our app
let io: Server<ClientToServerEvents, ServerToClientEvents>;

export function initializeSocket(server: HttpServer) {
    io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

    io.on('connection', (socket: Socket) => {
        console.log('A user connected:', socket.id);

        // The gameId parameter is now typed as a string
        socket.on('join-room', (gameId: string) => {
            console.log(`Socket ${socket.id} is joining room ${gameId}`);
            socket.join(gameId);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
}
