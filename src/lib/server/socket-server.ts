// src/lib/server/socket-server.ts

import { Server } from 'socket.io';

export function attachSocketServer(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Your SvelteKit dev server
      methods: ["GET", "POST"]
    }
  });
  // Use a Map to store game state in memory
  const games = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create-game', ({ hostName }: { hostName: string }) => {
      const gameId = Math.random().toString(36).substring(2, 8);
      const host = { name: hostName, id: socket.id };

      const lobby = {
        gameId: gameId,
        host: host,
        users: [host] // The host is the first user
      };

      games.set(gameId, lobby);
      socket.join(gameId);

      // Tell the client the game was created so it can navigate
      socket.emit('gameCreated', { gameId: gameId });

      // Send the initial host/user data to the creator
      io.to(gameId).emit('updateHost', host);
      io.to(gameId).emit('updateUsers', lobby.users);
      console.log(`Game created by ${hostName} with ID: ${gameId}`);
    });

    socket.on('join-lobby', ({ gameId, username }: { gameId: string, username: string }) => {
      if (games.has(gameId)) {
        const game = games.get(gameId);
        const newUser = { name: username, id: socket.id };

        game.users.push(newUser);
        socket.join(gameId);

        // Broadcast the updated user list to everyone in the room
        io.to(gameId).emit('updateUsers', game.users);
        console.log(`${username} joined game ${gameId}`);
      } else {
        socket.emit('error', { message: 'Game not found' });
      }
    });

    // This handles users who join via a link and need the initial lobby state
    socket.on('request-lobby-data', (gameId: string) => {
      if (games.has(gameId)) {
        const game = games.get(gameId);
        socket.join(gameId); // Ensure the user is in the socket room
        // Send the current game state to just the requester
        socket.emit('updateHost', game.host);
        socket.emit('updateUsers', game.users);
      } else {
        socket.emit('error', { message: 'Game not found on request' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // TODO: Add logic to remove users from games when they disconnect
    });
  });

  console.log('Socket.IO server attached');
}
