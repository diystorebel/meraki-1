<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { initAuth } from '$lib/stores/authStore';
	import { loadCategories } from '$lib/stores/categoriesStore';
	import { loadMenu } from '$lib/stores/menuStore';
	import '../app.css';

	// Initialize auth and load data on app start (only in browser)
	onMount(async () => {
		if (browser) {
			try {
				await initAuth();
				await loadCategories();
				await loadMenu();
			} catch (error) {
				console.error('Error initializing app:', error);
			}
		}
	});
</script>

<slot />
