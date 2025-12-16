<script>
	import { Home } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { galleryByTheme, loadGallery, loadThemes } from '$lib/stores/galleryStore.js';

	let selectedImage = null;
	let loading = true;
	let activeTheme = 'all';

	onMount(async () => {
		await Promise.all([loadThemes(), loadGallery()]);
		loading = false;
	});

	function openImage(imageUrl) {
		selectedImage = imageUrl;
	}

	function closeImage() {
		selectedImage = null;
	}

	// Calcola tutte le immagini (per tab "Tutte")
	$: allImages = $galleryByTheme.flatMap(g => g.images);
	
	// Immagini filtrate per tema attivo
	$: displayedGroups = activeTheme === 'all' 
		? $galleryByTheme 
		: $galleryByTheme.filter(g => g.theme.slug === activeTheme);
</script>

<svelte:head>
	<title>Gallery - Meraki</title>
</svelte:head>

<div class="page">
	<!-- Header -->
	<header class="page-header">
		<a href="/" class="back-button">
			<Home size={20} />
			Home
		</a>
		<h1 class="page-title">Gallery</h1>
		<p class="page-subtitle">Scopri l'atmosfera di Meraki</p>
	</header>

	<!-- Theme Navigation -->
	{#if !loading && $galleryByTheme.length > 0}
		<nav class="theme-nav">
			<div class="theme-nav-inner">
				<button 
					class="theme-btn" 
					class:active={activeTheme === 'all'}
					on:click={() => activeTheme = 'all'}
				>
					Tutte
					<span class="count">{allImages.length}</span>
				</button>
				{#each $galleryByTheme as group}
					{#if group.theme.slug !== 'senza-tema'}
						<button 
							class="theme-btn" 
							class:active={activeTheme === group.theme.slug}
							on:click={() => activeTheme = group.theme.slug}
						>
							{group.theme.nome}
							<span class="count">{group.images.length}</span>
						</button>
					{/if}
				{/each}
			</div>
		</nav>
	{/if}

	<!-- Gallery Content -->
	<section class="content-section">
		<div class="container">
			{#if loading}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Caricamento gallery...</p>
				</div>
			{:else if allImages.length === 0}
				<div class="empty-gallery">
					<p>Nessuna immagine nella gallery</p>
				</div>
			{:else}
				{#each displayedGroups as group, groupIndex}
					{#if group.images.length > 0}
						<div class="theme-section" style="animation-delay: {groupIndex * 0.1}s">
							{#if activeTheme === 'all' && group.theme.slug !== 'senza-tema'}
								<div class="theme-header">
									<h2 class="theme-title">{group.theme.nome}</h2>
									{#if group.theme.descrizione}
										<p class="theme-description">{group.theme.descrizione}</p>
									{/if}
								</div>
							{/if}
							
							<div class="gallery-masonry">
								{#each group.images as image, i}
									<button 
										class="gallery-item" 
										on:click={() => openImage(image.immagine_url)}
										style="animation-delay: {(groupIndex * 0.1) + (i * 0.03)}s"
									>
										<img 
											src={image.immagine_url} 
											alt={image.alt_text || `Meraki foto ${i + 1}`} 
											loading="lazy" 
										/>
										<div class="overlay">
											<span>Visualizza</span>
										</div>
									</button>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</section>
</div>

<!-- Modal per foto ingrandita -->
{#if selectedImage}
	<div class="modal" on:click={closeImage} role="dialog" aria-modal="true">
		<button class="close-button" on:click={closeImage} aria-label="Chiudi">✕</button>
		<img src={selectedImage} alt="Foto ingrandita" on:click|stopPropagation />
	</div>
{/if}

<style>
	.page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f8f9f7 0%, #f0f2ed 100%);
	}

	.page-header {
		background: var(--bianco);
		padding: 1.5rem 1.5rem 2rem;
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
		text-align: center;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 1.5rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		text-decoration: none;
		border-radius: 50px;
		font-weight: 600;
		font-size: 0.95rem;
		transition: all 0.3s ease;
		margin-bottom: 1.5rem;
	}

	.back-button:hover {
		background: var(--verde-light);
		transform: translateX(-3px);
	}

	.page-title {
		font-size: 2.8rem;
		color: var(--verde-meraki);
		margin: 0;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.page-subtitle {
		color: var(--grigio-scuro);
		font-size: 1.1rem;
		margin: 0.5rem 0 0;
		opacity: 0.8;
	}

	/* Theme Navigation */
	.theme-nav {
		background: var(--bianco);
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 0;
	}

	.theme-nav-inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 1.5rem;
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.theme-nav-inner::-webkit-scrollbar {
		display: none;
	}

	.theme-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 1.4rem;
		background: transparent;
		border: 2px solid var(--grigio);
		border-radius: 30px;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--grigio-scuro);
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.25s ease;
	}

	.theme-btn:hover {
		border-color: var(--verde-meraki);
		color: var(--verde-meraki);
		transform: translateY(-2px);
	}

	.theme-btn.active {
		background: var(--verde-meraki);
		border-color: var(--verde-meraki);
		color: var(--bianco);
		box-shadow: 0 4px 12px rgba(21, 67, 21, 0.25);
	}

	.theme-btn .count {
		background: rgba(0, 0, 0, 0.08);
		padding: 0.2rem 0.6rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.theme-btn.active .count {
		background: rgba(255, 255, 255, 0.25);
	}

	/* Content */
	.content-section {
		padding: 2.5rem 1rem 4rem;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Theme Sections */
	.theme-section {
		margin-bottom: 3rem;
		animation: fadeInUp 0.5s ease-out backwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.theme-header {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--verde-meraki);
	}

	.theme-title {
		font-size: 1.8rem;
		color: var(--verde-meraki);
		margin: 0;
		font-weight: 700;
	}

	.theme-description {
		color: var(--grigio-scuro);
		font-size: 1rem;
		margin: 0.5rem 0 0;
		opacity: 0.8;
	}

	/* Masonry Grid */
	.gallery-masonry {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.gallery-masonry {
			grid-template-columns: repeat(3, 1fr);
			gap: 1rem;
		}
	}

	@media (min-width: 1024px) {
		.gallery-masonry {
			grid-template-columns: repeat(4, 1fr);
			gap: 1.25rem;
		}
	}

	@media (min-width: 1280px) {
		.gallery-masonry {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	.gallery-item {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 12px;
		cursor: pointer;
		border: none;
		padding: 0;
		background: var(--bianco);
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		animation: scaleIn 0.4s ease-out backwards;
	}

	/* Variazione dimensioni per effetto interessante */
	.gallery-item:nth-child(5n+1) {
		grid-row: span 1;
	}

	@media (min-width: 640px) {
		.gallery-item:nth-child(7n+1) {
			grid-row: span 2;
			grid-column: span 1;
		}
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.gallery-item:hover {
		transform: translateY(-5px) scale(1.02);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.4s ease;
	}

	.gallery-item:hover img {
		transform: scale(1.08);
	}

	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(21, 67, 21, 0.85) 0%, rgba(21, 67, 21, 0.65) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.gallery-item:hover .overlay {
		opacity: 1;
	}

	.overlay span {
		color: var(--bianco);
		font-weight: 600;
		font-size: 0.95rem;
		transform: translateY(8px);
		transition: transform 0.3s ease;
		padding: 0.5rem 1.2rem;
		border: 2px solid rgba(255, 255, 255, 0.5);
		border-radius: 20px;
	}

	.gallery-item:hover .overlay span {
		transform: translateY(0);
	}

	/* Modal */
	.modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 2rem;
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal img {
		max-width: 100%;
		max-height: 90vh;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: zoomIn 0.3s ease-out;
	}

	@keyframes zoomIn {
		from {
			transform: scale(0.85);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.close-button {
		position: absolute;
		top: 2rem;
		right: 2rem;
		width: 48px;
		height: 48px;
		background: var(--bianco);
		color: var(--nero);
		border: none;
		border-radius: 50%;
		font-size: 1.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.close-button:hover {
		background: var(--verde-meraki);
		color: var(--bianco);
		transform: rotate(90deg) scale(1.1);
	}

	/* Loading & Empty States */
	.loading-state {
		text-align: center;
		padding: 5rem 2rem;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid rgba(21, 67, 21, 0.15);
		border-top-color: var(--verde-meraki);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		margin: 0 auto 1.5rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-state p {
		color: var(--grigio-scuro);
		font-size: 1rem;
	}

	.empty-gallery {
		text-align: center;
		padding: 5rem 2rem;
		background: var(--bianco);
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.empty-gallery p {
		color: var(--grigio-scuro);
		font-size: 1.1rem;
	}

	@media (min-width: 768px) {
		.page-title {
			font-size: 3.2rem;
		}
		
		.page-header {
			padding: 2rem 2rem 2.5rem;
		}
	}
</style>
