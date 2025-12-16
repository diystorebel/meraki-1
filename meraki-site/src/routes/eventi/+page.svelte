<script>
	import { onMount } from 'svelte';
	import { Home, Calendar, Clock, X } from 'lucide-svelte';
	import { eventiStore, loadEventi, getStatoEvento, getBadgeText } from '$lib/stores/eventiStore';

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
						{@const badgeText = getBadgeText(evento)}
						{@const stato = getStatoEvento(evento)}
						{@const dataFormattata = new Date(evento.data_inizio).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).toUpperCase()}
						<article class="evento-card" style="animation-delay: {i * 0.1}s">
							<!-- Immagine con overlay gradient -->
							<div class="evento-image" on:click={() => openImageZoom(evento.immagine_url || '/Hero-Image-2-1.webp')} role="button" tabindex="0" on:keypress={(e) => e.key === 'Enter' && openImageZoom(evento.immagine_url || '/Hero-Image-2-1.webp')}>
								<img src={evento.immagine_url || '/Hero-Image-2-1.webp'} alt={evento.titolo} />
								<div class="image-overlay"></div>
								
								<!-- Badge stato in alto a sinistra -->
								{#if badgeText}
									<div class="stato-badge" class:in-corso={stato === 'in_corso'} class:in-arrivo={stato === 'in_arrivo'}>{badgeText}</div>
								{/if}
								
								<!-- Data box in alto a destra -->
								<div class="data-box">
									<span class="data-giorno">{dataFormattata.split(' ')[0]}</span>
									<span class="data-mese">{dataFormattata.split(' ')[1]}</span>
								</div>
							</div>
							
							<!-- Contenuto -->
							<div class="evento-content">
								<h2 class="evento-title">{evento.titolo}</h2>
								
								{#if evento.orario}
									<div class="evento-orario">
										<Clock size={14} />
										<span>{evento.orario}</span>
									</div>
								{/if}
								
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
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeInUp 0.5s ease-out backwards;
		display: flex;
		flex-direction: column;
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
		transform: translateY(-6px);
		box-shadow: 0 16px 48px rgba(21, 67, 21, 0.12);
	}

	/* Immagine con overlay */
	.evento-image {
		position: relative;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		cursor: zoom-in;
	}

	.evento-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			rgba(0, 0, 0, 0.1) 0%,
			transparent 40%,
			transparent 60%,
			rgba(0, 0, 0, 0.15) 100%
		);
		pointer-events: none;
	}

	.evento-card:hover .evento-image img {
		transform: scale(1.06);
	}

	/* Badge stato */
	.stato-badge {
		position: absolute;
		top: 0.8rem;
		left: 0.8rem;
		padding: 0.35rem 0.7rem;
		color: var(--bianco);
		font-weight: 700;
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		border-radius: 6px;
		animation: badgePulse 2.5s ease-in-out infinite;
		z-index: 3;
		text-transform: uppercase;
	}

	.stato-badge.in-corso {
		background: #166534;
		box-shadow: 0 2px 8px rgba(22, 101, 52, 0.4);
	}

	.stato-badge.in-arrivo {
		background: #ea580c;
		box-shadow: 0 2px 8px rgba(234, 88, 12, 0.4);
	}

	@keyframes badgePulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.05); opacity: 0.95; }
	}

	/* Data box */
	.data-box {
		position: absolute;
		top: 0.8rem;
		right: 0.8rem;
		background: var(--bianco);
		border-radius: 10px;
		padding: 0.5rem 0.7rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 3;
		min-width: 48px;
	}

	.data-giorno {
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--verde-meraki);
		line-height: 1;
	}

	.data-mese {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--grigio-scuro);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}

	/* Contenuto */
	.evento-content {
		padding: 1.4rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.evento-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--verde-meraki);
		margin: 0 0 0.6rem 0;
		line-height: 1.2;
	}

	.evento-orario {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--grigio-scuro);
		font-size: 0.85rem;
		font-weight: 500;
		margin-bottom: 0.8rem;
	}

	.evento-orario svg {
		color: var(--verde-meraki);
		opacity: 0.7;
	}

	.evento-description {
		color: #555;
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0 0 1.2rem 0;
	}

	.evento-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.8rem 1.5rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		text-decoration: none;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.3s ease;
		margin-top: auto;
	}

	.evento-cta:hover {
		background: var(--verde-light);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(21, 67, 21, 0.25);
	}

	@media (min-width: 768px) {
		.evento-content {
			padding: 1.6rem 1.8rem 1.8rem;
		}

		.evento-title {
			font-size: 1.7rem;
		}

		.data-giorno {
			font-size: 1.6rem;
		}
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

