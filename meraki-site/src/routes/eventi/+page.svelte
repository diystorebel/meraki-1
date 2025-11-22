<script>
	import { onMount } from 'svelte';
	import { Home, Calendar, Clock, X } from 'lucide-svelte';
	import { eventiStore, loadEventi, isEventoAttivo } from '$lib/stores/eventiStore';

	let zoomedImage = null;

	onMount(() => {
		loadEventi();
	});

	function formatData(isoDate) {
		const date = new Date(isoDate);
		return date.toLocaleDateString('it-IT', { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	}

	function openImageZoom(imageUrl) {
		zoomedImage = imageUrl;
	}

	function closeImageZoom() {
		zoomedImage = null;
	}

	$: eventi = $eventiStore;
</script>

<svelte:head>
	<title>Eventi - Meraki</title>
</svelte:head>

<div class="page">
	<!-- Header -->
	<header class="page-header">
		<a href="/" class="back-button">
			<Home size={20} />
			Home
		</a>
		<h1 class="page-title">Eventi</h1>
	</header>

	<!-- Eventi List -->
	<section class="content-section">
		<div class="container">
			{#if eventi.length > 0}
				<div class="eventi-grid">
					{#each eventi as evento, i}
						<article class="evento-card" style="animation-delay: {i * 0.1}s">
							<div class="evento-image" on:click={() => openImageZoom(evento.immagine_url || '/Hero-Image-2-1.webp')} role="button" tabindex="0" on:keypress={(e) => e.key === 'Enter' && openImageZoom(evento.immagine_url || '/Hero-Image-2-1.webp')}>
								<img src={evento.immagine_url || '/Hero-Image-2-1.webp'} alt={evento.titolo} />
								{#if isEventoAttivo(evento)}
									<div class="news-badge">NEWS</div>
								{/if}
								<div class="evento-badge">
									<Calendar size={18} />
								</div>
								<div class="zoom-hint">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
										<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
									</svg>
								</div>
							</div>
							<div class="evento-content">
								<h2 class="evento-title">{evento.titolo}</h2>
								<div class="evento-meta">
									<div class="meta-item">
										<Calendar size={18} />
										<span>{formatData(evento.data_inizio)}</span>
									</div>
									{#if evento.orario}
										<div class="meta-item">
											<Clock size={18} />
											<span>{evento.orario}</span>
										</div>
									{/if}
								</div>
								<p class="evento-description">{evento.descrizione}</p>
								<a href="tel:+393516327144" class="evento-cta">
									Prenota Ora
								</a>
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<Calendar size={64} />
					<h2>Nessun evento in programma</h2>
					<p>Seguici sui social per non perdere i prossimi eventi!</p>
					<div class="social-links">
						<a href="https://www.facebook.com/meraki.lainate" target="_blank" rel="noopener">
							Facebook
						</a>
						<a href="https://instagram.com/_u/meraki.lainate/" target="_blank" rel="noopener">
							Instagram
						</a>
					</div>
				</div>
			{/if}
		</div>
	</section>
</div>

<!-- Image Zoom Modal -->
{#if zoomedImage}
	<div class="zoom-modal" on:click={closeImageZoom} role="button" tabindex="0" on:keypress={(e) => e.key === 'Escape' && closeImageZoom()}>
		<button class="zoom-close" on:click={closeImageZoom}>
			<X size={32} />
		</button>
		<img src={zoomedImage} alt="Evento" class="zoomed-image" on:click|stopPropagation />
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
		max-width: 1200px;
		margin: 0 auto;
	}

	.eventi-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	@media (min-width: 768px) {
		.eventi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.eventi-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 2.5rem;
		}
	}

	.evento-card {
		background: var(--bianco);
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		animation: fadeInUp 0.5s ease-out backwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.evento-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 40px rgba(21, 67, 21, 0.15);
	}

	.evento-image {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		cursor: zoom-in;
	}

	.evento-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.evento-card:hover .evento-image img {
		transform: scale(1.1);
	}

	.zoom-hint {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		width: 40px;
		height: 40px;
		background: rgba(21, 67, 21, 0.9);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		z-index: 2;
	}

	.evento-image:hover .zoom-hint {
		opacity: 1;
	}

	.news-badge {
		position: absolute;
		top: 1rem;
		left: 1rem;
		padding: 0.5rem 1rem;
		background: #FF4444;
		color: var(--bianco);
		font-weight: 800;
		font-size: 0.9rem;
		letter-spacing: 0.1em;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
		animation: pulse 2s ease-in-out infinite;
		z-index: 2;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 6px 20px rgba(255, 68, 68, 0.6);
		}
	}

	.evento-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 48px;
		height: 48px;
		background: var(--verde-meraki);
		color: var(--bianco);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 1;
	}

	.evento-content {
		padding: 2rem;
	}

	.evento-title {
		font-size: 1.8rem;
		color: var(--verde-meraki);
		margin-bottom: 1rem;
	}

	.evento-meta {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		margin-bottom: 1.5rem;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: var(--grigio-scuro);
		font-size: 0.95rem;
	}

	.meta-item svg {
		flex-shrink: 0;
	}

	.evento-description {
		color: var(--nero);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.evento-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 2rem;
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		text-decoration: none;
		border-radius: 50px;
		font-weight: 600;
		transition: all 0.3s ease;
		width: 100%;
	}

	.evento-cta:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.3);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bianco);
		border-radius: 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.empty-state svg {
		color: var(--verde-meraki);
		opacity: 0.5;
		margin-bottom: 1.5rem;
	}

	.empty-state h2 {
		font-size: 2rem;
		color: var(--verde-meraki);
		margin-bottom: 1rem;
	}

	.empty-state p {
		font-size: 1.1rem;
		color: var(--grigio-scuro);
		margin-bottom: 2rem;
	}

	.social-links {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.social-links a {
		padding: 0.8rem 1.5rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		text-decoration: none;
		border-radius: 50px;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.social-links a:hover {
		background: var(--verde-light);
		transform: translateY(-2px);
	}

	/* Image Zoom Modal */
	.zoom-modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		cursor: zoom-out;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.zoom-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 50px;
		height: 50px;
		background: rgba(255, 255, 255, 0.2);
		border: 2px solid white;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10000;
	}

	.zoom-close:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: rotate(90deg);
	}

	.zoomed-image {
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: zoomIn 0.3s ease;
		cursor: default;
	}

	@keyframes zoomIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (min-width: 768px) {
		.page-title {
			font-size: 3rem;
		}
	}
</style>

