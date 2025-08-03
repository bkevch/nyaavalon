
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
  console.log(`User connected: ${socket.id}`);
  
  const users = [];
  // on any connection, get all users connected to the socket server
  // and add them to the users array, then emit the array to the client
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      name: id,
      // username: socket.username,
    });
  }
  socket.emit("users", users);

  socket.on('create-game', ({ hostName }) => {
    const gameId = Math.random().toString(36).substring(2, 8);
    const hostId = Math.random().toString(36).substring(2, 10);
    //TODO: use Player class for host
    // const host = { name: hostName, id: hostId };
    const host = { name: hostName }
    const lobby = { gameId, hostName };
    games.set(gameId, lobby); // games = [{ [gameId]: { gameId = gameId, lobby: { gameId, hostName } }]
    socket.join(gameId);
    socket.emit('gameCreated',  { gameId: gameId} );
    // io.to(gameId).emit('updateUsers', games.get(gameId).users);
    io.to(gameId).emit('updateHost', games.get(gameId).hostName);
  });

  socket.on('join-lobby', ({ gameId, username }) => {
    if (games.has(gameId)) {
      let user = {name: username, id: Math.random().toString(36).substring(2, 10)};
      const game = games.get(gameId);
      game.users.push(user);
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