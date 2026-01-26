<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { initAuth } from '$lib/stores/authStore';
	import { loadCategories } from '$lib/stores/categoriesStore';
	import { loadMenu } from '$lib/stores/menuStore';
	import '../app.css';

	let contentReady = false;

	// Initialize auth and load data on app start (only in browser)
	onMount(async () => {
		if (browser) {
			try {
				// Parallel loading: auth prima, poi dati in parallelo
				await initAuth();
				await Promise.all([loadCategories(), loadMenu()]);
			} catch (error) {
				console.error('Error initializing app:', error);
			}
		}
		// Mostra il footer solo dopo che il layout è montato
		contentReady = true;
	});
</script>

<div class="layout-wrapper">
	<main class="layout-main">
		<slot />
	</main>

	{#if contentReady}
		<footer class="powered-footer">
			<p>
				powered by <strong>One2One</strong> di Giovanni Marascio — 
				<a href="https://www.one2one.it" target="_blank" rel="noopener">www.one2one.it</a>
				<span class="tagline">Digital Food & Beverage</span>
			</p>
		</footer>
	{/if}
</div>

<style>
	.layout-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.layout-main {
		flex: 1;
	}

	.powered-footer {
		background: #1a1a1a;
		padding: 1rem;
		text-align: center;
		border-top: 1px solid #333;
	}

	.powered-footer p {
		margin: 0;
		font-size: 0.75rem;
		color: #888;
		letter-spacing: 0.02em;
	}

	.powered-footer strong {
		color: #aaa;
	}

	.powered-footer a {
		color: var(--verde-meraki, #154315);
		text-decoration: none;
		transition: color 0.2s;
	}

	.powered-footer a:hover {
		color: var(--verde-light, #2d7a2d);
		text-decoration: underline;
	}

	.powered-footer .tagline {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.65rem;
		color: #666;
		font-style: italic;
	}

	@media (min-width: 640px) {
		.powered-footer .tagline {
			display: inline;
			margin-top: 0;
			margin-left: 0.5rem;
		}
	}
</style>
