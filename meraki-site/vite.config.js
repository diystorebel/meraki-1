import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Separa vendor libraries per miglior code splitting
					if (id.includes('node_modules')) {
						if (id.includes('@supabase')) {
							return 'vendor-supabase';
						}
						if (id.includes('lucide-svelte')) {
							return 'vendor-icons';
						}
						if (id.includes('browser-image-compression')) {
							return 'vendor-image';
						}
						// Altri vendor in un chunk separato
						return 'vendor';
					}
				}
			}
		},
		// Riduce dimensione bundle
		chunkSizeWarningLimit: 1000
	}
});
