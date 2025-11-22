<script>
	import { Home } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { galleryStore, loadGallery } from '$lib/stores/galleryStore.js';

	let selectedImage = null;
	let loading = true;

	onMount(async () => {
		await loadGallery();
		loading = false;
	});

	function openImage(imageUrl) {
		selectedImage = imageUrl;
	}

	function closeImage() {
		selectedImage = null;
	}
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
	</header>

	<!-- Gallery Grid -->
	<section class="content-section">
		<div class="container">
			{#if loading}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Caricamento gallery...</p>
				</div>
			{:else if $galleryStore.length === 0}
				<div class="empty-gallery">
					<p>Nessuna immagine nella gallery</p>
				</div>
			{:else}
				<div class="gallery-grid">
					{#each $galleryStore as image, i}
						<button 
							class="gallery-item" 
							on:click={() => openImage(image.immagine_url)}
							style="animation-delay: {i * 0.05}s"
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
			{/if}
		</div>
	</section>
</div>

<!-- Modal per foto ingrandita -->
{#if selectedImage}
	<div class="modal" on:click={closeImage}>
		<button class="close-button" on:click={closeImage}>✕</button>
		<img src={selectedImage} alt="Foto ingrandita" on:click|stopPropagation />
	</div>
{/if}

<style>
	.page {
		min-height: 100vh;
		background: var(--grigio-chiaro);
	}

	.page-header {
		background: var(--bianco);
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		position: sticky;
		top: 0;
		z-index: 100;
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
		margin-bottom: 1rem;
	}

	.back-button:hover {
		background: var(--verde-light);
		transform: translateX(-3px);
	}

	.page-title {
		font-size: 2.5rem;
		color: var(--verde-meraki);
		margin: 0;
		text-align: center;
	}

	.content-section {
		padding: 2rem 1rem 3rem;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.gallery-grid {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 1.5rem;
		}
	}

	.gallery-item {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 16px;
		cursor: pointer;
		border: none;
		padding: 0;
		background: var(--bianco);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		animation: fadeInScale 0.4s ease-out backwards;
	}

	@keyframes fadeInScale {
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
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(21, 67, 21, 0.85) 0%, rgba(21, 67, 21, 0.7) 100%);
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
		font-size: 1.1rem;
		transform: translateY(10px);
		transition: transform 0.3s ease;
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
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal img {
		max-width: 100%;
		max-height: 90vh;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: zoomIn 0.3s ease-out;
	}

	@keyframes zoomIn {
		from {
			transform: scale(0.8);
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
		padding: 4rem 2rem;
	}

	.spinner {
		width: 60px;
		height: 60px;
		border: 5px solid rgba(21, 67, 21, 0.2);
		border-top-color: var(--verde-meraki);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 1.5rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-state p {
		color: var(--grigio-scuro);
		font-size: 1.1rem;
	}

	.empty-gallery {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bianco);
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.empty-gallery p {
		color: var(--grigio-scuro);
		font-size: 1.2rem;
	}

	@media (min-width: 768px) {
		.page-title {
			font-size: 3rem;
		}
	}
</style>

