// vite-socket-io-plugin.ts (in your project's root directory)

import type { Plugin } from 'vite';
import { attachSocketServer } from './src/lib/server/socket-server';

export const socketIoPlugin: Plugin = {
  name: 'socket-io-plugin',
  configureServer(server) {
    if (server.httpServer) {
      // This is where we attach our socket.io server to Vite's server
      attachSocketServer(server.httpServer);
    }
  },
};
