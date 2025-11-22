<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { Menu, Users, Clock, MapPin, Image, Calendar } from 'lucide-svelte';
	import { loadEventiAttivi } from '$lib/stores/eventiStore';

	let showSplash = false;
	let showDashboard = false;
	let hasEventiAttivi = false;

	onMount(async () => {
		// Controlla se ci sono eventi attivi
		const eventiAttivi = await loadEventiAttivi();
		hasEventiAttivi = eventiAttivi.length > 0;

		// Splash screen solo al primo ingresso nella sessione
		const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
		
		if (!hasSeenSplash) {
			showSplash = true;
			sessionStorage.setItem('hasSeenSplash', 'true');
			
			// Splash screen per 2.5 secondi
			setTimeout(() => {
				showSplash = false;
				setTimeout(() => {
					showDashboard = true;
				}, 300);
			}, 2500);
		} else {
			// Mostra direttamente la dashboard
			showDashboard = true;
		}
	});
</script>

<svelte:head>
	<title>Meraki - L'essenza di noi stessi</title>
</svelte:head>

<!-- Splash Screen -->
{#if showSplash}
	<div class="splash-screen" transition:fade={{ duration: 500 }}>
		<div class="splash-content" transition:scale={{ duration: 800, delay: 200 }}>
			<h1 class="splash-title">MERAKI</h1>
			<p class="splash-subtitle">L'essenza di noi stessi</p>
		</div>
	</div>
{/if}

<!-- Dashboard -->
{#if showDashboard}
	<div class="dashboard" transition:fade={{ duration: 600 }}>
		<!-- Logo -->
		<div class="logo-container">
			<img src="/Logo-1.png" alt="Meraki Logo" class="dashboard-logo" />
		</div>

		<!-- Dashboard Grid -->
		<div class="dashboard-grid">
			<!-- Menu - Occupa entrambe le colonne -->
			<a href="/menu" class="dash-card dash-card-menu">
				<div class="card-icon">
					<Menu size={32} strokeWidth={1.5} class="icon-responsive" />
				</div>
				<h2>Menu</h2>
				<p>Scopri i nostri cocktails, drinks e food</p>
			</a>

			<!-- Chi Siamo -->
			<a href="/chi-siamo" class="dash-card">
				<div class="card-icon">
					<Users size={28} strokeWidth={1.5} class="icon-responsive" />
				</div>
				<h2>Chi Siamo</h2>
				<p>La nostra storia</p>
			</a>

			<!-- Orari e Contatti -->
			<a href="/contatti" class="dash-card">
				<div class="card-icon">
					<Clock size={28} strokeWidth={1.5} class="icon-responsive" />
				</div>
				<h2>Orari & Contatti</h2>
				<p>Vieni a trovarci</p>
			</a>

			<!-- Gallery -->
			<a href="/gallery" class="dash-card">
				<div class="card-icon">
					<Image size={28} strokeWidth={1.5} class="icon-responsive" />
				</div>
				<h2>Gallery</h2>
				<p>Le nostre foto</p>
			</a>

			<!-- Eventi -->
			<a href="/eventi" class="dash-card eventi-card">
				{#if hasEventiAttivi}
					<div class="news-badge-home">NEWS</div>
				{/if}
				<div class="card-icon">
					<Calendar size={28} strokeWidth={1.5} class="icon-responsive" />
				</div>
				<h2>Eventi</h2>
				<p>Cosa succede da noi</p>
			</a>
		</div>

		<!-- Footer Minimal -->
		<footer class="dash-footer">
			<p>© 2025 Meraki Lainate</p>
			<div class="footer-links">
				<a href="/cookie-policy">Cookie</a>
				<span>•</span>
				<a href="/privacy-policy">Privacy</a>
				<span>•</span>
				<a href="/lavora-con-noi">Lavora con Noi</a>
			</div>
		</footer>
	</div>
{/if}

<style>
	/* Splash Screen */
	.splash-screen {
		position: fixed;
		inset: 0;
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-dark) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.splash-content {
		text-align: center;
		color: var(--bianco);
	}

	.splash-title {
		font-size: clamp(3rem, 15vw, 8rem);
		font-weight: 700;
		letter-spacing: 0.15em;
		margin-bottom: 1rem;
		animation: fadeInUp 0.8s ease-out;
	}

	.splash-subtitle {
		font-size: clamp(1rem, 5vw, 2.5rem);
		font-style: italic;
		font-weight: 300;
		letter-spacing: 0.05em;
		opacity: 0.95;
		animation: fadeInUp 0.8s ease-out 0.3s both;
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

	/* Dashboard - MOBILE FIRST */
	.dashboard {
		min-height: 100vh;
		max-height: 100vh;
		background: var(--grigio-chiaro);
		padding: 1.5rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden; /* BLOCCA SCROLL */
	}

	/* Logo */
	.logo-container {
		width: 100%;
		max-width: 100%;
		text-align: center;
		margin-bottom: 2rem;
		padding: 0 1rem;
		animation: fadeInScale 0.8s ease-out 0.3s backwards;
	}

	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.dashboard-logo {
		width: 100%;
		max-width: 350px;
		height: auto;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
	}

	/* Grid - SEMPRE 2 COLONNE (anche mobile!) */
	.dashboard-grid {
		width: 100%;
		max-width: 100%;
		padding: 0 0.5rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		flex: 1;
	}

	/* Tablet/Desktop: più spazio */
	@media (min-width: 768px) {
		.dashboard {
			padding: 2rem 1.5rem 1.5rem;
		}

		.dashboard-grid {
			max-width: 900px;
			gap: 1.5rem;
			padding: 0;
		}

		.logo-container {
			margin-bottom: 3rem;
		}

		.dashboard-logo {
			max-width: 400px;
		}
	}

	@media (min-width: 1024px) {
		.dashboard {
			padding: 3rem 2rem 2rem;
		}

		.dashboard-grid {
			gap: 2rem;
		}

		.logo-container {
			margin-bottom: 4rem;
		}
	}

	/* Dashboard Cards - MOBILE FIRST */
	.dash-card {
		background: var(--bianco);
		border-radius: 16px;
		padding: 1.2rem 0.8rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 0.6rem;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		border: 3px solid transparent;
		min-height: 140px;
		position: relative;
		overflow: visible;
	}

	.news-badge-home {
		position: absolute;
		top: -8px;
		right: -8px;
		padding: 0.4rem 0.7rem;
		background: #FF4444;
		color: white;
		font-weight: 800;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
		animation: pulse 2s ease-in-out infinite;
		z-index: 10;
	}

	.dash-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.dash-card:hover::before {
		opacity: 0.05;
	}

	.dash-card:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 12px 40px rgba(21, 67, 21, 0.2);
		border-color: var(--verde-meraki);
	}

	/* Menu occupa sempre 2 colonne (anche mobile!) */
	.dash-card-menu {
		grid-column: 1 / -1;
		min-height: 180px;
	}

	/* Tablet/Desktop: più grandi */
	@media (min-width: 768px) {
		.dash-card-menu {
			min-height: 220px;
		}

		.dash-card {
			min-height: 180px;
			padding: 2rem;
		}
	}

	.card-icon {
		width: 50px;
		height: 50px;
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		position: relative;
		z-index: 1;
	}

	@media (min-width: 768px) {
		.card-icon {
			width: 80px;
			height: 80px;
		}
	}

	.dash-card:hover .card-icon {
		transform: scale(1.1) rotate(5deg);
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.3);
	}

	.dash-card h2 {
		font-size: 1.1rem;
		color: var(--verde-meraki);
		font-weight: 700;
		margin: 0;
		position: relative;
		z-index: 1;
		line-height: 1.2;
	}

	.dash-card p {
		font-size: 0.75rem;
		color: var(--grigio-scuro);
		margin: 0;
		position: relative;
		z-index: 1;
		line-height: 1.3;
	}

	@media (min-width: 768px) {
		.dash-card h2 {
			font-size: 1.8rem;
		}

		.dash-card p {
			font-size: 1rem;
		}

		.dash-card {
			padding: 2rem;
		}
	}

	.dash-card-menu h2 {
		font-size: 1.6rem;
	}

	.dash-card-menu p {
		font-size: 0.85rem;
	}

	.dash-card-menu .card-icon {
		width: 60px;
		height: 60px;
	}

	@media (min-width: 768px) {
		.dash-card-menu h2 {
			font-size: 2.2rem;
		}

		.dash-card-menu p {
			font-size: 1.1rem;
		}

		.dash-card-menu .card-icon {
			width: 100px;
			height: 100px;
		}

		.dash-card-menu {
			padding: 2rem;
		}
	}

	/* Footer */
	.dash-footer {
		text-align: center;
		padding: 2rem 1rem 1rem;
		color: var(--grigio-scuro);
		font-size: 0.9rem;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.dash-footer p {
		margin-bottom: 0.5rem;
	}

	.footer-links {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8rem;
		flex-wrap: wrap;
	}

	.footer-links a {
		color: var(--verde-meraki);
		text-decoration: none;
		font-weight: 500;
	}

	.footer-links a:hover {
		text-decoration: underline;
	}

</style>
