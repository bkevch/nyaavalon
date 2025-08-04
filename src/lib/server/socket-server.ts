// src/lib/server/socket-server.js
import { Server, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your SvelteKit dev server
    methods: ["GET", "POST"]
  }
});

// Use a Map to store game state in memory
const games = new Map<string, { host: { name: string, id: string }, users: { name: string, id: string }[] }>();

io.on('connection', (socket) => {
  console.log(`User connected`); // dont use socket.id, it's ephemeral

  socket.on('create-game', ({ hostName }) => {
    const gameId = Math.random().toString(36).substring(2, 8);
    const host = { name: hostName, id: '0' };

    // Create a structured game object
    const lobby = {
      gameId: gameId,
      host: host,
      users: [host] // Add the host to the user list immediately
    };

    games.set(gameId, lobby);
    socket.join(gameId);

    // Tell the creator's client to navigate to the new game room
    socket.emit('gameCreated', { gameId: gameId });

    // Inform everyone in the room (just the host for now) about the current state
    io.to(gameId).emit('updateUsers', lobby.users);
    console.log(`Game created by ${hostName} with ID: ${gameId}`);
  });

  socket.on('join-lobby', ({ gameId, username }) => {    
    const game = games.get(gameId);
    if (game) {
      const newUser = { name: username, id: socket.id }; // more sinning

      // Add the new user and join the socket room
      game.users.push(newUser);
      socket.join(gameId);

      // Broadcast the updated user list to everyone in the room
      io.to(gameId).emit('updateUsers', game.users);
      console.log(`${username} joined game ${gameId}`);
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('request-lobby-data', (gameId) => {
    const game = games.get(gameId);
    if (game) {
      socket.join(gameId); // Ensure the user is in the room to get updates
      // Send the current user list to the requester
      socket.emit('updateUsers', game.users);
    } else {
        socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove the user from all games when they disconnect
    for (const [gameId, game] of games.entries()) {
      /** @type {{id: string, name: string}} */
      const userIndex = game.users.findIndex(
        /** @param {{id: string, name: string}} user */
        (user) => user.id === socket.id
      );
      if (userIndex !== -1) {
        game.users.splice(userIndex, 1);
        // Notify remaining users in the lobby
        io.to(gameId).emit('updateUsers', game.users);
        // If no users remain, delete the game
        if (game.users.length === 0) {
          games.delete(gameId);
        }
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running on http://localhost:3000');
});
