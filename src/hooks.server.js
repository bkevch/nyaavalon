// src/hooks.server.js
import { createServer } from 'http';
import { initializeSocket } from '$lib/server/socket-server';

// This is a workaround to get access to the Node http server
// See: https://github.com/sveltejs/kit/issues/10637
console.log('Starting custom server...');
const server = createServer();
initializeSocket(server);

// This is a required function for server hooks, even if empty.
export async function handle({ event, resolve }) {
    return resolve(event);
}

// Start listening on a known port
server.listen(3000, () => {
    console.log('Custom server with Socket.IO is running on port 3000');
});
