
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app  = express();
const server = http.createServer(app);
const io = new Server(server, { // need cors bc of two ports for vite and socket.io
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const games = new Map();
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('create-game', ({ hostName }) => {
    console.log('Game created by:', hostName);
    const gameId = Math.random().toString(36).substring(2, 8);
    console.log("the gameId is: ", gameId);
    games.set(gameId, {
      host: hostName,
      users: [{ id: socket.id, name: hostName }],
    });
    console.log("set lobby with host name: ", hostName, " and gameId: ", gameId);

    socket.join(gameId);
    socket.emit('gameCreated',  { gameId: gameId} );
    console.log('emitting gameCreated with gameId:', gameId);
    io.to(gameId).emit('updateUsers', games.get(gameId).users);
    console.log('Users: ', games.get(gameId).users, ' updated for game:', gameId);
  });

  socket.on('join-game', ({ username, gameId }) => {
    if (games.has(gameId)) {
      const game = games.get(gameId);
      game.users.push({ id: socket.id, name: username });
      socket.join(gameId);
      io.to(gameId).emit('updateUsers', game.users);
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
// app.use(handler);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});