<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Cookie } from 'lucide-svelte';

	let showBanner = false;

	onMount(() => {
		// Controlla se l'utente ha già accettato/chiuso il banner
		const cookieConsent = localStorage.getItem('cookieConsent');
		if (!cookieConsent) {
			// Mostra il banner dopo un piccolo delay per non essere invasivo
			setTimeout(() => {
				showBanner = true;
			}, 1500);
		}
	});

	function acceptCookies() {
		localStorage.setItem('cookieConsent', 'accepted');
		showBanner = false;
	}
</script>

{#if showBanner}
	<div class="cookie-banner" transition:fly={{ y: 100, duration: 400 }}>
		<div class="cookie-content">
			<div class="cookie-icon">
				<Cookie size={20} strokeWidth={1.5} />
			</div>
			<div class="cookie-text">
				<p>
					Utilizziamo solo cookie tecnici necessari per il funzionamento del sito. 
					<a href="/cookie-policy" target="_blank">Scopri di più</a>
				</p>
			</div>
			<button class="cookie-btn" on:click={acceptCookies}>
				Ho capito
			</button>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9998;
		max-width: 600px;
		width: calc(100% - 2rem);
		margin: 0 auto;
	}

	.cookie-content {
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(10px);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 
			0 4px 20px rgba(0, 0, 0, 0.1),
			0 0 0 1px rgba(21, 67, 21, 0.1);
		border: 1px solid rgba(21, 67, 21, 0.15);
	}

	.cookie-icon {
		flex-shrink: 0;
		color: var(--verde-meraki);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cookie-text {
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.4;
		color: var(--grigio-scuro);
	}

	.cookie-text p {
		margin: 0;
	}

	.cookie-text a {
		color: var(--verde-meraki);
		text-decoration: underline;
		font-weight: 500;
		transition: color 0.2s;
	}

	.cookie-text a:hover {
		color: var(--verde-light);
	}

	.cookie-btn {
		flex-shrink: 0;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		padding: 0.5rem 1.25rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.cookie-btn:hover {
		background: var(--verde-light);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(21, 67, 21, 0.25);
	}

	.cookie-btn:active {
		transform: translateY(0);
	}

	/* Mobile: layout verticale più compatto */
	@media (max-width: 640px) {
		.cookie-content {
			flex-direction: column;
			text-align: center;
			padding: 1rem;
			gap: 0.75rem;
		}

		.cookie-icon {
			display: none;
		}

		.cookie-text {
			font-size: 0.8rem;
		}

		.cookie-btn {
			width: 100%;
			padding: 0.625rem 1rem;
		}
	}

	/* Tablet: mantieni layout orizzontale */
	@media (min-width: 641px) and (max-width: 768px) {
		.cookie-banner {
			max-width: 550px;
		}

		.cookie-content {
			padding: 1rem 1.15rem;
		}
	}
</style>
