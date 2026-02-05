<script>
	import { Home } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Chi Siamo - Meraki</title>
</svelte:head>

<div class="page">
	<!-- Header con Torna alla Home -->
	<header class="page-header">
		<a href="/" class="back-button">
			<Home size={20} />
			Home
		</a>
		<h1 class="page-title">Chi Siamo</h1>
	</header>

	<!-- Content -->
	<section class="content-section">
		<div class="container">
			<!-- Foto di gruppo -->
			<div class="hero-image">
				<img src="/foto_gruppo.jpg" alt="Team Meraki" width="640" height="360" />
			</div>

			<div class="content-card">
				<p class="lead">
					Meraki è una parola greca che tradotta letteralmente significa <strong>"essenza di noi stessi"</strong>.
				</p>
				<p>
					In realtà la traduzione vera e propria rappresenta un concetto non traducibile in italiano con una parola ma fa riferimento a quando qualcosa viene fatto con la propria anima, con creatività, impegno e molto amore, ed è proprio a partire da questi principi che abbiamo fondato il nostro bar.
				</p>
				<p>
					Ma meraki è molto di più! <strong>Meraki è famiglia, la NOSTRA famiglia.</strong>
				</p>
				<p>
					Impegno, creatività e passione sono elementi che ci distinguono e che ritroverete nel nostro locale.
				</p>
				<div class="highlight-box">
					<p>
						Vi aspettiamo tutti i giorni in via Re Umberto I°, 36a  20045 Lainate (MI).
					</p>
				</div>

				<!-- Ambiente Badge -->
				<div class="ambiente-badge">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
					</svg>
					<span>#MERAKIPERLAMBIENTE</span>
				</div>
			</div>
		</div>
	</section>
</div>

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
		padding: 2rem 1rem;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-image {
		width: 100%;
		margin-bottom: 2rem;
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
	}

	.hero-image img {
		width: 100%;
		height: auto;
		display: block;
	}

	.content-card {
		background: var(--bianco);
		border-radius: 24px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.lead {
		font-size: 1.2rem;
		font-weight: 500;
		color: var(--verde-meraki);
		margin-bottom: 1.5rem;
	}

	p {
		font-size: 1.05rem;
		line-height: 1.8;
		margin-bottom: 1.5rem;
		color: var(--nero);
	}

	.highlight-box {
		background: var(--grigio-chiaro);
		padding: 1.5rem;
		border-left: 4px solid var(--verde-meraki);
		border-radius: 12px;
		margin: 2rem 0;
	}

	.highlight-box p {
		margin: 0;
		font-style: italic;
		font-weight: 500;
	}

	.ambiente-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		border-radius: 16px;
		font-size: 1.3rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		margin-top: 2rem;
	}

	@media (min-width: 768px) {
		.content-card {
			padding: 3rem;
		}

		.page-title {
			font-size: 3rem;
		}
	}
</style>

