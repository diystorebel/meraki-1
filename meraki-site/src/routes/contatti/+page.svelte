<script>
	import { Home, MapPin, Phone, Clock, Facebook, Instagram } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Orari & Contatti - Meraki</title>
</svelte:head>

<div class="page">
	<!-- Header -->
	<header class="page-header">
		<a href="/" class="back-button">
			<Home size={20} />
			Home
		</a>
		<h1 class="page-title">Orari & Contatti</h1>
	</header>

	<!-- Content -->
	<section class="content-section">
		<div class="container">
			<!-- Orari -->
			<div class="section-card">
				<h2 class="section-title">
					<Clock size={32} />
					Orari di Apertura
				</h2>
				<div class="orari-table-wrapper">
					<table class="orari-table">
						<thead>
							<tr>
								<th>Giorno</th>
								<th>Orario</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="giorno">Lunedì</td>
								<td class="orario">18:00 - 01:00</td>
							</tr>
							<tr>
								<td class="giorno">Martedì</td>
								<td class="orario">18:00 - 01:00</td>
							</tr>
							<tr>
								<td class="giorno">Mercoledì</td>
								<td class="orario">18:00 - 01:00</td>
							</tr>
							<tr>
								<td class="giorno">Giovedì</td>
								<td class="orario">18:00 - 01:00</td>
							</tr>
							<tr class="highlight">
								<td class="giorno">Venerdì</td>
								<td class="orario">18:00 - 02:00</td>
							</tr>
							<tr class="highlight">
								<td class="giorno">Sabato</td>
								<td class="orario">18:00 - 02:00</td>
							</tr>
							<tr>
								<td class="giorno">Domenica</td>
								<td class="orario">18:00 - 01:00</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Contatti -->
			<div class="section-card">
				<h2 class="section-title">
					<MapPin size={32} />
					Come Raggiungerci
				</h2>

				<div class="contact-grid">
					<!-- Indirizzo -->
					<a href="https://maps.app.goo.gl/jU1X7fY5f6Np1udZ6" target="_blank" rel="noopener" class="contact-card">
						<div class="contact-icon">
							<MapPin size={28} />
						</div>
						<div class="contact-info">
							<h3>Indirizzo</h3>
							<p>Via Re Umberto I°, 36A<br/>20045 Lainate (MI)</p>
						</div>
						<span class="action-badge">
							<MapPin size={14} />
							Apri Maps
						</span>
					</a>

					<!-- Telefono -->
					<a href="tel:+393516327144" class="contact-card">
						<div class="contact-icon">
							<Phone size={28} />
						</div>
						<div class="contact-info">
							<h3>Telefono</h3>
							<p>+39 351 6327144</p>
						</div>
						<span class="action-badge">
							<Phone size={14} />
							Chiama
						</span>
					</a>
				</div>
			</div>

			<!-- Social -->
			<div class="section-card">
				<h2 class="section-title">
					Seguici sui Social
				</h2>
				<div class="social-grid">
					<a href="https://www.facebook.com/meraki.lainate" target="_blank" rel="noopener" class="social-card">
						<Facebook size={32} />
						<span>Facebook</span>
					</a>
					<a href="https://instagram.com/_u/meraki.lainate/" target="_blank" rel="noopener" class="social-card">
						<Instagram size={32} />
						<span>Instagram</span>
					</a>
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
		padding: 2rem 1rem 3rem;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.section-card {
		background: var(--bianco);
		border-radius: 24px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: var(--verde-meraki);
		font-size: 1.8rem;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--grigio);
	}

	/* Orari - Tabella Classica */
	.orari-table-wrapper {
		overflow-x: auto;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.orari-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bianco);
	}

	.orari-table thead {
		background: var(--verde-meraki);
		color: var(--bianco);
	}

	.orari-table th {
		padding: 1rem;
		text-align: left;
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.orari-table tbody tr {
		border-bottom: 1px solid var(--grigio);
		transition: background 0.2s ease;
	}

	.orari-table tbody tr:last-child {
		border-bottom: none;
	}

	.orari-table tbody tr:hover {
		background: var(--grigio-chiaro);
	}

	.orari-table tbody tr.highlight {
		background: linear-gradient(135deg, rgba(21, 67, 21, 0.1) 0%, rgba(21, 67, 21, 0.05) 100%);
		font-weight: 600;
	}

	.orari-table tbody tr.highlight:hover {
		background: linear-gradient(135deg, rgba(21, 67, 21, 0.15) 0%, rgba(21, 67, 21, 0.1) 100%);
	}

	.orari-table td {
		padding: 1.2rem 1rem;
	}

	.orari-table td.giorno {
		font-weight: 600;
		color: var(--nero);
		font-size: 1rem;
	}

	.orari-table td.orario {
		color: var(--grigio-scuro);
		font-size: 1rem;
		font-family: 'Courier New', monospace;
		letter-spacing: 0.05em;
	}

	/* Scurisce le righe non weekend */
	.orari-table tbody tr:not(.highlight) td.giorno {
		color: #1a1a1a;
	}

	.orari-table tbody tr:not(.highlight) td.orario {
		color: #4a4a4a;
	}

	.orari-table tbody tr.highlight td.giorno {
		color: var(--verde-meraki);
	}

	.orari-table tbody tr.highlight td.orario {
		color: var(--verde-meraki);
		font-weight: 600;
	}

	@media (max-width: 640px) {
		.orari-table th,
		.orari-table td {
			padding: 0.8rem;
			font-size: 0.95rem;
		}
	}

	/* Contatti */
	.contact-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.contact-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.contact-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem;
		background: var(--grigio-chiaro);
		border-radius: 16px;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
		gap: 1rem;
		border: 2px solid transparent;
	}

	.contact-card:hover {
		transform: translateY(-5px);
		border-color: var(--verde-meraki);
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.15);
	}

	.contact-icon {
		width: 64px;
		height: 64px;
		background: var(--verde-meraki);
		color: var(--bianco);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.contact-info h3 {
		font-size: 1.3rem;
		color: var(--verde-meraki);
		margin-bottom: 0.5rem;
	}

	.contact-info p {
		color: var(--grigio-scuro);
		line-height: 1.6;
		margin: 0;
	}

	.action-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.contact-card:hover .action-badge {
		transform: scale(1.05);
	}

	/* Social */
	.social-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.social-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
		padding: 1.5rem;
		background: var(--grigio-chiaro);
		border-radius: 16px;
		text-decoration: none;
		color: var(--verde-meraki);
		font-weight: 600;
		transition: all 0.3s ease;
		border: 2px solid transparent;
	}

	.social-card:hover {
		background: var(--verde-meraki);
		color: var(--bianco);
		transform: translateY(-5px);
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.2);
	}

	@media (min-width: 768px) {
		.section-card {
			padding: 3rem;
		}

		.page-title {
			font-size: 3rem;
		}
	}
</style>

