<script>
	import { onMount } from 'svelte';
	import { initAuth } from '$lib/stores/authStore';
	import { loadCategories } from '$lib/stores/categoriesStore';
	import { loadMenu } from '$lib/stores/menuStore';
	import '../app.css';

	// Export data prop (required by SvelteKit)
	export let data = {};

	// Initialize auth and load data on app start
	onMount(async () => {
		await initAuth();
		await loadCategories();
		await loadMenu();
	});
</script>

<slot />
