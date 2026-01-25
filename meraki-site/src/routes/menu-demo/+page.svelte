<script>
	import { ArrowRight, Layers, LayoutGrid, Navigation, ListFilter, Home } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Demo Menu - Scegli il Layout | Meraki</title>
</svelte:head>

<div class="demo-page">
	<header>
		<a href="/" class="logo">MERAKI</a>
		<a href="/" class="home-link">
			<Home size={18} />
			Torna al sito
		</a>
	</header>

	<main>
		<div class="intro">
			<h1>🎨 Demo Layout Menu</h1>
			<p>Abbiamo preparato 4 proposte per il nuovo menu digitale. <br/>
			<strong>Guardale tutte e dicci quale preferite!</strong></p>
		</div>

		<div class="options-grid">
			<!-- V1 -->
			<a href="/menu-v1" class="option-card v1">
				<div class="card-header">
					<span class="version">V1</span>
					<Layers size={28} />
				</div>
				<h2>Tab + Chips</h2>
				<p>3 tab grandi per le macro-categorie, poi chips scrollabili per le sottocategorie.</p>
				<ul class="pros">
					<li>✓ Navigazione chiara a 2 livelli</li>
					<li>✓ Simile al menu attuale, evoluto</li>
					<li>✓ Sottocategorie sempre visibili</li>
				</ul>
				<div class="card-cta">
					<span>Prova questa versione</span>
					<ArrowRight size={20} />
				</div>
			</a>

			<!-- V2 -->
			<a href="/menu-v2" class="option-card v2">
				<div class="card-header">
					<span class="version">V2</span>
					<LayoutGrid size={28} />
				</div>
				<h2>Accordion</h2>
				<p>Le 3 macro-categorie si espandono come un fisarmonica mostrando le sezioni interne.</p>
				<ul class="pros">
					<li>✓ Tutto visibile a colpo d'occhio</li>
					<li>✓ Zero tap per vedere sottocategorie</li>
					<li>✓ Stile "menu cartaceo"</li>
				</ul>
				<div class="card-cta">
					<span>Prova questa versione</span>
					<ArrowRight size={20} />
				</div>
			</a>

			<!-- V3 -->
			<a href="/menu-v3" class="option-card v3">
				<div class="card-header">
					<span class="version">V3</span>
					<Navigation size={28} />
				</div>
				<h2>Sticky Sections</h2>
				<p>Stile Deliveroo/JustEat: header fissi, sezioni che scorrono con titoli sempre visibili.</p>
				<ul class="pros">
					<li>✓ UX premium e moderna</li>
					<li>✓ L'utente "scopre" scorrendo</li>
					<li>✓ Pills per salto rapido</li>
				</ul>
				<div class="card-cta">
					<span>Prova questa versione</span>
					<ArrowRight size={20} />
				</div>
			</a>

			<!-- V4 -->
			<a href="/menu-v4" class="option-card v4">
				<div class="card-header">
					<span class="version">V4</span>
					<ListFilter size={28} />
				</div>
				<h2>Tab + Dropdown</h2>
				<p>Tab per macro-categorie + dropdown filtro per le sottocategorie. Compatto e funzionale.</p>
				<ul class="pros">
					<li>✓ Interfaccia pulita e minimal</li>
					<li>✓ Filtri potenti con conteggio</li>
					<li>✓ Grid moderna per i prodotti</li>
				</ul>
				<div class="card-cta">
					<span>Prova questa versione</span>
					<ArrowRight size={20} />
				</div>
			</a>
		</div>

		<div class="comparison-note">
			<h3>💡 Come scegliere?</h3>
			<p>Provate ogni versione sul vostro telefono. Pensate a cosa cercano di solito i vostri clienti:</p>
			<ul>
				<li><strong>V1/V4</strong> → Per chi sa già cosa vuole e cerca velocemente</li>
				<li><strong>V2</strong> → Per chi vuole esplorare tutto il menu sezione per sezione</li>
				<li><strong>V3</strong> → Per un'esperienza moderna stile app di delivery</li>
			</ul>
		</div>
	</main>

	<footer>
		<p>Fatto con ❤️ per <strong>Meraki Lainate</strong></p>
	</footer>
</div>

<style>
	.demo-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: white;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}

	.logo {
		font-family: 'Playfair Display', serif;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--verde-meraki);
		text-decoration: none;
	}

	.home-link {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--verde-meraki);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9rem;
	}

	main {
		flex: 1;
		padding: 2rem 1rem;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.intro {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.intro h1 {
		font-size: 2rem;
		color: var(--verde-meraki);
		margin-bottom: 0.75rem;
	}

	.intro p {
		color: var(--grigio-scuro);
		font-size: 1.1rem;
		line-height: 1.6;
	}

	.options-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.options-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.options-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.option-card {
		background: white;
		border-radius: 20px;
		padding: 1.5rem;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		border: 2px solid transparent;
	}

	.option-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 40px rgba(21, 67, 21, 0.15);
	}

	.option-card.v1 { border-color: var(--verde-meraki); }
	.option-card.v2 { border-color: #e67e22; }
	.option-card.v3 { border-color: #9b59b6; }
	.option-card.v4 { border-color: #3498db; }

	.option-card.v1:hover { background: linear-gradient(135deg, white 0%, rgba(21, 67, 21, 0.05) 100%); }
	.option-card.v2:hover { background: linear-gradient(135deg, white 0%, rgba(230, 126, 34, 0.05) 100%); }
	.option-card.v3:hover { background: linear-gradient(135deg, white 0%, rgba(155, 89, 182, 0.05) 100%); }
	.option-card.v4:hover { background: linear-gradient(135deg, white 0%, rgba(52, 152, 219, 0.05) 100%); }

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.version {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.3rem 0.8rem;
		border-radius: 20px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.v1 .version { background: var(--verde-meraki); color: white; }
	.v2 .version { background: #e67e22; color: white; }
	.v3 .version { background: #9b59b6; color: white; }
	.v4 .version { background: #3498db; color: white; }

	.v1 .card-header { color: var(--verde-meraki); }
	.v2 .card-header { color: #e67e22; }
	.v3 .card-header { color: #9b59b6; }
	.v4 .card-header { color: #3498db; }

	.option-card h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.4rem;
		margin-bottom: 0.75rem;
		color: var(--nero);
	}

	.option-card > p {
		color: var(--grigio-scuro);
		font-size: 0.95rem;
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.pros {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
		flex: 1;
	}

	.pros li {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--grigio);
	}

	.pros li:last-child {
		border-bottom: none;
	}

	.card-cta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.9rem 1rem;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.v1 .card-cta { background: rgba(21, 67, 21, 0.1); color: var(--verde-meraki); }
	.v2 .card-cta { background: rgba(230, 126, 34, 0.1); color: #e67e22; }
	.v3 .card-cta { background: rgba(155, 89, 182, 0.1); color: #9b59b6; }
	.v4 .card-cta { background: rgba(52, 152, 219, 0.1); color: #3498db; }

	.option-card:hover .card-cta {
		padding-right: 0.5rem;
	}

	.v1:hover .card-cta { background: var(--verde-meraki); color: white; }
	.v2:hover .card-cta { background: #e67e22; color: white; }
	.v3:hover .card-cta { background: #9b59b6; color: white; }
	.v4:hover .card-cta { background: #3498db; color: white; }

	.comparison-note {
		margin-top: 3rem;
		padding: 1.5rem;
		background: white;
		border-radius: 16px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}

	.comparison-note h3 {
		font-size: 1.2rem;
		color: var(--verde-meraki);
		margin-bottom: 0.75rem;
	}

	.comparison-note > p {
		color: var(--grigio-scuro);
		margin-bottom: 1rem;
	}

	.comparison-note ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.comparison-note li {
		padding: 0.5rem 0;
		font-size: 0.95rem;
		color: var(--grigio-scuro);
	}

	footer {
		text-align: center;
		padding: 1.5rem;
		color: var(--grigio-scuro);
		font-size: 0.9rem;
	}

	footer strong {
		color: var(--verde-meraki);
	}
</style>
