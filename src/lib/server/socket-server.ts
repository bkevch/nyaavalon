// src/lib/server/socket-server.ts
import crypto from 'crypto';
import { Server, Socket } from 'socket.io';
import type { User, Lobby } from '../types';
import { InMemorySessionStore } from '../sessionStore';
interface ISocket extends Socket {
  name?: string;
  sessionID?: string;
  userID?: string;
  username?: string;
}
interface GameLobby {
  gameId: string;
  host: User;
  users: User[];
}

export function attachSocketServer(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Your SvelteKit dev server
      methods: ["GET", "POST"]
    }
  });

  // Use a Map to store game state in memory
  const games = new Map();
  const randomId = () => crypto.randomBytes(8).toString("hex");

  const sessionStore = new InMemorySessionStore();

  io.use((socket: ISocket, next) => {
    console.log('inside io.use')
    console.log('socket.handshake', socket.handshake);
    const sessionID = socket.handshake.auth.sessionID;
    console.log(`sessionID: ${sessionID}`);
    if (sessionID) {
      // find existing session
      const session = sessionStore.findSession(sessionID);
      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        return next();
      }
    }
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }
    // create new session
    socket.sessionID = randomId();
    socket.userID = randomId();
    socket.username = username;
    console.log(`New session created: ${socket.sessionID} for user ${socket.username} with ID ${socket.userID}`);
    next();
  });

  io.on('connection', (socket: ISocket) => {
    // persist session
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: true,
    });

    // emit session details
    socket.emit("session", {
      sessionID: socket.sessionID,
      userID: socket.userID,
    });

    console.log(`Socket connected: ${socket.id}`);

    socket.on('create-game', (data: { hostName: string }) => {
      const gameId = Math.random().toString(36).substring(2, 8);
      const host = { name: data.hostName, id: gameId.substring(3, 8) }; // Use a unique ID for the host, ripoff the gameId
      console.log(`host has name : ${host.name} and id: ${host.id}`);
      const lobby = { gameId: gameId, host: host, users: [host] }; 

      games.set(gameId, lobby);
      socket.join(gameId);

      io.to(gameId).emit('gameCreated', { gameId: gameId });
      console.log(`Emitting event gameCreated: ${gameId}`);
      // io.to(gameId).emit('updateHost', host);
      // console.log(`Emitting event updateHost: ${host}`);
      // io.to(gameId).emit('updateUsers', lobby.users);
      // console.log(`Emitting event updateUsers: ${lobby.users[0].name}`);
      // console.log(`Game created by ${host.name} with ID: ${gameId}`);
    });

    socket.on('join-lobby', (data: { gameId: string, username: string }) => {
      let gameId = data.gameId;
      let username = data.username;
      if (games.has(gameId)) {
        const game = games.get(gameId);
        const newUser = { name: username, id: socket.id };

        game.users.push(newUser);
        socket.join(gameId);

        io.to(gameId).emit('updateUsers', game.users);
        console.log(`${username} joined game ${gameId}`);
      } else {
        socket.emit('error', { message: 'Game not found' });
      }
    });

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
