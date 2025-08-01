import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Proxy WebSocket requests to the Socket.IO server
			'/socket.io': {
				target: 'ws://localhost:3000',
				ws: true // Important for WebSocket proxying
			}
		}
	}
};

export default config;