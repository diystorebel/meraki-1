import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Ottimizzazioni conservative
		target: 'es2020',
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				// Lascia che SvelteKit gestisca automaticamente il chunking
				experimentalMinChunkSize: 10000
			}
		}
	}
});
