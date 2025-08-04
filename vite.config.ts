import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { socketIoPlugin } from './vite-socket-io-plugin'; // 1. Import the plugin

const config: UserConfig = {
  plugins: [
    sveltekit(),
    socketIoPlugin // 2. Add the plugin to the plugins array
  ]
};

export default config;