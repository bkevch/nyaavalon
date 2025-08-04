// src/lib/stores/socketStore.ts

import { writable, type Writable } from 'svelte/store';
import { io, type Socket } from 'socket.io-client';
import { browser } from '$app/environment';

// Define types for your game state
interface User {
  name: string;
  id: string;
}

interface GameState {
  users: User[];
  host: User | null;
  gameId: string | null;
  hasJoined: boolean; // is this only front end?
  errorMsg: string;
}

// Create reactive stores
export const gameState: Writable<GameState> = writable({
  users: [],
  host: null,
  gameId: null,
  hasJoined: false,
  errorMsg: ''
});

// Socket instance (not reactive, just a container)
let socket: Socket | null = null;

// Socket store functions
export const socketStore = {
  // Initialize the socket connection
  connect: () => {
    if (!browser || socket?.connected) return;

    socket = io();

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('gameCreated', (data: { gameId: string }) => {
      gameState.update(state => ({
        ...state,
        gameId: data.gameId,
        errorMsg: ''
      }));
    });

    socket.on('updateUsers', (users: User[]) => {
      gameState.update(state => ({
        ...state,
        users: users,
        host: users.length > 0 ? users[0] : null,
        hasJoined: true
      }));
    });

    socket.on('error', (error: { message: string }) => {
      gameState.update(state => ({
        ...state,
        errorMsg: error.message
      }));
    });

    socket.on('game-ended', (data: { message: string }) => {
      alert(data.message);
      // Reset the game state instead of navigating immediately
      gameState.set({
        users: [],
        host: null,
        gameId: null,
        hasJoined: false,
        errorMsg: ''
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  },

  // Emit events through the store
  createGame: (hostName: string) => {
    if (socket) {
      socket.emit('create-game', { hostName: hostName });
    }
  },

  joinLobby: (gameId: string, username: string) => {
    if (socket) {
      socket.emit('join-lobby', { gameId, username });
      gameState.update(state => ({ ...state, gameId }));
    }
  },

  requestLobbyData: (gameId: string) => {
    if (socket) {
      socket.emit('request-lobby-data', gameId);
      gameState.update(state => ({ ...state, gameId }));
    }
  },

  // Disconnect (use sparingly, usually only on app exit)
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      gameState.set({
        users: [],
        host: null,
        gameId: null,
        hasJoined: false,
        errorMsg: ''
      });
    }
  },

  // Get the socket instance if needed for advanced operations
  getSocket: () => socket
};
