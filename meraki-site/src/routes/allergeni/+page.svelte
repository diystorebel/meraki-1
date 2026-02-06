<script>
	// 14 allergeni obbligatori EU con icone e descrizioni (WebP ottimizzate)
	const ALLERGENI = [
		{ 
			id: 'glutine', 
			label: 'Glutine', 
			src: '/icone-allergeni/glutine.webp',
			description: 'Cereali contenenti glutine (grano, segale, orzo, avena, farro, kamut)'
		},
		{ 
			id: 'latticini', 
			label: 'Latte e derivati', 
			src: '/icone-allergeni/latticini.webp',
			description: 'Latte e prodotti a base di latte, incluso il lattosio'
		},
		{ 
			id: 'uova', 
			label: 'Uova', 
			src: '/icone-allergeni/uova.webp',
			description: 'Uova e prodotti a base di uova'
		},
		{ 
			id: 'pesce', 
			label: 'Pesce', 
			src: '/icone-allergeni/pesce.webp',
			description: 'Pesci e prodotti a base di pesce'
		},
		{ 
			id: 'crostacei', 
			label: 'Crostacei', 
			src: '/icone-allergeni/crostacei.webp',
			description: 'Crostacei e prodotti a base di crostacei'
		},
		{ 
			id: 'molluschi', 
			label: 'Molluschi', 
			src: '/icone-allergeni/molluschi.webp',
			description: 'Molluschi e prodotti a base di molluschi'
		},
		{ 
			id: 'arachidi', 
			label: 'Arachidi', 
			src: '/icone-allergeni/arachidi.webp',
			description: 'Arachidi e prodotti a base di arachidi'
		},
		{ 
			id: 'frutta_guscio', 
			label: 'Frutta a guscio', 
			src: '/icone-allergeni/frutta_guscio.webp',
			description: 'Mandorle, nocciole, noci, anacardi, pistacchi, noci macadamia, noci del Brasile, noci pecan'
		},
		{ 
			id: 'soia', 
			label: 'Soia', 
			src: '/icone-allergeni/soia.webp',
			description: 'Soia e prodotti a base di soia'
		},
		{ 
			id: 'sedano', 
			label: 'Sedano', 
			src: '/icone-allergeni/sedano.webp',
			description: 'Sedano e prodotti a base di sedano'
		},
		{ 
			id: 'senape', 
			label: 'Senape', 
			src: '/icone-allergeni/senape.webp',
			description: 'Senape e prodotti a base di senape'
		},
		{ 
			id: 'sesamo', 
			label: 'Sesamo', 
			src: '/icone-allergeni/sesamo.webp',
			description: 'Semi di sesamo e prodotti a base di semi di sesamo'
		},
		{ 
			id: 'solfiti', 
			label: 'Anidride solforosa e solfiti', 
			src: '/icone-allergeni/solfiti.webp',
			description: 'Anidride solforosa e solfiti in concentrazioni superiori a 10 mg/kg o 10 mg/l'
		},
		{ 
			id: 'lupini', 
			label: 'Lupini', 
			src: '/icone-allergeni/lupini.webp',
			description: 'Lupini e prodotti a base di lupini'
		}
	];
</script>

<svelte:head>
	<title>Allergeni - Meraki</title>
	<meta name="description" content="Lista degli allergeni presenti nei nostri prodotti. Informazioni secondo il Reg. UE 1169/2011." />
</svelte:head>

<div class="allergeni-page">
	<header class="header">
		<div class="container">
			<a href="/menu" class="back-button">← Torna al Menu</a>
		</div>
	</header>

	<div class="container">
		<h1>Informazioni sugli Allergeni</h1>
		<p class="intro">
			Di seguito trovi la legenda delle icone utilizzate nel nostro menu digitale per indicare la presenza di allergeni nei prodotti.
		</p>

		<!-- Disclaimer -->
		<div class="disclaimer">
			<strong>Importante:</strong> Le informazioni sugli allergeni sono indicate direttamente su ogni prodotto nel menu. 
			In caso di allergie o intolleranze alimentari, <strong>chiedi sempre conferma al nostro staff</strong> prima di ordinare.
		</div>

		<!-- Legenda Allergeni con icone -->
		<section class="legenda-section">
			<h2>Legenda Icone</h2>
			<p class="legenda-intro">I 14 allergeni soggetti a obbligo di dichiarazione (Reg. UE 1169/2011)</p>
			
			<div class="allergeni-list">
				{#each ALLERGENI as allergen}
					<div class="allergen-card">
						<div class="allergen-icon">
							<img src={allergen.src} alt={allergen.label} width="48" height="48" />
						</div>
						<div class="allergen-info">
							<h3>{allergen.label}</h3>
							<p>{allergen.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Footer -->
		<div class="footer-cta">
			<p>
				<strong>Per qualsiasi dubbio o necessità, non esitare a chiedere al nostro staff.</strong><br>
				La tua sicurezza è la nostra priorità.
			</p>
			<a href="tel:+393517318400" class="btn-call">
				Chiama per info
			</a>
		</div>
	</div>
</div>

<style>
	.allergeni-page {
		min-height: 100vh;
		background: var(--bianco);
		padding-bottom: 3rem;
	}

	.header {
		background: var(--verde-meraki);
		padding: 1rem 0;
		margin-bottom: 2rem;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.back-button {
		color: var(--bianco);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.3s ease;
	}

	.back-button:hover {
		opacity: 0.8;
	}

	h1 {
		font-size: 2rem;
		color: var(--verde-meraki);
		margin-bottom: 0.75rem;
	}

	.intro {
		font-size: 1rem;
		color: var(--grigio-scuro);
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.disclaimer {
		background: #fff3cd;
		border: 1px solid #ffc107;
		border-left: 4px solid #ffc107;
		padding: 1rem 1.2rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		font-size: 0.95rem;
		line-height: 1.6;
		color: #856404;
	}

	.legenda-section {
		margin-bottom: 2.5rem;
	}

	h2 {
		font-size: 1.4rem;
		color: var(--verde-meraki);
		margin-bottom: 0.5rem;
	}

	.legenda-intro {
		font-size: 0.9rem;
		color: var(--grigio-scuro);
		margin-bottom: 1.5rem;
	}

	.allergeni-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.allergen-card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: var(--grigio-chiaro);
		border-radius: 12px;
		border-left: 4px solid var(--verde-meraki);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.allergen-card:hover {
		transform: translateX(4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.allergen-icon {
		width: 64px;
		height: 64px;
		background: white;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.allergen-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.allergen-info {
		flex: 1;
	}

	.allergen-info h3 {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		color: var(--verde-meraki);
		margin: 0 0 0.25rem 0;
	}

	.allergen-info p {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		margin: 0;
		line-height: 1.5;
	}

	.footer-cta {
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
	}

	.footer-cta p {
		color: var(--bianco);
		margin: 0 0 1.25rem 0;
		font-size: 1rem;
		line-height: 1.6;
	}

	.btn-call {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 2rem;
		background: var(--bianco);
		color: var(--verde-meraki);
		text-decoration: none;
		border-radius: 12px;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.btn-call:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	@media (min-width: 600px) {
		h1 {
			font-size: 2.5rem;
		}

		.allergeni-list {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.allergen-card {
			flex-direction: column;
			text-align: center;
			padding: 1.5rem;
			border-left: none;
			border-top: 4px solid var(--verde-meraki);
		}

		.allergen-card:hover {
			transform: translateY(-4px);
		}

		.allergen-icon {
			width: 80px;
			height: 80px;
			margin: 0 auto;
		}

		.allergen-info h3 {
			font-size: 1.05rem;
		}
	}

	@media (min-width: 768px) {
		.container {
			padding: 0 2rem;
		}

		.header {
			padding: 1.5rem 0;
			margin-bottom: 3rem;
		}
	}
</style>
