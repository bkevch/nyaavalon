
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
// If using SvelteKit, the handler is usually at '../build/handler.js' or '../.svelte-kit/output/server/handler.js'
// Update the path below if needed:
import { handler } from '../../../build/handler.js'; // SvelteKit handler

const app  = express();
const server = http.createServer(app);
const io = new Server(server);

const lobbies = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('create-game', ({ hostName }) => {
    console.log('Game created by:', hostName);
    const lobbyId = Math.random().toString(36).substring(2, 8);
    lobbies.set(lobbyId, {
      host: hostName,
      users: [{ id: socket.id, name: hostName }],
    });

    socket.join(lobbyId);
    socket.emit('gameCreated', { lobbyId });
    io.to(lobbyId).emit('updateUsers', lobbies.get(lobbyId).users);
  });

  socket.on('join-game', ({ username, gameId }) => {
    if (lobbies.has(gameId)) {
      const lobby = lobbies.get(gameId);
      lobby.users.push({ id: socket.id, name: username });
      socket.join(gameId);
      io.to(gameId).emit('updateUsers', lobby.users);
      console.log(`${username} joined game ${gameId}`);
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Have SvelteKit handle all other requests
app.use(handler);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});