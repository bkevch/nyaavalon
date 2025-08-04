// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: [vitePreprocess()]
};


// import adapter from '@sveltejs/adapter-node';
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	// Consult https://svelte.dev/docs/kit/integrations
// 	// for more information about preprocessors
// 	preprocess: vitePreprocess(),

// 	kit: {
// 		adapter: adapter({entryPoint: 'src/lib/server/socket-server.js'}),
// 	}
// };

// export default config;