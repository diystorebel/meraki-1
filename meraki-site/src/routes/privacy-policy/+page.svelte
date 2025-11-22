<svelte:head>
	<title>Privacy Policy - Meraki</title>
</svelte:head>

<div class="policy-page">
	<header class="header">
		<div class="container">
			<a href="/" class="back-button">← Torna alla Home</a>
		</div>
	</header>

	<div class="container">
		<h1>Privacy Policy</h1>
		<p class="intro">Informativa sulla Privacy in conformità al GDPR (Regolamento UE 2016/679)</p>

		<section>
			<h2>Titolare del Trattamento</h2>
			<p>
				<strong>Meraki Bar</strong><br/>
				Indirizzo: Via Re Umberto I°, 36A - 20045 Lainate (MI)<br/>
				Email: info@merakilainate.it<br/>
				Tel: +39 351 6327144
			</p>
		</section>

		<section>
			<h2>Dati Personali Trattati</h2>
			<p>Questo sito raccoglie automaticamente i seguenti dati di navigazione:</p>
			<ul>
				<li>Indirizzo IP del dispositivo</li>
				<li>Tipo di browser utilizzato</li>
				<li>Orario e data di accesso</li>
				<li>Pagine visualizzate</li>
				<li>Durata della visita</li>
				<li>Referrer (sito di provenienza)</li>
			</ul>
			<p>Questi dati vengono raccolti automaticamente dai server web durante la navigazione del sito e sono utilizzati esclusivamente per finalità tecniche e statistiche anonime.</p>
		</section>

		<section>
			<h2>Finalità del Trattamento</h2>
			<p>I dati di navigazione sono trattati per le seguenti finalità:</p>
			<ul>
				<li>Garantire il corretto funzionamento del sito</li>
				<li>Analizzare le statistiche di accesso in forma anonima</li>
				<li>Mantenere la sicurezza tecnica della piattaforma</li>
				<li>Conformarsi agli obblighi di legge</li>
			</ul>
		</section>

		<section>
			<h2>Base Legale</h2>
			<p>Il trattamento è basato su interesse legittimo (mantenimento e sicurezza del servizio) secondo l'articolo 6(1)(f) del GDPR.</p>
		</section>

		<section>
			<h2>Conservazione dei Dati</h2>
			<p>I dati di navigazione vengono conservati per il periodo strettamente necessario al raggiungimento delle finalità sopra indicate, non eccedente 90 giorni.</p>
		</section>

		<section>
			<h2>Diritti dell'Interessato</h2>
			<p>Hai diritto di:</p>
			<ul>
				<li>Accedere ai tuoi dati personali</li>
				<li>Richiedere la rettifica di dati inesatti</li>
				<li>Richiedere la cancellazione dei tuoi dati</li>
				<li>Limitare il trattamento</li>
				<li>Opporti al trattamento</li>
				<li>Presentare un reclamo all'Autorità Garante per la Protezione dei Dati Personali</li>
			</ul>
			<p>Per esercitare questi diritti, contatta: info@merakilainate.it o +39 351 6327144</p>
		</section>

		<section>
			<h2>Terze Parti</h2>
			<p>Questo sito non condivide dati personali con terze parti, salvo quanto previsto dalla legge.</p>
		</section>

		<section>
			<h2>Modifiche alla Privacy Policy</h2>
			<p>Ci riserviamo il diritto di aggiornare questa informativa. Le modifiche entreranno in vigore dalla data di pubblicazione sul sito.</p>
			<p><strong>Data di ultimo aggiornamento:</strong> 22 novembre 2025</p>
		</section>
	</div>
</div>

<style>
	.policy-page {
		min-height: 100vh;
		background: var(--bianco);
		padding-bottom: 3rem;
		width: 100%;
		overflow-x: hidden;
	}

	@media (min-width: 768px) {
		.policy-page {
			padding-bottom: 4rem;
		}
	}

	.header {
		background: var(--verde-meraki);
		padding: 1rem 0;
		margin-bottom: 2rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.header {
			padding: 1.5rem 0;
			margin-bottom: 3rem;
		}
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.container {
			padding: 0 2rem;
		}
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
		font-size: 1.8rem;
		color: var(--verde-meraki);
		margin-bottom: 0.8rem;
	}

	@media (min-width: 768px) {
		h1 {
			font-size: 2.5rem;
			margin-bottom: 1rem;
		}
	}

	.intro {
		font-size: 0.95rem;
		color: var(--grigio-scuro);
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	@media (min-width: 768px) {
		.intro {
			font-size: 1.1rem;
			margin-bottom: 3rem;
		}
	}

	section {
		margin-bottom: 2rem;
	}

	@media (min-width: 768px) {
		section {
			margin-bottom: 2.5rem;
		}
	}

	h2 {
		font-size: 1.3rem;
		color: var(--verde-meraki);
		margin-bottom: 0.8rem;
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}
	}

	p {
		line-height: 1.7;
		color: var(--nero);
		font-size: 0.95rem;
		margin-bottom: 1rem;
	}

	@media (min-width: 768px) {
		p {
			line-height: 1.8;
			font-size: 1rem;
		}
	}

	ul {
		margin: 1rem 0 1rem 1.5rem;
		line-height: 1.8;
	}

	ul li {
		margin-bottom: 0.5rem;
		color: var(--nero);
		font-size: 0.95rem;
	}

	@media (min-width: 768px) {
		ul li {
			font-size: 1rem;
		}
	}

	strong {
		color: var(--verde-meraki);
		font-weight: 600;
	}
</style>

